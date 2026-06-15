import type { Depth, Order } from "@repo/common";
import { orderbooks } from "../state/state";
import type { Orderbook } from "./types";

export function getOrCreateOrderbook(marketId: string): Orderbook {
  if (!orderbooks[marketId]) {
    orderbooks[marketId] = {
      marketId,
      bids: {},
      asks: {},
    };
  }

  return orderbooks[marketId];
}

export function addOrderToBook(order: Order) {
  const book = getOrCreateOrderbook(order.marketId);
  const sideBook = order.side === "BUY" ? book.bids : book.asks;
  const price = order.price!;

  if (!sideBook[price]) {
    sideBook[price] = [];
  }

  sideBook[price].push(order);
}

function aggregateSide(sideBook: Record<number, Order[]>): [number, number][] {
  return Object.entries(sideBook)
    .map(([price, orders]) => {
      const qty = orders.reduce(
        (sum, order) => sum + (order.qty - order.filledQty),
        0,
      );

      return [Number(price), qty] as [number, number];
    })
    .filter(([, qty]) => qty > 0);
}

export function getDepth(marketId: string): Depth {
  const book = getOrCreateOrderbook(marketId);

  return {
    marketId,
    bids: aggregateSide(book.bids).sort((a, b) => b[0] - a[0]),
    asks: aggregateSide(book.asks).sort((a, b) => a[0] - b[0]),
  };
}
