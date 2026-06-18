"use client";

import { useTradeStore } from "@/stores/trade-store";
import { DepthRow } from "./DepthRow";

function buildDepthRows(levels: [number, number][], reverse = false) {
  const rows = reverse ? [...levels].reverse() : [...levels];

  let cumulative = 0;

  return rows.map(([price, qty]) => {
    cumulative += qty;

    return {
      price,
      qty,
      total: cumulative,
    };
  });
}

export function DepthPanel() {
  const depth = useTradeStore((state) => state.depth);

  const lastTradePrice = useTradeStore((state) => state.lastTradePrice);

  const asks = depth?.asks ?? [];
  const bids = depth?.bids ?? [];

  const askRows = buildDepthRows(asks.slice(0, 10), true);

  const bidRows = buildDepthRows(bids.slice(0, 10));

  const maxAskQty = asks.length ? Math.max(...asks.map(([, qty]) => qty)) : 1;

  const maxBidQty = bids.length ? Math.max(...bids.map(([, qty]) => qty)) : 1;

  return (
    <div className="flex h-full flex-col rounded-md border border-border bg-surface">
      <div className="grid grid-cols-3 border-b border-border px-2 py-2 text-xs text-text-muted">
        <span>Price</span>
        <span className="text-right">Qty</span>
        <span className="text-right">Total</span>
      </div>

      <div className="flex-1 overflow-hidden">
        {askRows.map((row) => (
          <DepthRow
            key={row.price}
            side="ASK"
            price={row.price}
            qty={row.qty}
            total={row.total}
            maxQty={maxAskQty}
          />
        ))}
      </div>

      <div className="border-y border-border py-2 text-center">
        <p className="font-mono text-sm font-semibold">
          {lastTradePrice.toFixed(2)}
        </p>
      </div>

      <div className="flex-1 overflow-hidden">
        {bidRows.map((row) => (
          <DepthRow
            key={row.price}
            side="BID"
            price={row.price}
            qty={row.qty}
            total={row.total}
            maxQty={maxBidQty}
          />
        ))}
      </div>
    </div>
  );
}
