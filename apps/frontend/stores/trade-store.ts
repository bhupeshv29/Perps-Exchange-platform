import { create } from "zustand";

import type { Depth, Fill } from "@repo/common";

type TradeStore = {
  selectedMarket: string;
  depth: Depth | null;
  trades: Fill[];
  lastTradePrice: number;
  markPrice: number;

  setSelectedMarket: (marketId: string) => void;
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

  setMarkPrice: (markPrice) =>
    set({
      markPrice,
    }),
}));
