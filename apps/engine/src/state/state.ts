import type { Order, Position, PositionSide, UserBalance } from "@repo/common";
import type { Orderbook } from "../orderbook/types";

export const balances: Record<string, UserBalance> = {};
export const positions: Record<string, Position> = {};
export const orders: Record<string, Order> = {};
export const orderbooks: Record<string, Orderbook> = {};
export const markPrices: Record<string, number> = {};

export function getPositionKey(
  userId: string,
  marketId: string,
  side: PositionSide,
) {
  return `${userId}:${marketId}:${side}`;
}
