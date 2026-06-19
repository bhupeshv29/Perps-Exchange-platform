"use client";

import { useWatch } from "react-hook-form";

import { useBalance } from "@/hooks/useBalance";
import { useCreateOrder } from "@/hooks/useCreateOrder";
import { useOrderForm } from "@/hooks/useOrderForm";
import type { OrderFormInput } from "@/schema/order";
import { useTradeStore } from "@/stores/trade-store";

import { OrderInput } from "./OrderInput";
import { OrderSummary } from "./OrderSummary";
import { LeverageSlider } from "../order/LeverageSlider";

export function OrderForm() {
  const selectedMarket = useTradeStore((state) => state.selectedMarket);
  const markPrice = useTradeStore((state) => state.markPrice);

  const { data: balanceResponse } = useBalance();
  const mutation = useCreateOrder();

  const {
    register,
    control,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useOrderForm();

  const side = useWatch({
    control,
    name: "side",
  });

  const orderType = useWatch({
    control,
    name: "orderType",
  });

  const price = useWatch({
    control,
    name: "price",
  });

  const qty = useWatch({
    control,
    name: "qty",
  });

  const leverage = useWatch({
    control,
    name: "leverage",
  });

  const available = balanceResponse?.payload?.available ?? 0;

  function onSubmit(data: OrderFormInput) {
    mutation.mutate({
      ...data,
      marketId: selectedMarket,
      price: data.orderType === "MARKET" ? undefined : data.price,
    });
  }

  return (
    <aside className="flex h-full min-h-0 flex-col rounded-md border border-border bg-surface">
      <div className="shrink-0 border-b border-border px-3 py-2">
        <h2 className="text-sm font-semibold">Place Order</h2>
        <p className="text-xs text-text-muted">{selectedMarket}</p>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden p-3"
      >
        {/* BUY / SELL */}
        <div className="grid shrink-0 grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setValue("side", "BID")}
            className={`rounded-md py-1.5 text-sm font-medium ${
              side === "BID" ? "bg-bid text-black" : "bg-surface-secondary"
            }`}
          >
            Buy / Long
          </button>

          <button
            type="button"
            onClick={() => setValue("side", "ASK")}
            className={`rounded-md py-1.5 text-sm font-medium ${
              side === "ASK" ? "bg-ask text-white" : "bg-surface-secondary"
            }`}
          >
            Sell / Short
          </button>
        </div>

        {/* LIMIT / MARKET */}
        <div className="flex shrink-0 items-center gap-1 border-b border-border pb-2">
          <button
            type="button"
            onClick={() => setValue("orderType", "LIMIT")}
            className={`rounded px-3 py-1.5 text-xs ${
              orderType === "LIMIT"
                ? "bg-surface-secondary text-text-primary ring-1 ring-primary"
                : "text-text-muted hover:bg-surface-hover"
            }`}
          >
            Limit
          </button>

          <button
            type="button"
            onClick={() => setValue("orderType", "MARKET")}
            className={`rounded px-3 py-1.5 text-xs ${
              orderType === "MARKET"
                ? "bg-surface-secondary text-text-primary ring-1 ring-primary"
                : "text-text-muted hover:bg-surface-hover"
            }`}
          >
            Market
          </button>
        </div>

        {/* Inputs */}
        <div className="space-y-2">
          {orderType === "LIMIT" && (
            <OrderInput
              label="Price"
              suffix="USDT"
              registration={register("price", {
                valueAsNumber: true,
              })}
              error={errors.price}
            />
          )}

          <OrderInput
            label="Quantity"
            suffix="BTC"
            registration={register("qty", {
              valueAsNumber: true,
            })}
            error={errors.qty}
          />

          <LeverageSlider
            value={leverage ?? 1}
            max={20}
            onChange={(value) => setValue("leverage", value)}
          />
        </div>

        {/* Preview */}
        <OrderSummary
          available={available}
          price={price}
          qty={qty ?? 0}
          leverage={leverage ?? 1}
          orderType={orderType}
          markPrice={markPrice}
        />

        <button
          type="submit"
          disabled={mutation.isPending}
          className={`mt-auto rounded-md py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
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
          <p className="text-center text-xs text-danger">
            Failed to create order.
          </p>
        )}
      </form>
    </aside>
  );
}
