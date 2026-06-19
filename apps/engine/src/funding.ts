import { MARKETS, getMarketConfig } from "@repo/common";

import { balances, markPrices, positions } from "./state/state";
import { publishDbEvent, publishWsEvent } from "./publish/events";

const FUNDING_INTERVAL_MS = 10_000;

function calculatePositionValue(input: {
  markPrice: number;
  qty: number;
  qtyScale: number;
}) {
  return Math.floor((input.markPrice * input.qty) / input.qtyScale);
}

function publishFundingRates(now: number) {
  for (const market of Object.values(MARKETS)) {
    if (!market.isActive) continue;

    void publishWsEvent({
      type: "FUNDING_RATE_UPDATE",
      marketId: market.id,
      payload: {
        fundingRate: market.fundingRate,
        nextFundingTime: now + FUNDING_INTERVAL_MS,
      },
      createdAt: now,
    });
  }
}

export async function applyFunding() {
  const now = Date.now();

  publishFundingRates(now);

  for (const position of Object.values(positions)) {
    const market = getMarketConfig(position.marketId);
    const markPrice = markPrices[position.marketId];

    if (!market.isActive) continue;
    if (!markPrice) continue;

    const balance = balances[position.userId];
    if (!balance) continue;

    const positionValue = calculatePositionValue({
      markPrice,
      qty: position.qty,
      qtyScale: market.qtyScale,
    });

    const fundingPayment = Math.floor(
      Math.abs(positionValue * market.fundingRate),
    );

    if (fundingPayment === 0) continue;

    const longsPay = market.fundingRate > 0;

    if (
      (longsPay && position.side === "LONG") ||
      (!longsPay && position.side === "SHORT")
    ) {
      balance.available -= fundingPayment;
      position.fundingPaid += fundingPayment;
    } else {
      balance.available += fundingPayment;
      position.fundingPaid -= fundingPayment;
    }

    position.updatedAt = now;

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

    void publishWsEvent({
      type: "POSITION_UPDATE",
      userId: position.userId,
      payload: position,
      createdAt: now,
    });
  }
}

export function startFundingWorker() {
  setInterval(() => {
    applyFunding().catch((error) => {
      console.error("funding worker failed", error);
    });
  }, FUNDING_INTERVAL_MS);

  console.log("funding worker running");
}
