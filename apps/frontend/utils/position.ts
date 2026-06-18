import type { Position } from "@repo/common";

export function calculateUnrealizedPnl(
  position: Position,
  markPrice: number,
): number {
  if (!markPrice) return 0;

  if (position.side === "LONG") {
    return (markPrice - position.entryPrice) * position.qty;
  }

  return (position.entryPrice - markPrice) * position.qty;
}

export function calculateRoi(
  position: Position,
  unrealizedPnl: number,
): number {
  if (position.margin === 0) return 0;

  return (unrealizedPnl / position.margin) * 100;
}

export function calculateLiquidationPrice(position: Position): number {
  if (position.qty === 0) return 0;

  const maintenanceMargin = position.margin * 0.1;
  const maxLoss = position.margin - maintenanceMargin;
  const lossPerUnit = maxLoss / position.qty;

  if (position.side === "LONG") {
    return position.entryPrice - lossPerUnit;
  }

  return position.entryPrice + lossPerUnit;
}
