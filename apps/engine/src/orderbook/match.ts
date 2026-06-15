import { randomUUID } from "crypto";
import type { Fill, Order } from "@repo/common";
import {
  getBestAskPrice,
  getBestBidPrice,
  removeFilledOrdersFromBook,
  updateOrderStatus,
} from "./orderbook";

import type { Orderbook } from "./types";

export function matchBid(book: Orderbook, order: Order): Fill[] {
  const fills: Fill[] = [];

  while (order.filledQty < order.qty) {
    const bestAskPrice = getBestAskPrice(book);
    if (bestAskPrice === null) {
      break;
    }
    //Bid price >= ask price
    if (order.type === "LIMIT" && order.price! < bestAskPrice) {
      break;
    }

    const askOrders = book.asks[bestAskPrice];

    if (!askOrders) {
      break;
    }

    const makerOrder = askOrders[0];

    if (!makerOrder) {
      break;
    }
    //remaining Qty
    const remainingBidQty = order.qty - order.filledQty;
    const remainingAskQty = makerOrder.qty - makerOrder.filledQty;
    const fillQty = Math.min(remainingBidQty, remainingAskQty);

    //update order
    order.filledQty += fillQty;
    makerOrder.filledQty += fillQty;

    updateOrderStatus(order);
    updateOrderStatus(makerOrder);

    //create fill
    fills.push({
      id: randomUUID(),
      marketId: order.marketId,
      makerOrderId: makerOrder.id,
      takerOrderId: order.id,

      makerUserId: makerOrder.userId,
      takerUserId: order.userId,

      price: bestAskPrice,
      qty: fillQty,

      createdAt: Date.now(),
    });

    //cleanup
    removeFilledOrdersFromBook(book);
  }

  return fills;
}

//price time priority (FIFO)

export function matchAsk(book: Orderbook, order: Order): Fill[] {
  const fills: Fill[] = [];

  while (order.filledQty < order.qty) {
    const bestBidPrice = getBestBidPrice(book);

    if (bestBidPrice === null) {
      break;
    }
    //sell price <= bid price
    if (order.type === "LIMIT" && order.price! > bestBidPrice) {
      break;
    }

    const bidOrders = book.bids[bestBidPrice];

    if (!bidOrders) {
      break;
    }

    const makerOrder = bidOrders[0];

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

    fills.push({
      id: randomUUID(),

      marketId: order.marketId,

      makerOrderId: makerOrder.id,
      takerOrderId: order.id,

      makerUserId: makerOrder.userId,
      takerUserId: order.userId,

      price: bestBidPrice,
      qty: fillQty,

      createdAt: Date.now(),
    });

    removeFilledOrdersFromBook(book);
  }

  return fills;
}
