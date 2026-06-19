import {
  getEquityScaled,
  getLiquidationPriceScaled,
  getRoiScaled,
  getUnrealizedPnlScaled,
} from "@repo/common";

import type { Position } from "@repo/common";

export function updatePositionMetrics(position: Position, markPrice: number) {
  position.unrealizedPnl = getUnrealizedPnlScaled(position, markPrice);

  position.equity = getEquityScaled(position, markPrice);

  position.liquidationPrice = getLiquidationPriceScaled(position);

  position.roi = getRoiScaled(position, markPrice);
}
