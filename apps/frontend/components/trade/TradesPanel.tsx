"use client";

import { useTradeStore } from "@/stores/trade-store";

export function TradesPanel() {
  const trades = useTradeStore((state) => state.trades);

  if (trades.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-text-muted">
        No trades yet
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto">
      <div className="grid grid-cols-3 border-b border-border px-3 py-2 text-xs text-text-muted">
        <span>Price</span>
        <span className="text-right">Qty</span>
        <span className="text-right">Time</span>
      </div>

      {trades.map((trade) => (
        <div
          key={trade.id}
          className="grid grid-cols-3 px-3 py-1 font-mono text-xs hover:bg-surface-hover"
        >
          <span>{trade.price.toFixed(2)}</span>

          <span className="text-right">{trade.qty.toFixed(3)}</span>

          <span className="text-right text-text-muted">
            {new Date(trade.createdAt).toLocaleTimeString()}
          </span>
        </div>
      ))}
    </div>
  );
}
