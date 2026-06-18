"use client";

import { AccountDataProvider } from "./AccountDataProvider";
import { MarketDataProvider } from "./MarketDataProvider";
import { WebSocketProvider } from "./WebSocketProvider";

export function TradingProviders({ children }: { children: React.ReactNode }) {
  return (
    <AccountDataProvider>
      <MarketDataProvider>
        <WebSocketProvider>{children}</WebSocketProvider>
      </MarketDataProvider>
    </AccountDataProvider>
  );
}
