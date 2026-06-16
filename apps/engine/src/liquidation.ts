import type { ClosedPosition } from "@repo/common";

import { positions, balances, markPrices } from "./state/state";
import { getPositionKey } from "./state/state";

import {
  getEquity,
  getMaintenanceMargin,
  getUnrealizedPnl,
} from "./position/pnl";

import { publishDbEvent, publishWsEvent } from "./publish/events";

export async function checkLiquidations(marketId: string) {
  const markPrice = markPrices[marketId];

  if (!markPrice) {
    return;
  }

  for (const position of Object.values(positions)) {
    if (position.marketId !== marketId) {
      continue;
    }

    const equity = getEquity(position, markPrice);

    const maintenanceMargin = getMaintenanceMargin(position);

    if (equity > maintenanceMargin) {
      continue;
    }

    const realizedPnl = getUnrealizedPnl(position, markPrice);

    const balance = balances[position.userId];

    if (balance) {
      balance.locked -= position.margin;

      await publishDbEvent({
        type: "BALANCE_UPDATED",
        payload: balance,
        createdAt: Date.now(),
      });

      await publishWsEvent({
        type: "BALANCE_UPDATE",
        userId: position.userId,
        payload: balance,
        createdAt: Date.now(),
      });
    }

    const closedPosition: ClosedPosition = {
      userId: position.userId,
      marketId: position.marketId,

      side: position.side,

      qty: position.qty,

      entryPrice: position.entryPrice,
      exitPrice: markPrice,

      margin: position.margin,
      leverage: position.leverage,

      realizedPnl,

      openedAt: position.updatedAt,
      closedAt: Date.now(),
    };

    await publishDbEvent({
      type: "CLOSED_POSITION_CREATED",
      payload: closedPosition,
      createdAt: Date.now(),
    });

    delete positions[
      getPositionKey(position.userId, position.marketId, position.side)
    ];

    await publishWsEvent({
      type: "POSITION_LIQUIDATED",
      userId: position.userId,
      payload: {
        marketId: position.marketId,
        side: position.side,
        qty: position.qty,
        price: markPrice,
      },
      createdAt: Date.now(),
    });

    await publishWsEvent({
      type: "POSITION_UPDATE",
      userId: position.userId,
      payload: {
        ...position,
        qty: 0,
      },
      createdAt: Date.now(),
    });

    console.log(`LIQUIDATED ${position.userId} ${position.marketId}`);
  }
}
