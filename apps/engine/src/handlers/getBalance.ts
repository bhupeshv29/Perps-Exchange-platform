import type { EngineRequest, EngineResponse } from "@repo/common";
import { balances } from "../state/state";

export async function processGetBalance(
  request: Extract<EngineRequest, { type: "GET_BALANCE" }>,
): Promise<EngineResponse> {
  const { userId } = request.payload;

  const balance = balances[userId] ?? {
    userId,
    available: 0,
    locked: 0,
  };

  return {
    type: "BALANCE",
    requestId: request.requestId,
    payload: balance,
  };
}
