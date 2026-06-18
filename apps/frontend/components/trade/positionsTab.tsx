"use client";

import { usePositions } from "@/hooks/usePosition";

export function PositionsTab() {
  const { data, isLoading } = usePositions();

  const positions = data?.payload ?? [];

  if (isLoading) {
    return <EmptyState title="Loading positions..." />;
  }

  if (positions.length === 0) {
    return <EmptyState title="No open positions" />;
  }

  return (
    <>
      <div className="grid grid-cols-7 border-b border-border px-4 py-2 text-xs text-text-muted">
        <span>Market</span>
        <span>Side</span>
        <span>Qty</span>
        <span>Entry</span>
        <span>Leverage</span>
        <span>PnL</span>
        <span className="text-right">Margin</span>
      </div>

      {positions.map((position) => (
        <div
          key={`${position.userId}-${position.marketId}-${position.side}`}
          className="grid grid-cols-7 px-4 py-3 font-mono text-xs hover:bg-surface-hover"
        >
          <span>{position.marketId}</span>

          <span className={position.side === "LONG" ? "text-bid" : "text-ask"}>
            {position.side}
          </span>

          <span>{position.qty.toFixed(3)}</span>
          <span>{position.entryPrice.toFixed(2)}</span>
          <span>{position.leverage}x</span>

          <span className={position.realizedPnl >= 0 ? "text-bid" : "text-ask"}>
            {position.realizedPnl.toFixed(2)}
          </span>

          <span className="text-right">{position.margin.toFixed(2)}</span>
        </div>
      ))}
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
