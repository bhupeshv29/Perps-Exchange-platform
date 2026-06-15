import type { EngineRequest, EngineResponse } from "@repo/common";
import { balances, orders } from "../state/state";
import { removeOrderFromBook } from "../orderbook/orderbook";
import { getProportionalMargin } from "../position/position";

export async function processCancelOrder(
  request: Extract<EngineRequest, { type: "CANCEL_ORDER" }>,
): Promise<EngineResponse> {
  const { userId, orderId } = request.payload;

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

  return {
    type: "ORDER_CANCELLED",
    requestId: request.requestId,
    payload: {
      orderId,
    },
  };
}
