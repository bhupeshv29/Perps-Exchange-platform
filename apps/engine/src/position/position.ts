import type {
  ClosedPosition,
  Fill,
  Order,
  Position,
  PositionSide,
  Side,
} from "@repo/common";
import { calculatePnlScaled } from "@repo/common";

import { balances, getPositionKey, orders, positions } from "../state/state";

export type PositionUpdateResult = {
  updatedPositions: Position[];
  closedPositions: ClosedPosition[];
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
  if (totalQty === 0) return 0;

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
    fundingPaid: 0,

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
  if (!balance) return;

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
  closedPosition: ClosedPosition | null;
} {
  const key = getPositionKey(input.userId, input.marketId, input.side);
  const position = positions[key];

  if (!position) {
    return {
      closedQty: 0,
      updatedPosition: null,
      closedPosition: null,
    };
  }

  const closeQty = Math.min(position.qty, input.qty);
  const oldQty = position.qty;
  const oldMargin = position.margin;
  const now = Date.now();

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

  const closedPosition: ClosedPosition = {
    userId: position.userId,
    marketId: position.marketId,
    side: position.side,
    qty: closeQty,
    entryPrice: position.entryPrice,
    exitPrice: input.price,
    margin: releasedMargin,
    leverage: position.leverage,
    realizedPnl,
    openedAt: position.updatedAt,
    closedAt: now,
  };

  position.qty -= closeQty;
  position.margin -= releasedMargin;
  position.realizedPnl += realizedPnl;
  position.updatedAt = now;

  settleClosedPosition(input.userId, releasedMargin, realizedPnl);

  if (position.qty === 0) {
    delete positions[key];

    return {
      closedQty: closeQty,
      updatedPosition: {
        ...position,
        qty: 0,
        margin: 0,
      },
      closedPosition,
    };
  }

  return {
    closedQty: closeQty,
    updatedPosition: position,
    closedPosition,
  };
}

function applyFillForOrder(
  order: Order,
  fill: Fill,
): {
  updatedPositions: Position[];
  closedPositions: ClosedPosition[];
} {
  const updatedPositions: Position[] = [];
  const closedPositions: ClosedPosition[] = [];

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
      updatedPositions.push(closeResult.updatedPosition);
    }

    if (closeResult.closedPosition) {
      closedPositions.push(closeResult.closedPosition);
    }
  }

  if (remainingQty > 0) {
    updatedPositions.push(
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

  return {
    updatedPositions,
    closedPositions,
  };
}

export function applyFillsToPositions(fills: Fill[]): PositionUpdateResult {
  const updatedPositions: Position[] = [];
  const closedPositions: ClosedPosition[] = [];

  for (const fill of fills) {
    const makerOrder = orders[fill.makerOrderId];
    const takerOrder = orders[fill.takerOrderId];

    if (makerOrder) {
      const result = applyFillForOrder(makerOrder, fill);
      updatedPositions.push(...result.updatedPositions);
      closedPositions.push(...result.closedPositions);
    }

    if (takerOrder) {
      const result = applyFillForOrder(takerOrder, fill);
      updatedPositions.push(...result.updatedPositions);
      closedPositions.push(...result.closedPositions);
    }
  }

  return {
    updatedPositions,
    closedPositions,
  };
}
