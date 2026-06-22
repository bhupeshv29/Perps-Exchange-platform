"use client";

import { useState } from "react";
import { useAccountStore } from "@/stores/account-store";
import { useDeposit } from "@/hooks/useDeposit";

export function DepositModal() {
  const [amount, setAmount] = useState("");
  const open = useAccountStore((s) => s.depositOpen);
  const closeDeposit = useAccountStore((s) => s.closeDeposit);
  const depositMutation = useDeposit();

  if (!open) return null;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    const value = Number(amount);

    if (!value || value <= 0) return;

    depositMutation.mutate(value, {
      onSuccess: () => {
        setAmount("");
        closeDeposit();
      },
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
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

        <form onSubmit={onSubmit} className="space-y-4">
          <label className="block">
            <span className="mb-1 block text-xs text-text-muted">Amount</span>

            <div className="flex items-center rounded-md border border-border bg-background">
              <input
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                type="number"
                placeholder="1000"
                className="w-full bg-transparent px-3 py-2 text-sm outline-none"
              />

              <span className="pr-3 text-xs text-text-muted">USDT</span>
            </div>
          </label>

          <button
            disabled={depositMutation.isPending}
            className="w-full rounded-md bg-primary py-2 text-sm font-medium text-white hover:bg-primary-hover disabled:opacity-50"
          >
            {depositMutation.isPending ? "Depositing..." : "Deposit"}
          </button>

          {depositMutation.isError && (
            <p className="text-center text-xs text-danger">Deposit failed</p>
          )}
        </form>
      </div>
    </div>
  );
}
