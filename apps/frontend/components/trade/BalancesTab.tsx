"use client";

import { useAccountStore } from "@/stores/account-store";

export function BalancesTab() {
  const balance = useAccountStore((state) => state.balance);

  if (!balance) {
    return <EmptyState title="No balance found" />;
  }

  return (
    <>
      <div className="grid grid-cols-3 border-b border-border px-4 py-2 text-xs text-text-muted">
        <span>Asset</span>
        <span>Available</span>
        <span className="text-right">Locked</span>
      </div>

      <div className="grid grid-cols-3 px-4 py-3 font-mono text-xs hover:bg-surface-hover">
        <span>USDT</span>
        <span>{balance.available.toFixed(2)}</span>
        <span className="text-right">{balance.locked.toFixed(2)}</span>
      </div>
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
