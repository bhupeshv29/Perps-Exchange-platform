import type { EngineRequest, EngineResponse } from "@repo/common";

import { processOnRamp } from "./handlers/onRamp";
import { processGetBalance } from "./handlers/getBalance";
import { processGetPositions } from "./handlers/getPositions";
import { processGetDepth } from "./handlers/getDepth";
import { processCreateOrder } from "./handlers/createOrder";
import { processCancelOrder } from "./handlers/cancelOrder";

export async function processEngineRequest(
  request: EngineRequest,
): Promise<EngineResponse> {
  switch (request.type) {
    case "ON_RAMP":
      return processOnRamp(request);

    case "GET_BALANCE":
      return processGetBalance(request);

    case "GET_POSITIONS":
      return processGetPositions(request);

    case "GET_DEPTH":
      return processGetDepth(request);

    case "CREATE_ORDER":
      return processCreateOrder(request);

    case "CANCEL_ORDER":
      return processCancelOrder(request);
  }
}
