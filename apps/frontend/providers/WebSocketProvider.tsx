"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";

import { WebSocketManager } from "@/managers/WebSocketManager";
import { useTradeStore } from "@/stores/trade-store";

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const { status } = useSession();
  const selectedMarket = useTradeStore((state) => state.selectedMarket);

  useEffect(() => {
    if (status !== "authenticated") return;

    const manager = WebSocketManager.getInstance();

    void manager.connect();
    manager.subscribeMarket(selectedMarket);

    return () => {
      manager.unsubscribeMarket(selectedMarket);
    };
  }, [status, selectedMarket]);

  return children;
}
