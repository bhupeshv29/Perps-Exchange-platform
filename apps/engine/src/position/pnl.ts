import type { Position } from "@repo/common";

export function getUnrealizedPnl(
  position: Position,
  markPrice: number,
): number {
  if (position.side === "LONG") {
    return (markPrice - position.entryPrice) * position.qty;
  }

  return (position.entryPrice - markPrice) * position.qty;
}

export function getEquity(position: Position, markPrice: number): number {
  return position.margin + getUnrealizedPnl(position, markPrice);
}

export function getMaintenanceMargin(position: Position): number {
  return Math.floor(position.margin * 0.1);
}

export function getLiquidationPrice(position: Position): number {
  const maintenanceMargin = getMaintenanceMargin(position);

  const maxLoss = position.margin - maintenanceMargin;

  const lossPerUnit = Math.floor(maxLoss / position.qty);

  if (position.side === "LONG") {
    return position.entryPrice - lossPerUnit;
  }

  return position.entryPrice + lossPerUnit;
}
