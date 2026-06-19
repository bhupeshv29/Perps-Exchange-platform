"use client";

import { useCreateOrder } from "@/hooks/useCreateOrder";

import { useAccountStore } from "@/stores/account-store";

export function PositionsTab() {
  const positions = useAccountStore((state) => state.positions);

  const closeMutation = useCreateOrder();

  if (positions.length === 0) {
    return <EmptyState title="No open positions" />;
  }

  return (
    <>
      <div className="grid grid-cols-12 border-b border-border px-4 py-2 text-xs text-text-muted">
        <span>Market</span>

        <span>Side</span>

        <span>Qty</span>

        <span>Entry</span>

        <span>Liq.</span>

        <span>PnL</span>

        <span>ROI</span>

        <span>Equity</span>

        <span>Funding</span>

        <span>Lev.</span>

        <span>Margin</span>

        <span className="text-right">Action</span>
      </div>

      {positions.map((position) => {
        const closeSide = position.side === "LONG" ? "ASK" : "BID";

        return (
          <div
            key={`${position.userId}-${position.marketId}-${position.side}`}
            className="grid grid-cols-12 px-4 py-3 font-mono text-xs hover:bg-surface-hover"
          >
            <span>{position.marketId}</span>

            <span
              className={position.side === "LONG" ? "text-bid" : "text-ask"}
            >
              {position.side}
            </span>

            <span>{position.qty.toFixed(3)}</span>

            <span>{position.entryPrice.toFixed(2)}</span>

            <span className="text-warning">
              {position.liquidationPrice.toFixed(2)}
            </span>

            <span
              className={position.unrealizedPnl >= 0 ? "text-bid" : "text-ask"}
            >
              {position.unrealizedPnl.toFixed(2)}
            </span>

            <span className={position.roi >= 0 ? "text-bid" : "text-ask"}>
              {position.roi.toFixed(2)}%
            </span>

            <span>{position.equity.toFixed(2)}</span>

            <span
              className={position.fundingPaid <= 0 ? "text-bid" : "text-ask"}
            >
              {position.fundingPaid.toFixed(2)}
            </span>

            <span>{position.leverage}x</span>

            <span>{position.margin.toFixed(2)}</span>

            <button
              disabled={closeMutation.isPending}
              onClick={() =>
                closeMutation.mutate({
                  marketId: position.marketId,
                  side: closeSide,
                  orderType: "MARKET",
                  qty: position.qty,
                  leverage: position.leverage,
                  reduceOnly: true,
                })
              }
              className="text-right text-danger hover:underline disabled:opacity-50"
            >
              Close
            </button>
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
