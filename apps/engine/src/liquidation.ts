import type { ClosedPosition } from "@repo/common";

import { balances, markPrices, positions, getPositionKey } from "./state/state";

import {
  getEquity,
  getMaintenanceMargin,
  getUnrealizedPnl,
} from "./position/pnl";

import { publishDbEvent, publishWsEvent } from "./publish/events";

export async function checkLiquidations(marketId: string) {
  const markPrice = markPrices[marketId];

  if (!markPrice) return;

  for (const position of Object.values(positions)) {
    if (position.marketId !== marketId) continue;

    const equity = getEquity(position, markPrice);
    const maintenanceMargin = getMaintenanceMargin(position);

    if (equity > maintenanceMargin) continue;

    const now = Date.now();
    const realizedPnl = getUnrealizedPnl(position, markPrice);

    const positionKey = getPositionKey(
      position.userId,
      position.marketId,
      position.side,
    );

    const balance = balances[position.userId];

    if (balance) {
      const remainingEquity = Math.max(equity, 0);

      balance.locked -= position.margin;
      balance.available += remainingEquity;

      void publishDbEvent({
        type: "BALANCE_UPDATED",
        payload: balance,
        createdAt: now,
      });

      void publishWsEvent({
        type: "BALANCE_UPDATE",
        userId: position.userId,
        payload: balance,
        createdAt: now,
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
      closedAt: now,
    };

    void publishDbEvent({
      type: "CLOSED_POSITION_CREATED",
      payload: closedPosition,
      createdAt: now,
    });

    delete positions[positionKey];

    void publishWsEvent({
      type: "POSITION_LIQUIDATED",
      userId: position.userId,
      payload: {
        marketId: position.marketId,
        side: position.side,
        qty: position.qty,
        price: markPrice,
      },
      createdAt: now,
    });

    void publishWsEvent({
      type: "POSITION_UPDATE",
      userId: position.userId,
      payload: {
        ...position,
        qty: 0,
      },
      createdAt: now,
    });

    console.log(`LIQUIDATED ${position.userId} ${position.marketId}`);
  }
}
