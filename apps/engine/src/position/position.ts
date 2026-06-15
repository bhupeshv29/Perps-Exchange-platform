import type { Fill, Order, Position, PositionSide, Side } from "@repo/common";
import { balances, getPositionKey, orders, positions } from "../state/state";

export type PositionUpdateResult = {
  updatedPositions: Position[];
};

export function getPositionSide(orderSide: Side): PositionSide {
  return orderSide === "BID" ? "LONG" : "SHORT";
}

function getOppositeSide(side: PositionSide): PositionSide {
  return side === "LONG" ? "SHORT" : "LONG";
}

export function getProportionalMargin(order: Order, fillQty: number): number {
  return Math.floor((order.margin * fillQty) / order.qty);
}

function weightedAveragePrice(input: {
  oldQty: number;
  oldPrice: number;
  newQty: number;
  newPrice: number;
}) {
  const totalQty = input.oldQty + input.newQty;
  if (totalQty === 0) return 0;

  return Math.floor(
    (input.oldQty * input.oldPrice + input.newQty * input.newPrice) / totalQty,
  );
}

function calculatePnl(input: {
  side: PositionSide;
  entryPrice: number;
  exitPrice: number;
  qty: number;
}) {
  if (input.side === "LONG") {
    return (input.exitPrice - input.entryPrice) * input.qty;
  }

  return (input.entryPrice - input.exitPrice) * input.qty;
}

function increasePosition(input: {
  userId: string;
  marketId: string;
  side: PositionSide;
  qty: number;
  price: number;
  margin: number;
  leverage: number;
}): Position {
  const key = getPositionKey(input.userId, input.marketId, input.side);
  const existingPosition = positions[key];

  if (!existingPosition) {
    const position: Position = {
      userId: input.userId,
      marketId: input.marketId,
      side: input.side,
      qty: input.qty,
      entryPrice: input.price,
      margin: input.margin,
      leverage: input.leverage,
      realizedPnl: 0,
      updatedAt: Date.now(),
    };

    positions[key] = position;
    return position;
  }

  existingPosition.entryPrice = weightedAveragePrice({
    oldQty: existingPosition.qty,
    oldPrice: existingPosition.entryPrice,
    newQty: input.qty,
    newPrice: input.price,
  });

  existingPosition.qty += input.qty;
  existingPosition.margin += input.margin;
  existingPosition.updatedAt = Date.now();

  return existingPosition;
}

function closePosition(input: {
  userId: string;
  marketId: string;
  side: PositionSide;
  qty: number;
  price: number;
}): {
  closedQty: number;
  updatedPosition: Position | null;
} {
  const key = getPositionKey(input.userId, input.marketId, input.side);
  const position = positions[key];

  if (!position) {
    return {
      closedQty: 0,
      updatedPosition: null,
    };
  }

  const closeQty = Math.min(position.qty, input.qty);

  const realizedPnl = calculatePnl({
    side: position.side,
    entryPrice: position.entryPrice,
    exitPrice: input.price,
    qty: closeQty,
  });

  const releasedMargin = Math.floor(
    (position.margin * closeQty) / position.qty,
  );

  position.qty -= closeQty;
  position.margin -= releasedMargin;
  position.realizedPnl += realizedPnl;
  position.updatedAt = Date.now();

  const balance = balances[input.userId];

  if (balance) {
    balance.locked -= releasedMargin;
    balance.available += releasedMargin + realizedPnl;
  }

  if (position.qty === 0) {
    delete positions[key];
  }

  return {
    closedQty: closeQty,
    updatedPosition: position,
  };
}

function applyFillForOrder(order: Order, fill: Fill): Position[] {
  const updatedPositions: Position[] = [];

  const incomingSide = getPositionSide(order.side);
  const oppositeSide = getOppositeSide(incomingSide);

  const oppositeKey = getPositionKey(
    order.userId,
    order.marketId,
    oppositeSide,
  );
  const oppositePosition = positions[oppositeKey];

  let remainingQty = fill.qty;

  if (oppositePosition) {
    const closeResult = closePosition({
      userId: order.userId,
      marketId: order.marketId,
      side: oppositeSide,
      qty: remainingQty,
      price: fill.price,
    });

    remainingQty -= closeResult.closedQty;

    if (closeResult.updatedPosition) {
      updatedPositions.push(closeResult.updatedPosition);
    }
  }

  if (remainingQty > 0) {
    const position = increasePosition({
      userId: order.userId,
      marketId: order.marketId,
      side: incomingSide,
      qty: remainingQty,
      price: fill.price,
      margin: getProportionalMargin(order, remainingQty),
      leverage: order.leverage,
    });

    updatedPositions.push(position);
  }

  return updatedPositions;
}

export function applyFillsToPositions(fills: Fill[]): PositionUpdateResult {
  const updatedPositions: Position[] = [];

  for (const fill of fills) {
    const makerOrder = orders[fill.makerOrderId];
    const takerOrder = orders[fill.takerOrderId];

    if (makerOrder) {
      updatedPositions.push(...applyFillForOrder(makerOrder, fill));
    }

    if (takerOrder) {
      updatedPositions.push(...applyFillForOrder(takerOrder, fill));
    }
  }

  return {
    updatedPositions,
  };
}
