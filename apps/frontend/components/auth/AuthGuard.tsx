"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useBalance } from "@/hooks/useBalance";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  const { isLoading, isError } = useBalance();

  useEffect(() => {
    if (isError) {
      router.replace("/signin");
    }
  }, [isError, router]);

  if (isLoading) {
    return (
      <main className="flex h-screen items-center justify-center bg-background">
        <div className="space-y-3">
          <div className="h-4 w-48 animate-pulse rounded bg-surface-secondary" />
          <div className="h-4 w-32 animate-pulse rounded bg-surface-secondary" />
        </div>
      </main>
    );
  }

  if (isError) {
    return null;
  }

  return children;
}
