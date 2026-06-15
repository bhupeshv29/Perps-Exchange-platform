import type { EngineRequest, EngineResponse } from "@repo/common";
import { balances } from "../state/state";
import { publishDbEvent, publishWsEvent } from "../publish/events";

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

  await publishDbEvent({
    type: "BALANCE_UPDATED",
    payload: balance,
    createdAt: Date.now(),
  });

  await publishWsEvent({
    type: "BALANCE_UPDATE",
    userId,
    payload: balance,
    createdAt: Date.now(),
  });

  return {
    type: "ON_RAMP_SUCCESS",
    requestId: request.requestId,
    payload: balance,
  };
}
