import type { MAX_LEVERAGE } from "../constants";

export type MarketConfig = {
  id: string;
  symbol: string;
  priceScale: number;
  qtyScale: number;
  balanceScale: number;
  maxLeverage: number;
  // 0.0001 -> 0.01%
  fundingRate: number;
  isActive: boolean;
};

export const MARKETS: Record<string, MarketConfig> = {
  BTCUSDT: {
    id: "BTCUSDT",
    symbol: "BTCUSDT",
    priceScale: 100,
    qtyScale: 1000,
    balanceScale: 100,
    maxLeverage: 20,
    fundingRate: 0.0001,
    isActive: true,
  },
  ETHUSDT: {
    id: "ETHUSDT",
    symbol: "ETHUSDT",
    priceScale: 100,
    qtyScale: 1000,
    balanceScale: 100,
    maxLeverage: 20,
    fundingRate: 0.0001,
    isActive: true,
  },
  SOLUSDT: {
    id: "SOLUSDT",
    symbol: "SOLUSDT",
    priceScale: 100,
    qtyScale: 1000,
    balanceScale: 100,
    maxLeverage: 20,
    fundingRate: 0.0001,
    isActive: true,
  },
};

export function getMarketConfig(marketId: string): MarketConfig {
  const market = MARKETS[marketId];

  if (!market) {
    throw new Error(`invalid market: ${marketId}`);
  }

  return market;
}

export function isValidMarket(marketId: string): boolean {
  return Boolean(MARKETS[marketId]);
}
