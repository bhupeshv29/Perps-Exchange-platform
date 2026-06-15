import type { EngineRequest, EngineResponse } from "@repo/common";
import { balances, orders } from "../state/state";
import { getDepth, removeOrderFromBook } from "../orderbook/orderbook";
import { getProportionalMargin } from "../position/position";
import { publishDbEvent, publishWsEvent } from "../publish/events";

export async function processCancelOrder(
  request: Extract<EngineRequest, { type: "CANCEL_ORDER" }>,
): Promise<EngineResponse> {
  const { userId, marketId, orderId } = request.payload;

  const order = orders[orderId];

  if (!order) {
    return {
      type: "ERROR",
      requestId: request.requestId,
      error: "order not found",
    };
  }

  if (order.userId !== userId) {
    return {
      type: "ERROR",
      requestId: request.requestId,
      error: "unauthorized order cancel",
    };
  }

  if (order.status === "FILLED" || order.status === "CANCELLED") {
    return {
      type: "ERROR",
      requestId: request.requestId,
      error: "order cannot be cancelled",
    };
  }

  removeOrderFromBook(order);

  const balance = balances[userId];

  if (balance) {
    const filledMargin = getProportionalMargin(order, order.filledQty);
    const releasableMargin = order.margin - filledMargin;

    balance.locked -= releasableMargin;
    balance.available += releasableMargin;
  }

  order.status = "CANCELLED";

  await publishDbEvent({
    type: "ORDER_UPDATED",
    payload: order,
    createdAt: Date.now(),
  });
  await publishDbEvent({
    type: "BALANCE_UPDATED",
    payload: balance!,
    createdAt: Date.now(),
  });

  await publishWsEvent({
    type: "ORDER_UPDATE",
    userId,
    payload: order,
    createdAt: Date.now(),
  });

  if (balance) {
    await publishWsEvent({
      type: "BALANCE_UPDATE",
      userId,
      payload: balance,
      createdAt: Date.now(),
    });
  }

  await publishWsEvent({
    type: "DEPTH_UPDATE",
    marketId,
    payload: getDepth(marketId),
    createdAt: Date.now(),
  });

  return {
    type: "ORDER_CANCELLED",
    requestId: request.requestId,
    payload: {
      orderId,
    },
  };
}
