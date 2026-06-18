"use client";

import { useState } from "react";
import { useTradeStore } from "@/stores/trade-store";
import { DepthRow } from "./DepthRow";
import { TradesPanel } from "./TradesPanel";

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
  const [tab, setTab] = useState<"book" | "trades">("book");

  const depth = useTradeStore((state) => state.depth);
  const lastTradePrice = useTradeStore((state) => state.lastTradePrice);
  if (!depth) {
    return (
      <section className="flex h-full flex-col rounded-md border border-border bg-surface">
        <div className="h-10 border-b border-border px-3 py-3">
          <div className="h-4 w-24 animate-pulse rounded bg-surface-secondary" />
        </div>

        <div className="space-y-2 p-3">
          {Array.from({ length: 18 }).map((_, index) => (
            <div
              key={index}
              className="h-4 animate-pulse rounded bg-surface-secondary"
            />
          ))}
        </div>
      </section>
    );
  }

  const asks = depth.asks;
  const bids = depth.bids;

  const askRows = buildDepthRows(asks.slice(0, 10), true);
  const bidRows = buildDepthRows(bids.slice(0, 10));

  const maxAskQty = asks.length ? Math.max(...asks.map(([, qty]) => qty)) : 1;
  const maxBidQty = bids.length ? Math.max(...bids.map(([, qty]) => qty)) : 1;

  return (
    <section className="flex h-full flex-col rounded-md border border-border bg-surface">
      <div className="flex h-10 items-center gap-1 border-b border-border px-2">
        <button
          onClick={() => setTab("book")}
          className={`rounded px-3 py-1.5 text-xs ${
            tab === "book"
              ? "bg-surface-secondary text-text-primary"
              : "text-text-muted hover:bg-surface-hover"
          }`}
        >
          Book
        </button>

        <button
          onClick={() => setTab("trades")}
          className={`rounded px-3 py-1.5 text-xs ${
            tab === "trades"
              ? "bg-surface-secondary text-text-primary"
              : "text-text-muted hover:bg-surface-hover"
          }`}
        >
          Trades
        </button>
      </div>

      {tab === "trades" ? (
        <TradesPanel />
      ) : (
        <>
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
        </>
      )}
    </section>
  );
}
