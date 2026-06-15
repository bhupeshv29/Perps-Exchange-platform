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
  const sideBook = order.side === "BID" ? book.bids : book.asks;

  if (!order.price) {
    throw new Error("limit order price is required");
  }

  if (!sideBook[order.price]) {
    sideBook[order.price] = [];
  }

  sideBook[order.price]!.push(order);
}

export function updateOrderStatus(order: Order) {
  if (order.filledQty === 0) {
    order.status = "OPEN";
    return;
  }

  if (order.filledQty < order.qty) {
    order.status = "PARTIALLY_FILLED";
    return;
  }

  order.status = "FILLED";
}

export function removeFilledOrdersFromBook(book: Orderbook) {
  for (const price of Object.keys(book.bids)) {
    book.bids[Number(price)] = book.bids[Number(price)]!.filter(
      (order) => order.filledQty < order.qty,
    );

    if (book.bids[Number(price)]!.length === 0) {
      delete book.bids[Number(price)];
    }
  }

  for (const price of Object.keys(book.asks)) {
    book.asks[Number(price)] = book.asks[Number(price)]!.filter(
      (order) => order.filledQty < order.qty,
    );

    if (book.asks[Number(price)]!.length === 0) {
      delete book.asks[Number(price)];
    }
  }
}

function aggregateSide(sideBook: Record<number, Order[]>): [number, number][] {
  return Object.entries(sideBook)
    .map(([price, orders]) => {
      const qty = orders.reduce((sum, order) => {
        return sum + (order.qty - order.filledQty);
      }, 0);

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

export function getBestAskPrice(book: Orderbook): number | null {
  const prices = Object.keys(book.asks).map(Number);

  if (prices.length === 0) {
    return null;
  }

  return Math.min(...prices);
}

export function getBestBidPrice(book: Orderbook): number | null {
  const prices = Object.keys(book.bids).map(Number);

  if (prices.length === 0) {
    return null;
  }

  return Math.max(...prices);
}

export function removeOrderFromBook(order: Order) {
  if (!order.price) return;

  const book = getOrCreateOrderbook(order.marketId);
  const sideBook = order.side === "BID" ? book.bids : book.asks;

  const ordersAtPrice = sideBook[order.price];

  if (!ordersAtPrice) return;

  const remainingOrders = ordersAtPrice.filter((o) => o.id !== order.id);

  if (remainingOrders.length === 0) {
    delete sideBook[order.price];
    return;
  }

  sideBook[order.price] = remainingOrders;
}
