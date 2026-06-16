import { randomUUID } from "crypto";
import type {
  EngineRequest,
  EngineResponse,
  Fill,
  Order,
  Position,
} from "@repo/common";

import { balances, orders } from "../state/state";

import {
  addOrderToBook,
  getDepth,
  getOrCreateOrderbook,
  updateOrderStatus,
} from "../orderbook/orderbook";

import { matchAsk, matchBid } from "../orderbook/match";

import {
  applyFillsToPositions,
  getProportionalMargin,
} from "../position/position";

import { publishDbEvent, publishWsEvent } from "../publish/events";
import { getMarketConfig } from "../market/registry";

function reject(requestId: string, error: string): EngineResponse {
  return {
    type: "ORDER_REJECTED",
    requestId,
    error,
  };
}

function buildOrder(
  payload: Extract<EngineRequest, { type: "CREATE_ORDER" }>["payload"],
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

    margin: payload.margin,
    leverage: payload.leverage,

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
  const { userId, marketId, side, orderType, price, qty, margin, leverage } =
    request.payload;

  const market = getMarketConfig(marketId);

  if (!market || !market.isActive) {
    return reject(request.requestId, "invalid market");
  }

  if (leverage > market.maxLeverage) {
    return reject(request.requestId, "leverage too high for market");
  }

  const balance = balances[userId];

  if (!balance) {
    return reject(request.requestId, "balance not found");
  }

  if (balance.available < margin) {
    return reject(request.requestId, "insufficient balance");
  }

  if (orderType === "LIMIT" && price === undefined) {
    return reject(request.requestId, "limit order price is required");
  }

  balance.available -= margin;
  balance.locked += margin;

  const order = buildOrder(request.payload);

  orders[order.id] = order;

  void publishDbEvent({
    type: "ORDER_CREATED",
    payload: order,
    createdAt: Date.now(),
  });

  const book = getOrCreateOrderbook(marketId);

  const fills = side === "BID" ? matchBid(book, order) : matchAsk(book, order);

  updateOrderStatus(order);

  const { updatedPositions } = applyFillsToPositions(fills);

  const remainingQty = order.qty - order.filledQty;

  if (remainingQty > 0 && order.type === "LIMIT") {
    addOrderToBook(order);
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
