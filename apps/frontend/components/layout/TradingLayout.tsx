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
    // <main className="flex min-h-screen flex-col bg-background text-text-primary lg:h-screen lg:overflow-hidden">
    //   <TopNavbar />

    //   <div className="grid flex-1 gap-2 p-2 lg:min-h-0 lg:grid-cols-[1fr_340px]">
    //     <section className="flex min-w-0 flex-col gap-2 lg:min-h-0">
    //       <div className="grid gap-2 lg:min-h-0 lg:flex-1 xl:grid-cols-[1fr_360px]">
    //         <div className="h-90 lg:h-auto lg:min-h-0">
    //           <ChartPanel />
    //         </div>

    //         <div className="h-105 lg:h-auto lg:min-h-0">
    //           <DepthPanel />
    //         </div>
    //       </div>

    //       <BottomTabs />
    //     </section>

    //     <div className="lg:min-h-0">
    //       <OrderForm />
    //     </div>
    //   </div>

    //   <DepositModal />
    // </main>

    <main className="flex min-h-screen flex-col bg-background text-text-primary lg:h-screen lg:overflow-hidden">
      <TopNavbar />

      <div className="flex flex-1 flex-col gap-2 p-2 lg:min-h-0 lg:flex-row lg:overflow-hidden">
        <section className="flex min-w-0 flex-1 flex-col gap-2 lg:min-h-0">
          {/* <div className="flex flex-col gap-2 lg:min-h-0 lg:flex-1 xl:flex-row">
            <div className="h-[360px] min-w-0 xl:h-auto xl:min-h-0 xl:flex-1">
              <ChartPanel />
            </div>

            <div className="h-[420px] min-w-0 xl:h-auto xl:min-h-0 xl:w-[360px] xl:shrink-0">
              <DepthPanel />
            </div>
          </div> */}
          <div className="flex flex-col gap-2 lg:min-h-0 lg:flex-1 xl:flex-row">
            <div className="h-[360px] min-w-0 xl:h-auto xl:flex-[3]">
              <ChartPanel />
            </div>

            <div className="h-[420px] min-w-0 xl:h-auto xl:flex-[1]">
              <DepthPanel />
            </div>
          </div>
          <BottomTabs />
        </section>

        <div className="min-w-0 lg:min-h-0 lg:w-[340px] lg:shrink-0 lg:overflow-y-auto">
          <OrderForm />
        </div>
      </div>

      <DepositModal />
    </main>
  );
}
