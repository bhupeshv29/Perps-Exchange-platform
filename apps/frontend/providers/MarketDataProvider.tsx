"use client";

import { useEffect } from "react";

import { useDepth } from "@/hooks/useDepth";
import { useTradeStore } from "@/stores/trade-store";
import { useCandles } from "@/hooks/useCandles";

export function MarketDataProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const selectedMarket = useTradeStore((state) => state.selectedMarket);
  const setDepth = useTradeStore((state) => state.setDepth);

  const depthQuery = useDepth(selectedMarket);
  const setCandles = useTradeStore((state) => state.setCandles);
  const { data } = useCandles(selectedMarket);

  useEffect(() => {
    if (depthQuery.data?.payload) {
      setDepth(depthQuery.data.payload);
    }
  }, [depthQuery.data, setDepth]);

  useEffect(() => {
    if (!data) return;

    setCandles(data.candles);
  }, [data, setCandles]);

  return children;
}
