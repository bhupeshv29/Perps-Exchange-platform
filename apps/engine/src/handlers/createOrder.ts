import { randomUUID } from "crypto";
import type {
  EngineRequest,
  EngineResponse,
  Fill,
  Order,
  Position,
} from "@repo/common";
import { getMarketConfig } from "@repo/common";

import { balances, orders, positions, getPositionKey } from "../state/state";

import {
  addOrderToBook,
  getBestAskPrice,
  getBestBidPrice,
  getDepth,
  getOrCreateOrderbook,
  updateOrderStatus,
} from "../orderbook/orderbook";

import { matchAsk, matchBid } from "../orderbook/match";

import {
  applyFillsToPositions,
  getProportionalMargin,
  getPositionSide,
} from "../position/position";

import { publishDbEvent, publishWsEvent } from "../publish/events";

function reject(requestId: string, error: string): EngineResponse {
  return {
    type: "ORDER_REJECTED",
    requestId,
    error,
  };
}

function getOppositePositionForReduceOnly(orderInput: {
  userId: string;
  marketId: string;
  side: Order["side"];
}) {
  const incomingSide = getPositionSide(orderInput.side);
  const oppositeSide = incomingSide === "LONG" ? "SHORT" : "LONG";

  return positions[
    getPositionKey(orderInput.userId, orderInput.marketId, oppositeSide)
  ];
}

function getExecutionPriceForMargin(input: {
  orderType: Order["type"];
  price?: number;
  side: Order["side"];
  book: ReturnType<typeof getOrCreateOrderbook>;
}): number | null {
  if (input.orderType === "LIMIT") {
    return input.price ?? null;
  }

  if (input.side === "BID") {
    return getBestAskPrice(input.book);
  }

  return getBestBidPrice(input.book);
}

function calculateOrderMargin(input: {
  price: number;
  qty: number;
  leverage: number;
  qtyScale: number;
}): number {
  const positionValue = Math.floor((input.price * input.qty) / input.qtyScale);
  return Math.floor(positionValue / input.leverage);
}

function buildOrder(
  payload: Extract<EngineRequest, { type: "CREATE_ORDER" }>["payload"],
  margin: number,
): Order {
  return {
    id: randomUUID(),

    userId: payload.userId,
    marketId: payload.marketId,

    side: payload.side,
    type: payload.orderType,

    price: payload.price,

    qty: payload.qty,
    filledQty: 0,

    margin,
    leverage: payload.leverage,
    reduceOnly: payload.reduceOnly ?? false,
    status: "OPEN",

    createdAt: Date.now(),
  };
}

function releaseUnfilledMargin(order: Order) {
  const balance = balances[order.userId];

  if (!balance) return;

  const filledMargin = getProportionalMargin(order, order.filledQty);
  const unusedMargin = order.margin - filledMargin;

  if (unusedMargin <= 0) return;

  balance.locked -= unusedMargin;
  balance.available += unusedMargin;
}

async function publishFills(fills: Fill[], marketId: string) {
  for (const fill of fills) {
    void publishDbEvent({
      type: "FILL_CREATED",
      payload: fill,
      createdAt: Date.now(),
    });

    void publishWsEvent({
      type: "TRADE_UPDATE",
      marketId,
      payload: fill,
      createdAt: Date.now(),
    });
  }
}

async function publishPositions(positions: Position[]) {
  for (const position of positions) {
    void publishWsEvent({
      type: "POSITION_UPDATE",
      userId: position.userId,
      payload: position,
      createdAt: Date.now(),
    });
  }
}

export async function processCreateOrder(
  request: Extract<EngineRequest, { type: "CREATE_ORDER" }>,
): Promise<EngineResponse> {
  const {
    userId,
    marketId,
    side,
    orderType,
    price,
    qty,
    leverage,
    reduceOnly,
  } = request.payload;

  const market = getMarketConfig(marketId);

  if (!market || !market.isActive) {
    return reject(request.requestId, "invalid market");
  }

  if (leverage > market.maxLeverage) {
    return reject(request.requestId, "leverage too high for market");
  }

  if (orderType === "LIMIT" && price === undefined) {
    return reject(request.requestId, "limit order price is required");
  }

  const book = getOrCreateOrderbook(marketId);

  const executionPrice = getExecutionPriceForMargin({
    orderType,
    price,
    side,
    book,
  });

  if (!executionPrice) {
    return reject(request.requestId, "no liquidity for market order");
  }

  if (reduceOnly) {
    const oppositePosition = getOppositePositionForReduceOnly({
      userId,
      marketId,
      side,
    });

    if (!oppositePosition) {
      return reject(request.requestId, "no position to reduce");
    }

    if (qty > oppositePosition.qty) {
      return reject(request.requestId, "reduce only qty exceeds position size");
    }
  }

  const margin = reduceOnly
    ? 0
    : calculateOrderMargin({
        price: executionPrice,
        qty,
        leverage,
        qtyScale: market.qtyScale,
      });

  if (!reduceOnly && margin <= 0) {
    return reject(request.requestId, "invalid margin");
  }
  const balance = balances[userId];

  if (!balance) {
    return reject(request.requestId, "balance not found");
  }

  if (!reduceOnly && balance.available < margin) {
    return reject(request.requestId, "insufficient balance");
  }

  if (!reduceOnly) {
    balance.available -= margin;
    balance.locked += margin;
  }

  const order = buildOrder(request.payload, margin);

  orders[order.id] = order;

  void publishDbEvent({
    type: "ORDER_CREATED",
    payload: order,
    createdAt: Date.now(),
  });

  const fills = side === "BID" ? matchBid(book, order) : matchAsk(book, order);

  updateOrderStatus(order);

  const { updatedPositions, closedPositions } = applyFillsToPositions(fills);

  const remainingQty = order.qty - order.filledQty;

  if (remainingQty > 0 && order.type === "LIMIT") {
    if (order.reduceOnly) {
      order.status = order.filledQty > 0 ? "PARTIALLY_FILLED" : "REJECTED";
    } else {
      addOrderToBook(order);
    }
  }

  if (remainingQty > 0 && order.type === "MARKET") {
    releaseUnfilledMargin(order);

    if (order.filledQty === 0) {
      order.status = "REJECTED";

      void publishDbEvent({
        type: "ORDER_UPDATED",
        payload: order,
        createdAt: Date.now(),
      });

      void publishDbEvent({
        type: "BALANCE_UPDATED",
        payload: balance,
        createdAt: Date.now(),
      });

      void publishWsEvent({
        type: "ORDER_UPDATE",
        userId,
        payload: order,
        createdAt: Date.now(),
      });

      void publishWsEvent({
        type: "BALANCE_UPDATE",
        userId,
        payload: balance,
        createdAt: Date.now(),
      });

      return reject(request.requestId, "market order could not be filled");
    }
  }

  await publishFills(fills, marketId);
  await publishPositions(updatedPositions);

  for (const closedPosition of closedPositions) {
    void publishDbEvent({
      type: "CLOSED_POSITION_CREATED",
      payload: closedPosition,
      createdAt: Date.now(),
    });
  }

  void publishDbEvent({
    type: "ORDER_UPDATED",
    payload: order,
    createdAt: Date.now(),
  });

  void publishDbEvent({
    type: "BALANCE_UPDATED",
    payload: balance,
    createdAt: Date.now(),
  });

  void publishWsEvent({
    type: "ORDER_UPDATE",
    userId,
    payload: order,
    createdAt: Date.now(),
  });

  void publishWsEvent({
    type: "BALANCE_UPDATE",
    userId,
    payload: balance,
    createdAt: Date.now(),
  });

  void publishWsEvent({
    type: "DEPTH_UPDATE",
    marketId,
    payload: getDepth(marketId),
    createdAt: Date.now(),
  });

  return {
    type: "ORDER_ACCEPTED",
    requestId: request.requestId,
    payload: {
      order,
      fills,
    },
  };
}
