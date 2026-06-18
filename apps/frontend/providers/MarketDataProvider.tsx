"use client";

import { useEffect } from "react";

import { useDepth } from "@/hooks/useDepth";
import { useTradeStore } from "@/stores/trade-store";

export function MarketDataProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const selectedMarket = useTradeStore((state) => state.selectedMarket);
  const setDepth = useTradeStore((state) => state.setDepth);

  const depthQuery = useDepth(selectedMarket);

  useEffect(() => {
    if (depthQuery.data?.payload) {
      setDepth(depthQuery.data.payload);
    }
  }, [depthQuery.data, setDepth]);

  return children;
}
