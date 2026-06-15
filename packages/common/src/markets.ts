export type MarketConfig = {
  id: string;
  symbol: string;
  priceScale: number;
  qtyScale: number;
  maxLeverage: number;
  isActive: boolean;
};

export const MARKETS: Record<string, MarketConfig> = {
  BTCUSDT: {
    id: "BTCUSDT",
    symbol: "BTCUSDT",
    priceScale: 100,
    qtyScale: 1000,
    maxLeverage: 20,
    isActive: true,
  },

  ETHUSDT: {
    id: "ETHUSDT",
    symbol: "ETHUSDT",
    priceScale: 100,
    qtyScale: 1000,
    maxLeverage: 20,
    isActive: true,
  },

  SOLUSDT: {
    id: "SOLUSDT",
    symbol: "SOLUSDT",
    priceScale: 100,
    qtyScale: 1000,
    maxLeverage: 10,
    isActive: true,
  },
};

export function getMarketConfig(marketId: string) {
  return MARKETS[marketId];
}