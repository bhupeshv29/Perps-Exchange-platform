import { create } from "zustand";

import type { Depth, Fill } from "@repo/common";
import { Candle } from "@/types/api";

type TradeStore = {
  selectedMarket: string;
  depth: Depth | null;
  trades: Fill[];
  lastTradePrice: number;
  markPrice: number;
  fundingRate: number;
  candles: Candle[];

  setSelectedMarket: (marketId: string) => void;
  setDepth: (depth: Depth) => void;
  addTrade: (trade: Fill) => void;
  setMarkPrice: (price: number) => void;
  setFundingRate: (rate: number) => void;
  resetDepth: () => void;
  resetTrades: () => void;
  resetPrices: () => void;
  setCandles: (candles: Candle[]) => void;
};

export const useTradeStore = create<TradeStore>((set) => ({
  selectedMarket: "BTCUSDT",
  depth: null,
  trades: [],
  lastTradePrice: 0,
  markPrice: 0,
  fundingRate: 0,
  candles: [],

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
  resetDepth: () =>
    set({
      depth: null,
    }),

  resetTrades: () =>
    set({
      trades: [],
    }),

  resetPrices: () =>
    set({
      lastTradePrice: 0,
      markPrice: 0,
    }),
  setFundingRate: (fundingRate) =>
    set({
      fundingRate,
    }),
  setCandles: (candles) => set({ candles }),
}));
