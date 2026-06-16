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

  if (order.price === undefined) {
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

function cleanupSide(sideBook: Record<number, Order[]>) {
  for (const price of Object.keys(sideBook)) {
    const level = sideBook[Number(price)];

    if (!level) continue;

    sideBook[Number(price)] = level.filter(
      (order) => order.filledQty < order.qty,
    );

    if (sideBook[Number(price)]!.length === 0) {
      delete sideBook[Number(price)];
    }
  }
}

export function removeFilledOrdersFromBook(book: Orderbook) {
  cleanupSide(book.bids);
  cleanupSide(book.asks);
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
  if (order.price === undefined) {
    return;
  }

  const book = getOrCreateOrderbook(order.marketId);

  const sideBook = order.side === "BID" ? book.bids : book.asks;

  const ordersAtPrice = sideBook[order.price];

  if (!ordersAtPrice) {
    return;
  }

  const remainingOrders = ordersAtPrice.filter((o) => o.id !== order.id);

  if (remainingOrders.length === 0) {
    delete sideBook[order.price];
    return;
  }

  sideBook[order.price] = remainingOrders;
}
