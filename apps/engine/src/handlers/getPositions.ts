import type { EngineRequest, EngineResponse } from "@repo/common";

import { positions } from "../state/state";

export async function processGetPositions(
  request: Extract<EngineRequest, { type: "GET_POSITIONS" }>,
): Promise<EngineResponse> {
  return {
    type: "POSITIONS",
    requestId: request.requestId,
    payload: Object.values(positions).filter(
      (position) => position.userId === request.payload.userId,
    ),
  };
}
