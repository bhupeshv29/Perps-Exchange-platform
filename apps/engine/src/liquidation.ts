import type { ClosedPosition } from "@repo/common";

import { balances, markPrices, positions, getPositionKey } from "./state/state";

import {
  getEquityScaled,
  getMaintenanceMarginScaled,
  getUnrealizedPnlScaled,
} from "@repo/common";

import { publishDbEvent, publishWsEvent } from "./publish/events";
import { updatePositionMetrics } from "./position/metrics";

export async function checkLiquidations(marketId: string) {
  const markPrice = markPrices[marketId];

  if (!markPrice) return;

  for (const position of Object.values(positions)) {
    if (position.marketId !== marketId) continue;

    updatePositionMetrics(position, markPrice);

    const equity = getEquityScaled(position, markPrice);

    const maintenanceMargin = getMaintenanceMarginScaled(position);

    if (equity > maintenanceMargin) {
      void publishWsEvent({
        type: "POSITION_UPDATE",
        userId: position.userId,
        payload: position,
        createdAt: Date.now(),
      });

      continue;
    }

    const now = Date.now();
    const realizedPnl = getUnrealizedPnlScaled(position, markPrice);

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

    console.log(`LIQUIDATED ${position.userId} ${position.marketId}`);
  }
}
