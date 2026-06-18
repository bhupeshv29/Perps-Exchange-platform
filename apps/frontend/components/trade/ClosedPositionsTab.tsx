"use client";

import { useClosedPositions } from "@/hooks/useClosedPositions";

export function ClosedPositionsTab() {
  const { data, isLoading } = useClosedPositions();

  const positions = data?.closedPositions ?? data?.payload ?? [];

  if (isLoading) return <EmptyState title="Loading closed positions..." />;

  if (positions.length === 0) {
    return <EmptyState title="No closed positions" />;
  }

  return (
    <>
      <div className="grid grid-cols-8 border-b border-border px-4 py-2 text-xs text-text-muted">
        <span>Market</span>
        <span>Side</span>
        <span>Qty</span>
        <span>Entry</span>
        <span>Exit</span>
        <span>PnL</span>
        <span>Leverage</span>
        <span className="text-right">Closed</span>
      </div>

      {positions.map((p: any, index: number) => (
        <div
          key={p.id ?? index}
          className="grid grid-cols-8 px-4 py-3 font-mono text-xs hover:bg-surface-hover"
        >
          <span>{p.marketId}</span>
          <span className={p.side === "LONG" ? "text-bid" : "text-ask"}>
            {p.side}
          </span>
          <span>{p.qty.toFixed(3)}</span>
          <span>{p.entryPrice.toFixed(2)}</span>
          <span>{p.exitPrice.toFixed(2)}</span>
          <span className={p.realizedPnl >= 0 ? "text-bid" : "text-ask"}>
            {p.realizedPnl.toFixed(2)}
          </span>
          <span>{p.leverage}x</span>
          <span className="text-right">
            {new Date(p.closedAt).toLocaleTimeString()}
          </span>
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
