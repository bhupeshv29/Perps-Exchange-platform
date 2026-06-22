import type { EngineRequest, EngineResponse, UserBalance } from "@repo/common";

import { balances } from "../state/state";
import { publishDbEvent, publishWsEvent } from "../publish/events";

export async function processOnRamp(
  request: Extract<EngineRequest, { type: "ON_RAMP" }>,
): Promise<EngineResponse> {
  const { userId, amount } = request.payload;

  const balance: UserBalance = balances[userId] ?? {
    userId,
    available: 0,
    locked: 0,
  };

  balance.available += amount;

  balances[userId] = balance;

  const now = Date.now();

  void publishDbEvent({
    type: "BALANCE_UPDATED",
    payload: balance,
    createdAt: now,
  });

  void publishWsEvent({
    type: "BALANCE_UPDATE",
    userId,
    payload: balance,
    createdAt: now,
  });

  return {
    type: "ON_RAMP_SUCCESS",
    requestId: request.requestId,
    payload: balance,
  };
}
