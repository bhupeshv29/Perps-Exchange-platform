import type {
  Depth,
  Fill,
  Order,
  Position,
  UserBalance,
  ClosedPosition,
} from "../types";

import { unscaleBalance, unscalePrice, unscaleQty } from "./scaling";

export function unscaleOrder(order: Order): Order {
  return {
    ...order,
    price:
      order.price === undefined
        ? undefined
        : unscalePrice(order.marketId, order.price),
    qty: unscaleQty(order.marketId, order.qty),
    filledQty: unscaleQty(order.marketId, order.filledQty),
    margin: unscaleBalance(order.margin),
  };
}

export function unscaleFill(fill: Fill): Fill {
  return {
    ...fill,
    price: unscalePrice(fill.marketId, fill.price),
    qty: unscaleQty(fill.marketId, fill.qty),
  };
}

export function unscaleBalanceResponse(balance: UserBalance): UserBalance {
  return {
    ...balance,
    available: unscaleBalance(balance.available),
    locked: unscaleBalance(balance.locked),
  };
}

export function unscalePosition(position: Position): Position {
  return {
    ...position,
    qty: unscaleQty(position.marketId, position.qty),
    entryPrice: unscalePrice(position.marketId, position.entryPrice),
    margin: unscaleBalance(position.margin),
    realizedPnl: unscaleBalance(position.realizedPnl),

    unrealizedPnl: unscaleBalance(position.unrealizedPnl),
    equity: unscaleBalance(position.equity),
    liquidationPrice: unscalePrice(
      position.marketId,
      position.liquidationPrice,
    ),

    fundingPaid: unscaleBalance(position.fundingPaid),

    // roi is already percentage, don't unscale
    roi: position.roi,
  };
}

export function unscaleDepth(depth: Depth): Depth {
  return {
    marketId: depth.marketId,
    bids: depth.bids.map(([price, qty]) => [
      unscalePrice(depth.marketId, price),
      unscaleQty(depth.marketId, qty),
    ]),
    asks: depth.asks.map(([price, qty]) => [
      unscalePrice(depth.marketId, price),
      unscaleQty(depth.marketId, qty),
    ]),
  };
}

export function unscaleClosedPosition(
  position: ClosedPosition,
): ClosedPosition {
  return {
    ...position,
    qty: unscaleQty(position.marketId, position.qty),
    entryPrice: unscalePrice(position.marketId, position.entryPrice),
    exitPrice: unscalePrice(position.marketId, position.exitPrice),
    margin: unscaleBalance(position.margin),
    realizedPnl: unscaleBalance(position.realizedPnl),
  };
}
