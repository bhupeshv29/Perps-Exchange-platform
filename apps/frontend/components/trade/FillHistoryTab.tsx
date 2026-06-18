"use client";

import { useAccountStore } from "@/stores/account-store";

export function FillHistoryTab() {
  const fills = useAccountStore((state) => state.fills);

  if (fills.length === 0) {
    return <EmptyState title="No fills yet" />;
  }

  return (
    <>
      <div className="grid grid-cols-5 border-b border-border px-4 py-2 text-xs text-text-muted">
        <span>Market</span>
        <span>Price</span>
        <span>Qty</span>
        <span>Role</span>
        <span className="text-right">Time</span>
      </div>

      {fills.map((fill) => (
        <div
          key={fill.id}
          className="grid grid-cols-5 px-4 py-3 font-mono text-xs hover:bg-surface-hover"
        >
          <span>{fill.marketId}</span>
          <span>{fill.price.toFixed(2)}</span>
          <span>{fill.qty.toFixed(3)}</span>
          <span>Maker/Taker</span>
          <span className="text-right">
            {new Date(fill.createdAt).toLocaleTimeString()}
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
