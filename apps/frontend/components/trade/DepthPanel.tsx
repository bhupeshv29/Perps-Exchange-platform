"use client";

import { useTradeStore } from "@/stores/trade-store";
import { DepthRow } from "./DepthRow";

export function DepthPanel() {
  const depth = useTradeStore((state) => state.depth);
  const lastTradePrice = useTradeStore((state) => state.lastTradePrice);

  const asks = depth?.asks ?? [];
  const bids = depth?.bids ?? [];
  const maxAskQty = asks.length ? Math.max(...asks.map(([, qty]) => qty)) : 1;

  const maxBidQty = bids.length ? Math.max(...bids.map(([, qty]) => qty)) : 1;

  return (
    <section className="min-h-0 rounded-md border border-border bg-surface">
      <div className="flex h-10 items-center justify-between border-b border-border px-3">
        <div className="flex gap-2">
          <button className="rounded bg-surface-secondary px-2 py-1 text-xs">
            Book
          </button>

          <button className="rounded px-2 py-1 text-xs text-text-muted">
            Trades
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 border-b border-border px-5 py-2 text-xs text-text-muted">
        <span>Price</span>
        <span className="text-right">Qty</span>
        <span className="text-right">Total</span>
      </div>

      <div className="flex h-[calc(100%-76px)] flex-col py-2">
        <div className="flex-1 overflow-hidden">
          {asks
            .slice(0, 10)
            .reverse()
            .map(([price, qty]) => (
              <DepthRow key={price} price={price} qty={qty} side="ASK" maxAskQty={maxAskQty} />
            ))}
        </div>

        <div className="my-2 border-y border-border py-2 text-center">
          <p className="font-mono text-sm text-bid">
            {lastTradePrice > 0 ? lastTradePrice.toFixed(2) : "--"}
          </p>

          <p className="text-[10px] text-text-muted">Last traded price</p>
        </div>

        <div className="flex-1 overflow-hidden">
          {bids.slice(0, 10).map(([price, qty]) => (
            <DepthRow key={price} price={price} qty={qty} side="BID" maxQty={maxBidQty} />
          ))}
        </div>
      </div>
    </section>
  );
}
