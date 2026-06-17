"use client";

import { useEffect } from "react";

import { getSocket } from "@/lib/ws";

import { useTradeStore } from "@/stores/trade-store";
import { useWsStore } from "@/stores/ws-store";

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const selectedMarket = useTradeStore((state) => state.selectedMarket);

  const setDepth = useTradeStore((state) => state.setDepth);

  const addTrade = useTradeStore((state) => state.addTrade);

  const setMarkPrice = useTradeStore((state) => state.setMarkPrice);

  const setConnected = useWsStore((state) => state.setConnected);

  useEffect(() => {
    const ws = getSocket();

    ws.onopen = () => {
      console.log("ws connected");

      setConnected(true);

      ws.send(
        JSON.stringify({
          type: "SUBSCRIBE_MARKET",
          marketId: selectedMarket,
        }),
      );
    };

    ws.onclose = () => {
      setConnected(false);
    };

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);

      switch (message.type) {
        case "DEPTH_UPDATE":
          setDepth(message.payload);
          break;

        case "TRADE_UPDATE":
          addTrade(message.payload);
          break;

        case "MARK_PRICE_UPDATE":
          setMarkPrice(message.payload.price);
          break;
      }
    };

    return () => {
      ws.send(
        JSON.stringify({
          type: "UNSUBSCRIBE_MARKET",
          marketId: selectedMarket,
        }),
      );
    };
  }, [selectedMarket]);

  return children;
}
