"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAccountStore } from "@/stores/account-store";
import { signOut } from "@/services/auth";
import { useSession } from "next-auth/react";

export function ProfileDropdown() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const openDeposit = useAccountStore((s) => s.openDeposit);
  const { data: session } = useSession();

  const initial = session?.user?.name?.[0] ?? session?.user?.email?.[0] ?? "U";
  async function handleLogout() {
    await signOut();
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface-secondary text-sm hover:bg-surface-hover"
      >
        {initial.toUpperCase()}
      </button>

      {open && (
        <div className="absolute right-0 top-11 z-50 w-56 rounded-md border border-border bg-surface p-1 shadow-xl">
          <div className="border-b border-border px-3 py-2">
            <p className="truncate text-sm font-medium">
              {session?.user?.email}
            </p>
          </div>

          <button
            onClick={() => {
              openDeposit();
              setOpen(false);
            }}
            className="w-full rounded px-3 py-2 text-left text-sm hover:bg-surface-hover"
          >
            Deposit
          </button>

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
