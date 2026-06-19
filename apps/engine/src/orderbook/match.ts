import { randomUUID } from "crypto";

import type { Fill, Order } from "@repo/common";

import {
  getBestAskPrice,
  getBestBidPrice,
  removeFilledOrdersFromBook,
  updateOrderStatus,
} from "./orderbook";

import type { Orderbook } from "./types";

function createFill(
  makerOrder: Order,
  takerOrder: Order,
  price: number,
  qty: number,
): Fill {
  return {
    id: randomUUID(),
    marketId: takerOrder.marketId,
    makerOrderId: makerOrder.id,
    takerOrderId: takerOrder.id,
    makerUserId: makerOrder.userId,
    takerUserId: takerOrder.userId,
    price,
    qty,

    createdAt: Date.now(),
  };
}

function getFirstNonSelfOrder(
  orders: Order[] | undefined,
  takerOrder: Order,
): Order | null {
  if (!orders) return null;
  return orders.find((order) => order.userId !== takerOrder.userId) ?? null;
}

export function matchBid(book: Orderbook, order: Order): Fill[] {
  const fills: Fill[] = [];

  while (order.filledQty < order.qty) {
    const bestAskPrice = getBestAskPrice(book);

    if (bestAskPrice === null) {
      break;
    }

    if (order.type === "LIMIT" && order.price! < bestAskPrice) {
      break;
    }

    const askOrders = book.asks[bestAskPrice];

    const makerOrder = getFirstNonSelfOrder(askOrders, order);
    if (!makerOrder) {
      break;
    }

    const remainingBidQty = order.qty - order.filledQty;

    const remainingAskQty = makerOrder.qty - makerOrder.filledQty;

    const fillQty = Math.min(remainingBidQty, remainingAskQty);

    order.filledQty += fillQty;
    makerOrder.filledQty += fillQty;

    updateOrderStatus(order);
    updateOrderStatus(makerOrder);

    fills.push(createFill(makerOrder, order, bestAskPrice, fillQty));

    removeFilledOrdersFromBook(book);
  }

  return fills;
}

export function matchAsk(book: Orderbook, order: Order): Fill[] {
  const fills: Fill[] = [];

  while (order.filledQty < order.qty) {
    const bestBidPrice = getBestBidPrice(book);

    if (bestBidPrice === null) {
      break;
    }

    if (order.type === "LIMIT" && order.price! > bestBidPrice) {
      break;
    }

    const bidOrders = book.bids[bestBidPrice];

    const makerOrder = getFirstNonSelfOrder(bidOrders, order);
    if (!makerOrder) {
      break;
    }

    const remainingAskQty = order.qty - order.filledQty;

    const remainingBidQty = makerOrder.qty - makerOrder.filledQty;

    const fillQty = Math.min(remainingAskQty, remainingBidQty);

    order.filledQty += fillQty;
    makerOrder.filledQty += fillQty;

    updateOrderStatus(order);
    updateOrderStatus(makerOrder);

    fills.push(createFill(makerOrder, order, bestBidPrice, fillQty));

    removeFilledOrdersFromBook(book);
  }

  return fills;
}
