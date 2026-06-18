"use client";

import { useTradeStore } from "@/stores/trade-store";
import { useWsStore } from "@/stores/ws-store";

import { useRouter } from "next/navigation";
import { ProfileDropdown } from "../account/ProfileDropdown";

export function TopNavbar() {
  const selectedMarket = useTradeStore((state) => state.selectedMarket);
  const lastTradePrice = useTradeStore((state) => state.lastTradePrice);
  const markPrice = useTradeStore((state) => state.markPrice);
  const connected = useWsStore((state) => state.connected);
  const router = useRouter();

  function changeMarket(marketId: string) {
    router.push(`/trade/${marketId}`);
  }
  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-surface px-4">
      <div className="flex items-center gap-8">
        <div>
          <p className="text-xs text-text-muted">Market</p>
          <select
            value={selectedMarket}
            onChange={(e) => changeMarket(e.target.value)}
            className="bg-surface font-mono text-lg font-semibold outline-none"
          >
            <option value="BTCUSDT">BTCUSDT</option>
            <option value="ETHUSDT">ETHUSDT</option>
            <option value="SOLUSDT">SOLUSDT</option>
          </select>
        </div>

        <div>
          <p className="text-xs text-text-muted">Last Price</p>
          <p className="font-mono text-sm">{lastTradePrice.toFixed(2)}</p>
        </div>

        <div>
          <p className="text-xs text-text-muted">Mark Price</p>
          <p className="font-mono text-sm">{markPrice.toFixed(2)}</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <span
          className={connected ? "text-xs text-success" : "text-xs text-danger"}
        >
          {connected ? "● Connected" : "● Offline"}
        </span>

        <ProfileDropdown />
      </div>
    </header>
  );
}
