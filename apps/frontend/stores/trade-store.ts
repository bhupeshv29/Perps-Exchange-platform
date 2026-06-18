import { create } from "zustand";

import type { Depth, Fill } from "@repo/common";

type TradeStore = {
  selectedMarket: string;
  selectedSide: "BID" | "ASK";
  selectedOrderType: "LIMIT" | "MARKET";
  leverage: number;
  depth: Depth | null;
  trades: Fill[];
  lastTradePrice: number;
  markPrice: number;

  setSelectedMarket: (marketId: string) => void;
  setSelectedSide: (side: "BID" | "ASK") => void;
  setSelectedOrderType: (type: "LIMIT" | "MARKET") => void;
  setLeverage: (leverage: number) => void;
  setDepth: (depth: Depth) => void;
  addTrade: (trade: Fill) => void;
  setMarkPrice: (price: number) => void;
};

export const useTradeStore = create<TradeStore>((set) => ({
  selectedMarket: "BTCUSDT",
  depth: null,
  trades: [],
  lastTradePrice: 0,
  markPrice: 0,
  selectedOrderType: "LIMIT",
  selectedSide: "BID",
  leverage: 10,

  setSelectedMarket: (selectedMarket) =>
    set({
      selectedMarket,
    }),

  setDepth: (depth) =>
    set({
      depth,
    }),

  addTrade: (trade) =>
    set((state) => ({
      trades: [trade, ...state.trades].slice(0, 100),

      lastTradePrice: trade.price,
    })),

  setSelectedSide: (selectedSide) =>
    set({
      selectedSide,
    }),

  setSelectedOrderType: (selectedOrderType) =>
    set({
      selectedOrderType,
    }),

  setLeverage: (leverage) =>
    set({
      leverage,
    }),

  setMarkPrice: (markPrice) =>
    set({
      markPrice,
    }),
}));
