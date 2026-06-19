import type { Position, PositionSide } from "../types";
import { getMarketConfig } from "./registry";

export function calculatePnlScaled(input: {
  marketId: string;
  side: PositionSide;
  entryPrice: number;
  exitPrice: number;
  qty: number;
}): number {
  const market = getMarketConfig(input.marketId);

  if (!market) {
    throw new Error(`Unknown market: ${input.marketId}`);
  }

  const diff =
    input.side === "LONG"
      ? input.exitPrice - input.entryPrice
      : input.entryPrice - input.exitPrice;

  return Math.floor((diff * input.qty) / market.qtyScale);
}

export function getUnrealizedPnlScaled(
  position: Position,
  markPrice: number,
): number {
  return calculatePnlScaled({
    marketId: position.marketId,
    side: position.side,
    entryPrice: position.entryPrice,
    exitPrice: markPrice,
    qty: position.qty,
  });
}

export function getMaintenanceMarginScaled(position: Position): number {
  return Math.floor(position.margin * 0.1);
}

export function getEquityScaled(position: Position, markPrice: number): number {
  return position.margin + getUnrealizedPnlScaled(position, markPrice);
}

export function getLiquidationPriceScaled(position: Position): number {
  if (position.qty === 0) {
    return 0;
  }

  const market = getMarketConfig(position.marketId);

  if (!market) {
    throw new Error(`Unknown market: ${position.marketId}`);
  }

  const maintenance = getMaintenanceMarginScaled(position);

  const maxLoss = position.margin - maintenance;

  const lossPerUnit = Math.floor((maxLoss * market.qtyScale) / position.qty);

  if (position.side === "LONG") {
    return position.entryPrice - lossPerUnit;
  }

  return position.entryPrice + lossPerUnit;
}

export function getRoiScaled(position: Position, markPrice: number): number {
  if (position.margin === 0) {
    return 0;
  }

  const pnl = getUnrealizedPnlScaled(position, markPrice);

  return (pnl * 100) / position.margin;
}
