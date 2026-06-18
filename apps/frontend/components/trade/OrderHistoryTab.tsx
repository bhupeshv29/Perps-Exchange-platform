"use client";

import { useOrderHistory } from "@/hooks/useOrderHistory";

export function OrderHistoryTab() {
  const { data, isLoading } = useOrderHistory();

  const orders = data?.orders ?? data?.payload ?? [];

  if (isLoading) return <EmptyState title="Loading order history..." />;

  if (orders.length === 0) {
    return <EmptyState title="No order history" />;
  }

  return (
    <>
      <div className="grid grid-cols-8 border-b border-border px-4 py-2 text-xs text-text-muted">
        <span>Market</span>
        <span>Side</span>
        <span>Type</span>
        <span>Price</span>
        <span>Qty</span>
        <span>Filled</span>
        <span>Status</span>
        <span className="text-right">Time</span>
      </div>

      {orders.map((order: any) => (
        <div
          key={order.id}
          className="grid grid-cols-8 px-4 py-3 font-mono text-xs hover:bg-surface-hover"
        >
          <span>{order.marketId}</span>
          <span className={order.side === "BID" ? "text-bid" : "text-ask"}>
            {order.side}
          </span>
          <span>{order.type}</span>
          <span>{order.price == null ? "-" : order.price.toFixed(2)}</span>
          <span>{order.qty.toFixed(3)}</span>
          <span>{order.filledQty.toFixed(3)}</span>
          <span>{order.status}</span>
          <span className="text-right">
            {new Date(order.createdAt).toLocaleTimeString()}
          </span>
        </div>
      ))}
    </>
  );
}

function EmptyState({ title }: { title: string }) {
  return (
    <div className="flex h-full items-center justify-center text-sm text-text-muted">
      {title}
    </div>
  );
}
