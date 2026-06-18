"use client";

import { useWatch } from "react-hook-form";

import { useOrderForm } from "@/hooks/useOrderForm";
import { useCreateOrder } from "@/hooks/useCreateOrder";
import { useBalance } from "@/hooks/useBalance";
import { useTradeStore } from "@/stores/trade-store";

import type { OrderFormInput } from "@/schema/order";

import { OrderInput } from "./OrderInput";
import { OrderSummary } from "./OrderSummary";

export function OrderForm() {
  const selectedMarket = useTradeStore((state) => state.selectedMarket);

  const { data: balanceResponse } = useBalance();
  const mutation = useCreateOrder();

  const {
    register,
    control,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useOrderForm();

  const side = useWatch({ control, name: "side" });
  const orderType = useWatch({ control, name: "orderType" });
  const margin = useWatch({ control, name: "margin" });
  const leverage = useWatch({ control, name: "leverage" });

  const available = balanceResponse?.payload?.available ?? 0;

  function onSubmit(data: OrderFormInput) {
    mutation.mutate({
      ...data,
      marketId: selectedMarket,
      price: data.orderType === "MARKET" ? undefined : data.price,
    });
  }

  return (
    <aside className="rounded-md border border-border bg-surface">
      <div className="border-b border-border px-4 py-3">
        <h2 className="text-sm font-semibold">Place Order</h2>
        <p className="mt-1 text-xs text-text-muted">{selectedMarket}</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-4">
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setValue("side", "BID")}
            className={`rounded-md py-2 text-sm font-medium ${
              side === "BID" ? "bg-bid text-black" : "bg-surface-secondary"
            }`}
          >
            Buy
          </button>

          <button
            type="button"
            onClick={() => setValue("side", "ASK")}
            className={`rounded-md py-2 text-sm font-medium ${
              side === "ASK" ? "bg-ask text-white" : "bg-surface-secondary"
            }`}
          >
            Sell
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setValue("orderType", "LIMIT")}
            className={`rounded-md py-2 text-sm ${
              orderType === "LIMIT"
                ? "bg-primary text-white"
                : "bg-surface-secondary"
            }`}
          >
            Limit
          </button>

          <button
            type="button"
            onClick={() => setValue("orderType", "MARKET")}
            className={`rounded-md py-2 text-sm ${
              orderType === "MARKET"
                ? "bg-primary text-white"
                : "bg-surface-secondary"
            }`}
          >
            Market
          </button>
        </div>

        {orderType === "LIMIT" && (
          <OrderInput
            label="Price"
            suffix="USDT"
            registration={register("price", { valueAsNumber: true })}
            error={errors.price}
          />
        )}

        <OrderInput
          label="Quantity"
          suffix="BTC"
          registration={register("qty", { valueAsNumber: true })}
          error={errors.qty}
        />

        <OrderInput
          label="Margin"
          suffix="USDT"
          registration={register("margin", { valueAsNumber: true })}
          error={errors.margin}
        />

        <OrderInput
          label="Leverage"
          suffix="x"
          registration={register("leverage", { valueAsNumber: true })}
          error={errors.leverage}
        />

        <OrderSummary
          available={available}
          margin={margin ?? 0}
          leverage={leverage ?? 1}
        />

        <button
          type="submit"
          disabled={mutation.isPending}
          className={`w-full rounded-md py-3 font-semibold disabled:opacity-60 ${
            side === "BID" ? "bg-bid text-black" : "bg-ask text-white"
          }`}
        >
          {mutation.isPending
            ? "Submitting..."
            : side === "BID"
              ? "Buy / Long"
              : "Sell / Short"}
        </button>

        {mutation.isError && (
          <p className="text-center text-sm text-danger">
            Failed to create order.
          </p>
        )}
      </form>
    </aside>
  );
}
