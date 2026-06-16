import { randomUUID } from "crypto";
import type { EngineRequest, EngineResponse, Order } from "@repo/common";
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

function releaseUnfilledMargin(order: Order) {
  const balance = balances[order.userId];

  if (!balance) return;

  const filledMargin = getProportionalMargin(order, order.filledQty);
  const unusedMargin = order.margin - filledMargin;

  if (unusedMargin <= 0) return;

  balance.locked -= unusedMargin;
  balance.available += unusedMargin;
}

export async function processCreateOrder(
  request: Extract<EngineRequest, { type: "CREATE_ORDER" }>,
): Promise<EngineResponse> {
  const { userId, marketId, side, orderType, price, qty, margin, leverage } =
    request.payload;

  const balance = balances[userId];

  const market = getMarketConfig(marketId);

  if (!market || !market.isActive) {
    return {
      type: "ORDER_REJECTED",
      requestId: request.requestId,
      error: "invalid market",
    };
  }

  if (leverage > market.maxLeverage) {
    return {
      type: "ORDER_REJECTED",
      requestId: request.requestId,
      error: "leverage too high for market",
    };
  }

  if (!balance) {
    return {
      type: "ORDER_REJECTED",
      requestId: request.requestId,
      error: "balance not found",
    };
  }

  if (balance.available < margin) {
    return {
      type: "ORDER_REJECTED",
      requestId: request.requestId,
      error: "insufficient balance",
    };
  }

  if (orderType === "LIMIT" && price === undefined) {
    return {
      type: "ORDER_REJECTED",
      requestId: request.requestId,
      error: "limit order price is required",
    };
  }

  balance.available -= margin;
  balance.locked += margin;

  const order: Order = {
    id: randomUUID(),
    userId,
    marketId,
    side,
    type: orderType,
    price,
    qty,
    filledQty: 0,
    margin,
    leverage,
    status: "OPEN",
    createdAt: Date.now(),
  };

  orders[order.id] = order;

  await publishDbEvent({
    type: "ORDER_CREATED",
    payload: order,
    createdAt: Date.now(),
  });

  const book = getOrCreateOrderbook(marketId);

  const fills = side === "BID" ? matchBid(book, order) : matchAsk(book, order);

  updateOrderStatus(order);

  const positionResult = applyFillsToPositions(fills);

  const remainingQty = order.qty - order.filledQty;

  if (remainingQty > 0 && order.type === "LIMIT") {
    addOrderToBook(order);
  }

  if (remainingQty > 0 && order.type === "MARKET") {
    releaseUnfilledMargin(order);

    if (order.filledQty === 0) {
      order.status = "REJECTED";

      await publishDbEvent({
        type: "ORDER_UPDATED",
        payload: order,
        createdAt: Date.now(),
      });

      await publishDbEvent({
        type: "BALANCE_UPDATED",
        payload: balance,
        createdAt: Date.now(),
      });

      await publishWsEvent({
        type: "ORDER_UPDATE",
        userId,
        payload: order,
        createdAt: Date.now(),
      });

      await publishWsEvent({
        type: "BALANCE_UPDATE",
        userId,
        payload: balance,
        createdAt: Date.now(),
      });

      return {
        type: "ORDER_REJECTED",
        requestId: request.requestId,
        error: "market order could not be filled",
      };
    }
  }

  for (const fill of fills) {
    await publishDbEvent({
      type: "FILL_CREATED",
      payload: fill,
      createdAt: Date.now(),
    });

    await publishWsEvent({
      type: "TRADE_UPDATE",
      marketId,
      payload: fill,
      createdAt: Date.now(),
    });
  }

  for (const position of positionResult.updatedPositions) {
    await publishDbEvent({
      type: "POSITION_UPDATED",
      payload: position,
      createdAt: Date.now(),
    });

    await publishWsEvent({
      type: "POSITION_UPDATE",
      userId: position.userId,
      payload: position,
      createdAt: Date.now(),
    });
  }

  await publishDbEvent({
    type: "ORDER_UPDATED",
    payload: order,
    createdAt: Date.now(),
  });

  await publishDbEvent({
    type: "BALANCE_UPDATED",
    payload: balance,
    createdAt: Date.now(),
  });

  await publishWsEvent({
    type: "ORDER_UPDATE",
    userId,
    payload: order,
    createdAt: Date.now(),
  });

  await publishWsEvent({
    type: "BALANCE_UPDATE",
    userId,
    payload: balance,
    createdAt: Date.now(),
  });

  await publishWsEvent({
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
