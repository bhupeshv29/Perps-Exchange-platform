"use client";

import { useEffect } from "react";

import { WebSocketManager } from "@/managers/WebSocketManager";
import { useTradeStore } from "@/stores/trade-store";

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const selectedMarket = useTradeStore((state) => state.selectedMarket);

  useEffect(() => {
    const manager = WebSocketManager.getInstance();

    manager.connect();

    manager.subscribeMarket(selectedMarket);

    return () => {
      manager.unsubscribeMarket(selectedMarket);
    };
  }, [selectedMarket]);

  return children;
}
