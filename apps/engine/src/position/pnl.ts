import type { Position, PositionSide } from "@repo/common";

export function calculatePnl(input: {
  side: PositionSide;
  entryPrice: number;
  exitPrice: number;
  qty: number;
}): number {
  if (input.side === "LONG") {
    return (input.exitPrice - input.entryPrice) * input.qty;
  }

  return (input.entryPrice - input.exitPrice) * input.qty;
}

export function getUnrealizedPnl(
  position: Position,
  markPrice: number,
): number {
  return calculatePnl({
    side: position.side,
    entryPrice: position.entryPrice,
    exitPrice: markPrice,
    qty: position.qty,
  });
}

export function getEquity(
  position: Position,
  markPrice: number,
): number {
  return position.margin + getUnrealizedPnl(position, markPrice);
}

export function getMaintenanceMargin(
  position: Position,
): number {
  return Math.floor(position.margin * 0.1);
}

export function getLiquidationPrice(
  position: Position,
): number {
  const maintenanceMargin =
    getMaintenanceMargin(position);

  const maxLoss =
    position.margin - maintenanceMargin;

  const lossPerUnit = Math.floor(
    maxLoss / position.qty,
  );

  if (position.side === "LONG") {
    return position.entryPrice - lossPerUnit;
  }

  return position.entryPrice + lossPerUnit;
}