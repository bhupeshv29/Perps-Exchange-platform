import type { EngineRequest, EngineResponse } from "@repo/common";
import { getDepth } from "../orderbook/orderbook";

export async function processGetDepth(
  request: Extract<EngineRequest, { type: "GET_DEPTH" }>,
): Promise<EngineResponse> {
  return {
    type: "DEPTH",
    requestId: request.requestId,
    payload: getDepth(request.payload.marketId),
  };
}
