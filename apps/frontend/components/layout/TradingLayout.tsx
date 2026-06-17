"use client";
import { useTradeStore } from "@/stores/trade-store";
import { BottomTabs } from "../trade/BottomTabs";
import { ChartPanel } from "../trade/ChartPanel";
import { DepthPanel } from "../trade/DepthPanel";
import { OrderForm } from "../trade/OrderForm";
import { TopNavbar } from "./TopNavbar";
import { useEffect } from "react";

type Props = {
  marketId: string;
};

export function TradingLayout({ marketId }: Props) {
  const setSelectedMarket = useTradeStore((state) => state.setSelectedMarket);

  useEffect(() => {
    setSelectedMarket(marketId);
  }, [marketId, setSelectedMarket]);
  return (
    <main className="flex h-screen flex-col overflow-hidden bg-background text-text-primary">
      <TopNavbar />

      <div className="grid min-h-0 flex-1 grid-cols-[1fr_340px] gap-2 p-2">
        <section className="flex min-w-0 flex-col gap-2">
          <div className="grid min-h-0 flex-1 grid-cols-[1fr_360px] gap-2">
            <ChartPanel />
            <DepthPanel />
          </div>

          <BottomTabs />
        </section>

        <OrderForm marketId={marketId} />
      </div>
    </main>
  );
}
