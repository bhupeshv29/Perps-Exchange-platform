import type {
  Order,
  Position,
  UserBalance,
} from "@repo/common";

import type { Orderbook } from "../orderbook/types";

export type EngineSnapshot = {
  balances: Record<string, UserBalance>;
  positions: Record<string, Position>;
  orders: Record<string, Order>;
  orderbooks: Record<string, Orderbook>;
  markPrices: Record<string, number>;

  createdAt: number;
};