import {
  calculatePnlScaled,
  type Fill,
  type Order,
  type Position,
  type PositionSide,
  type Side,
} from "@repo/common";

import { balances, getPositionKey, orders, positions } from "../state/state";

export type PositionUpdateResult = {
  updatedPositions: Position[];
};

export function getPositionSide(side: Side): PositionSide {
  return side === "BID" ? "LONG" : "SHORT";
}

function getOppositeSide(side: PositionSide): PositionSide {
  return side === "LONG" ? "SHORT" : "LONG";
}

export function getProportionalMargin(order: Order, fillQty: number): number {
  return Math.floor((order.margin * fillQty) / order.qty);
}

function weightedAveragePrice(
  oldQty: number,
  oldPrice: number,
  newQty: number,
  newPrice: number,
): number {
  const totalQty = oldQty + newQty;

  if (totalQty === 0) {
    return 0;
  }

  return Math.floor((oldQty * oldPrice + newQty * newPrice) / totalQty);
}

function createPosition(input: {
  userId: string;
  marketId: string;
  side: PositionSide;
  qty: number;
  price: number;
  margin: number;
  leverage: number;
}): Position {
  return {
    userId: input.userId,
    marketId: input.marketId,
    side: input.side,

    qty: input.qty,
    entryPrice: input.price,

    margin: input.margin,
    leverage: input.leverage,

    realizedPnl: 0,

    unrealizedPnl: 0,
    equity: input.margin,
    liquidationPrice: 0,
    roi: 0,

    updatedAt: Date.now(),
  };
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

  const position = positions[key];

  if (!position) {
    const newPosition = createPosition(input);

    positions[key] = newPosition;

    return newPosition;
  }

  position.entryPrice = weightedAveragePrice(
    position.qty,
    position.entryPrice,
    input.qty,
    input.price,
  );

  position.qty += input.qty;
  position.margin += input.margin;
  position.updatedAt = Date.now();

  return position;
}

function settleClosedPosition(
  userId: string,
  releasedMargin: number,
  realizedPnl: number,
) {
  const balance = balances[userId];

  if (!balance) {
    return;
  }

  balance.locked -= releasedMargin;
  balance.available += releasedMargin + realizedPnl;
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

  const realizedPnl = calculatePnlScaled({
    marketId: input.marketId,
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

  settleClosedPosition(input.userId, releasedMargin, realizedPnl);

  if (position.qty === 0) {
    delete positions[key];
  }

  return {
    closedQty: closeQty,
    updatedPosition: position,
  };
}

function applyFillForOrder(order: Order, fill: Fill): Position[] {
  const updated: Position[] = [];

  const incomingSide = getPositionSide(order.side);

  const oppositeSide = getOppositeSide(incomingSide);

  const oppositePosition =
    positions[getPositionKey(order.userId, order.marketId, oppositeSide)];

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
      updated.push(closeResult.updatedPosition);
    }
  }

  if (remainingQty > 0) {
    updated.push(
      increasePosition({
        userId: order.userId,
        marketId: order.marketId,
        side: incomingSide,
        qty: remainingQty,
        price: fill.price,
        margin: getProportionalMargin(order, remainingQty),
        leverage: order.leverage,
      }),
    );
  }

  return updated;
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
