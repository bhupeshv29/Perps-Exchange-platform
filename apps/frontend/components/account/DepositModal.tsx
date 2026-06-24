"use client";

import { useState } from "react";
import { useAccountStore } from "@/stores/account-store";
import { useStripeCheckout, useRazorpayOrder } from "@/hooks/usePayment";

export function DepositModal() {
  const [amount, setAmount] = useState("");

  const open = useAccountStore((s) => s.depositOpen);
  const closeDeposit = useAccountStore((s) => s.closeDeposit);

  const stripeMutation = useStripeCheckout();
  const razorpayMutation = useRazorpayOrder();

  if (!open) return null;

  const value = Number(amount);
  const isInvalidAmount = !value || value <= 0;

  function payWithStripe() {
    if (isInvalidAmount) return;
    stripeMutation.mutate(value);
  }

  function payWithRazorpay() {
    if (isInvalidAmount) return;
    razorpayMutation.mutate(value);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="w-full max-w-sm rounded-md border border-border bg-surface p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold">Deposit USDT</h2>

          <button
            onClick={closeDeposit}
            className="text-sm text-text-muted hover:text-text-primary"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          <label className="block">
            <span className="mb-1 block text-xs text-text-muted">Amount</span>

            <div className="flex items-center rounded-md border border-border bg-background">
              <input
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                type="number"
                min={1}
                placeholder="1000"
                className="w-full bg-transparent px-3 py-2 text-sm outline-none"
              />

              <span className="pr-3 text-xs text-text-muted">INR</span>
            </div>
          </label>

          <button
            disabled={isInvalidAmount || stripeMutation.isPending}
            onClick={payWithStripe}
            className="w-full rounded-md bg-primary py-2 text-sm font-medium text-black hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
          >
            {stripeMutation.isPending ? "Redirecting..." : "Pay with Stripe"}
          </button>

          <button
            disabled={isInvalidAmount || razorpayMutation.isPending}
            onClick={payWithRazorpay}
            className="w-full rounded-md border border-border bg-background py-2 text-sm font-medium text-text-primary hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-50"
          >
            {razorpayMutation.isPending
              ? "Creating order..."
              : "Pay with Razorpay"}
          </button>

          <p className="text-xs leading-5 text-text-muted">
            Balance is credited only after payment webhook verification.
          </p>
        </div>
      </div>
    </div>
  );
}
