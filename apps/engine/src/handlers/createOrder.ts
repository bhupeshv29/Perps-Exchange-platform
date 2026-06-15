import { randomUUID } from "crypto";

import type { EngineRequest, EngineResponse, Order } from "@repo/common";

import { balances, orders } from "../state/state";

import { addOrderToBook } from "../orderbook/orderbook";

export async function processCreateOrder(
  request: Extract<EngineRequest, { type: "CREATE_ORDER" }>,
): Promise<EngineResponse> {
  const { userId, marketId, side, orderType, price, qty, margin, leverage } =
    request.payload;

  const balance = balances[userId];

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

  if (order.type === "LIMIT") {
    addOrderToBook(order);
  }

  return {
    type: "ORDER_ACCEPTED",
    requestId: request.requestId,
    payload: {
      order,
      fills: [],
    },
  };
}
