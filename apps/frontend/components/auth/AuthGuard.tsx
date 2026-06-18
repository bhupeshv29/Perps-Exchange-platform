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
      <main className="flex h-screen items-center justify-center bg-background text-text-muted">
        Loading trading terminal...
      </main>
    );
  }

  if (isError) {
    return null;
  }

  return children;
}
