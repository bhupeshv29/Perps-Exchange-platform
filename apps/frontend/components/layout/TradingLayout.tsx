"use client";

import { useEffect } from "react";
import { useTradeStore } from "@/stores/trade-store";
import { BottomTabs } from "../trade/BottomTabs";
import { ChartPanel } from "../trade/ChartPanel";
import { DepthPanel } from "../trade/DepthPanel";
import { OrderForm } from "../trade/OrderForm";
import { TopNavbar } from "./TopNavbar";
import { DepositModal } from "../account/DepositModal";

type Props = {
  marketId: string;
};

export function TradingLayout({ marketId }: Props) {
  const setSelectedMarket = useTradeStore((state) => state.setSelectedMarket);
  const resetDepth = useTradeStore((state) => state.resetDepth);
  const resetTrades = useTradeStore((state) => state.resetTrades);
  const resetPrices = useTradeStore((state) => state.resetPrices);

  useEffect(() => {
    resetDepth();
    resetTrades();
    resetPrices();
    setSelectedMarket(marketId);
  }, [marketId, resetDepth, resetTrades, resetPrices, setSelectedMarket]);

  return (
    <main className="flex min-h-screen flex-col bg-background text-text-primary lg:h-screen lg:overflow-hidden">
      <TopNavbar />

      <div className="grid flex-1 gap-2 p-2 lg:min-h-0 lg:grid-cols-[1fr_340px]">
        <section className="flex min-w-0 flex-col gap-2 lg:min-h-0">
          <div className="grid gap-2 lg:min-h-0 lg:flex-1 xl:grid-cols-[1fr_360px]">
            <div className="h-[360px] lg:h-auto lg:min-h-0">
              <ChartPanel />
            </div>

            <div className="h-[420px] lg:h-auto lg:min-h-0">
              <DepthPanel />
            </div>
          </div>

          <BottomTabs />
        </section>

        <div className="lg:min-h-0">
          <OrderForm />
        </div>
      </div>

      <DepositModal />
    </main>
  );
}
