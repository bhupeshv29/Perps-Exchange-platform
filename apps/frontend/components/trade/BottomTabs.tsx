"use client";

import { RefreshCw } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

import { useUiStore, type BottomTab } from "@/stores/ui-store";

import { BalancesTab } from "./BalancesTab";
import { PositionsTab } from "./positionsTab";
import { OpenOrdersTab } from "./OpenOrdersTab";
import { FillHistoryTab } from "./FillHistoryTab";
import { OrderHistoryTab } from "./OrderHistoryTab";
import { ClosedPositionsTab } from "./ClosedPositionsTab";

const tabs: {
  id: BottomTab;
  label: string;
}[] = [
  { id: "balances", label: "Balances" },
  { id: "positions", label: "Positions" },
  { id: "open-orders", label: "Open Orders" },
  { id: "fill-history", label: "Fill History" },
  { id: "order-history", label: "Order History" },
  { id: "closed-positions", label: "Closed Positions" },
];

export function BottomTabs() {
  const activeTab = useUiStore((state) => state.bottomTab);
  const setBottomTab = useUiStore((state) => state.setBottomTab);

  const queryClient = useQueryClient();

  /**for evry query */

  // async function refresh() {
  //   await queryClient.invalidateQueries();
  // }

  /** refresh only account-related queries: */
  const refresh = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["balance"] }),

      queryClient.invalidateQueries({ queryKey: ["positions"] }),

      queryClient.invalidateQueries({ queryKey: ["orders"] }),

      queryClient.invalidateQueries({ queryKey: ["fills"] }),

      queryClient.invalidateQueries({ queryKey: ["closed-positions"] }),
    ]);
  };

  return (
    <section className="h-72 shrink-0 rounded-md border border-border bg-surface lg:h-56">
      <div className="flex h-10 items-center border-b border-border px-2">
        <div className="flex flex-1 gap-1 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setBottomTab(tab.id)}
              className={`rounded px-3 py-1.5 text-xs whitespace-nowrap transition ${
                activeTab === tab.id
                  ? "bg-surface-secondary text-text-primary"
                  : "text-text-muted hover:bg-surface-hover"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <button
          onClick={refresh}
          title="Refresh"
          className="ml-2 rounded-md p-2 text-text-muted transition hover:bg-surface-hover hover:text-text-primary"
        >
          <RefreshCw size={16} />
        </button>
      </div>

      <div className="h-[calc(100%-40px)] overflow-auto">
        {activeTab === "balances" && <BalancesTab />}
        {activeTab === "positions" && <PositionsTab />}
        {activeTab === "open-orders" && <OpenOrdersTab />}
        {activeTab === "fill-history" && <FillHistoryTab />}
        {activeTab === "order-history" && <OrderHistoryTab />}
        {activeTab === "closed-positions" && <ClosedPositionsTab />}
      </div>
    </section>
  );
}
