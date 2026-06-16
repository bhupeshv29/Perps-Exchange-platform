export type MarketConfig = {
  symbol: string;
  priceScale: number;
  qtyScale: number;
  marginScale: number;
  maxLeverage: number;
  isActive: boolean;
};

export const MARKETS = {
  BTCUSDT: {
    symbol: "BTCUSDT",
    priceScale: 100,
    qtyScale: 1000,
    marginScale: 100,
    maxLeverage: 20,
    isActive: true,
  },

  ETHUSDT: {
    symbol: "ETHUSDT",
    priceScale: 100,
    qtyScale: 1000,
    marginScale: 100,
    maxLeverage: 20,
    isActive: true,
  },

  SOLUSDT: {
    symbol: "SOLUSDT",
    priceScale: 100,
    qtyScale: 1000,
    marginScale: 100,
    maxLeverage: 10,
    isActive: true,
  },
} satisfies Record<string, MarketConfig>;

export function getMarketConfig(
  marketId: string,
): MarketConfig | undefined {
  return MARKETS[marketId];
}