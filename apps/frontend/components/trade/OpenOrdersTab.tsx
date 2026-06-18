"use client";

import { useCancelOrder } from "@/hooks/useCancelOrder";
import { useAccountStore } from "@/stores/account-store";

export function OpenOrdersTab() {
  const orders = useAccountStore((state) => state.orders);
  const cancelMutation = useCancelOrder();

  const openOrders = orders.filter(
    (order) => order.status === "OPEN" || order.status === "PARTIALLY_FILLED",
  );

  if (openOrders.length === 0) {
    return <EmptyState title="No open orders" />;
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
        <span className="text-right">Action</span>
      </div>

      {openOrders.map((order) => (
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

          <button
            disabled={cancelMutation.isPending}
            onClick={() =>
              cancelMutation.mutate({
                marketId: order.marketId,
                orderId: order.id,
              })
            }
            className="text-right text-danger hover:underline disabled:opacity-50"
          >
            Cancel
          </button>
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
