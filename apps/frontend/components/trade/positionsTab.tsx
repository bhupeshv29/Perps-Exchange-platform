"use client";

import { useAccountStore } from "@/stores/account-store";
import { useTradeStore } from "@/stores/trade-store";
import {
  calculateLiquidationPrice,
  calculateRoi,
  calculateUnrealizedPnl,
} from "@/utils/position";

export function PositionsTab() {
  const positions = useAccountStore((state) => state.positions);
  const markPrice = useTradeStore((state) => state.markPrice);

  if (positions.length === 0) {
    return <EmptyState title="No open positions" />;
  }

  return (
    <>
      <div className="grid grid-cols-9 border-b border-border px-4 py-2 text-xs text-text-muted">
        <span>Market</span>
        <span>Side</span>
        <span>Qty</span>
        <span>Entry</span>
        <span>Mark</span>
        <span>Liq.</span>
        <span>PnL</span>
        <span>ROI</span>
        <span className="text-right">Margin</span>
      </div>

      {positions.map((position) => {
        const unrealizedPnl = calculateUnrealizedPnl(position, markPrice);
        const roi = calculateRoi(position, unrealizedPnl);
        const liquidationPrice = calculateLiquidationPrice(position);

        return (
          <div
            key={`${position.userId}-${position.marketId}-${position.side}`}
            className="grid grid-cols-9 px-4 py-3 font-mono text-xs hover:bg-surface-hover"
          >
            <span>{position.marketId}</span>

            <span
              className={position.side === "LONG" ? "text-bid" : "text-ask"}
            >
              {position.side}
            </span>

            <span>{position.qty.toFixed(3)}</span>
            <span>{position.entryPrice.toFixed(2)}</span>
            <span>{markPrice ? markPrice.toFixed(2) : "-"}</span>
            <span className="text-warning">{liquidationPrice.toFixed(2)}</span>

            <span className={unrealizedPnl >= 0 ? "text-bid" : "text-ask"}>
              {unrealizedPnl.toFixed(2)}
            </span>

            <span className={roi >= 0 ? "text-bid" : "text-ask"}>
              {roi.toFixed(2)}%
            </span>

            <span className="text-right">{position.margin.toFixed(2)}</span>
          </div>
        );
      })}
    </>
  );
}

function EmptyState({ title }: { title: string }) {
  return (
    <div className="flex h-full items-center justify-center text-sm text-text-muted">
      {title}
    </div>
  );
}
