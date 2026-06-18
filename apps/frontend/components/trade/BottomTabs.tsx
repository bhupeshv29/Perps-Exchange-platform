"use client";

import { useUiStore, type BottomTab } from "@/stores/ui-store";
import { PositionsTab } from "./PositionsTab";
import { OpenOrdersTab } from "./OpenOrdersTab";
import { FillHistoryTab } from "./FillHistoryTab";
import { BalancesTab } from "./BalancesTab";

const tabs: {
  id: BottomTab;
  label: string;
}[] = [
  { id: "balances", label: "Balances" },
  { id: "positions", label: "Positions" },
  { id: "open-orders", label: "Open Orders" },
  { id: "fill-history", label: "Fill History" },
  { id: "order-history", label: "Order History" },
];

export function BottomTabs() {
  const activeTab = useUiStore((state) => state.bottomTab);
  const setBottomTab = useUiStore((state) => state.setBottomTab);

  return (
    <section className="h-72 shrink-0 rounded-md border border-border bg-surface lg:h-56">
      <div className="flex h-10 items-center gap-1 border-b border-border px-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setBottomTab(tab.id)}
            className={`rounded px-3 py-1.5 text-xs ${
              activeTab === tab.id
                ? "bg-surface-secondary text-text-primary"
                : "text-text-muted hover:bg-surface-hover"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="h-[calc(100%-40px)] overflow-auto">
        {activeTab === "balances" && <BalancesTab />}
        {activeTab === "positions" && <PositionsTab />}
        {activeTab === "open-orders" && <OpenOrdersTab />}
        {activeTab === "fill-history" && <FillHistoryTab />}
        {activeTab === "order-history" && <OrderHistoryTab />}
      </div>
    </section>
  );
}

function OrderHistoryTab() {
  return <EmptyState title="No order history" />;
}

function EmptyState({ title }: { title: string }) {
  return (
    <div className="flex h-full items-center justify-center text-sm text-text-muted">
      {title}
    </div>
  );
}
