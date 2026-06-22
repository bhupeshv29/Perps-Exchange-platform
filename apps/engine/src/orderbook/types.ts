import type { Order } from "@repo/common";

export type Orderbook = {
  marketId: string;
  bids: Record<number, Order[]>;
  asks: Record<number, Order[]>;
};
