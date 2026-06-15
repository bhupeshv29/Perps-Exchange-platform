import type { EngineRequest, EngineResponse } from "@repo/common";
import { balances } from "../state/state";

export async function processOnRamp(
  request: Extract<EngineRequest, { type: "ON_RAMP" }>,
): Promise<EngineResponse> {
  const { userId, amount } = request.payload;

  const balance = balances[userId] ?? {
    userId,
    available: 0,
    locked: 0,
  };

  balance.available += amount;

  balances[userId] = balance;

  return {
    type: "ON_RAMP_SUCCESS",
    requestId: request.requestId,
    payload: balance,
  };
}
