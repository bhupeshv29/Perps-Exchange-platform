import type { EngineRequest, EngineResponse } from "@repo/common";
import { positions } from "../state/state";

export async function processGetPositions(
  request: Extract<EngineRequest, { type: "GET_POSITIONS" }>,
): Promise<EngineResponse> {
  const { userId } = request.payload;

  const userPositions = Object.values(positions).filter(
    (position) => position.userId === userId,
  );

  return {
    type: "POSITIONS",
    requestId: request.requestId,
    payload: userPositions,
  };
}
