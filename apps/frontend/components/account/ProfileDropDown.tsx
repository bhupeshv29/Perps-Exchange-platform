"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAccountStore } from "@/stores/account-store";
import { signOut } from "@/services/auth";

export function ProfileDropdown() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const openDeposit = useAccountStore((s) => s.openDeposit);

  async function handleLogout() {
    await signOut();
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface-secondary text-sm hover:bg-surface-hover"
      >
        U
      </button>

      {open && (
        <div className="absolute right-0 top-11 z-50 w-44 rounded-md border border-border bg-surface p-1 shadow-xl">
          <button
            onClick={() => {
              openDeposit();
              setOpen(false);
            }}
            className="w-full rounded px-3 py-2 text-left text-sm hover:bg-surface-hover"
          >
            Deposit
          </button>

          {/* <button className="w-full rounded px-3 py-2 text-left text-sm text-text-muted hover:bg-surface-hover">
            Withdraw
          </button> */}

          <button
            onClick={handleLogout}
            className="w-full rounded px-3 py-2 text-left text-sm text-danger hover:bg-surface-hover"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
