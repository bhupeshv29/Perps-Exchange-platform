import type { DbEvent } from "@repo/common";
import { prisma } from "@repo/db";

export async function handleDbEvent(event: DbEvent) {
  switch (event.type) {
    case "ORDER_CREATED": {
      const order = event.payload;

      await prisma.order.upsert({
        where: {
          id: order.id,
        },
        update: {
          userId: order.userId,
          marketId: order.marketId,
          side: order.side,
          type: order.type,
          status: order.status,
          price: order.price,
          qty: order.qty,
          filledQty: order.filledQty,
          margin: order.margin,
          leverage: order.leverage,
        },
        create: {
          id: order.id,
          userId: order.userId,
          marketId: order.marketId,
          side: order.side,
          type: order.type,
          status: order.status,
          price: order.price,
          qty: order.qty,
          filledQty: order.filledQty,
          margin: order.margin,
          leverage: order.leverage,
          createdAt: new Date(order.createdAt),
        },
      });

      return;
    }

    case "ORDER_UPDATED": {
      const order = event.payload;

      await prisma.order.update({
        where: {
          id: order.id,
        },
        data: {
          status: order.status,
          filledQty: order.filledQty,
          price: order.price,
          qty: order.qty,
          margin: order.margin,
          leverage: order.leverage,
        },
      });

      return;
    }

    case "FILL_CREATED": {
      const fill = event.payload;

      await prisma.fill.upsert({
        where: {
          id: fill.id,
        },
        update: {},
        create: {
          id: fill.id,
          marketId: fill.marketId,
          makerOrderId: fill.makerOrderId,
          takerOrderId: fill.takerOrderId,
          makerUserId: fill.makerUserId,
          takerUserId: fill.takerUserId,
          price: fill.price,
          qty: fill.qty,
          createdAt: new Date(fill.createdAt),
        },
      });

      return;
    }

    case "BALANCE_UPDATED": {
      const balance = event.payload;

      await prisma.balance.upsert({
        where: {
          userId: balance.userId,
        },
        update: {
          available: balance.available,
          locked: balance.locked,
        },
        create: {
          userId: balance.userId,
          available: balance.available,
          locked: balance.locked,
        },
      });

      return;
    }

    case "CLOSED_POSITION_CREATED": {
      const position = event.payload;

      await prisma.closedPosition.create({
        data: {
          userId: position.userId,
          marketId: position.marketId,
          side: position.side,
          qty: position.qty,
          entryPrice: position.entryPrice,
          exitPrice: position.exitPrice,
          margin: position.margin,
          leverage: position.leverage,
          realizedPnl: position.realizedPnl,
          openedAt: new Date(position.openedAt),
          closedAt: new Date(position.closedAt),
        },
      });

      return;
    }
  }
}
