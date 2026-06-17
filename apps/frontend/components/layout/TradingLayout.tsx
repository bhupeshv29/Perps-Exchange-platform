
import { BottomTabs } from "../trade/BottomTabs";
import { ChartPanel } from "../trade/ChartPanel";
import { DepthPanel } from "../trade/DepthPanel";
import { OrderForm } from "../trade/OrderForm";
import { TopNavbar } from "./TopNavbar";

type Props = {
  marketId: string;
};

export function TradingLayout({ marketId }: Props) {
  return (
    <main className="flex h-screen flex-col overflow-hidden bg-background text-text-primary">
      <TopNavbar marketId={marketId} />

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
