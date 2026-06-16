const MARKET_SCALE: Record<
  string,
  {
    priceScale: number;
    qtyScale: number;
    marginScale: number;
  }
> = {
  BTCUSDT: { priceScale: 100, qtyScale: 1000, marginScale: 100 },
  ETHUSDT: { priceScale: 100, qtyScale: 1000, marginScale: 100 },
  SOLUSDT: { priceScale: 100, qtyScale: 1000, marginScale: 100 },
};

function getMarketScale(marketId: string) {
  const scale = MARKET_SCALE[marketId];

  if (!scale) {
    throw new Error("invalid market");
  }

  return scale;
}

export function scalePrice(marketId: string, price: number) {
  return Math.round(price * getMarketScale(marketId).priceScale);
}

export function scaleQty(marketId: string, qty: number) {
  return Math.round(qty * getMarketScale(marketId).qtyScale);
}

export function scaleMargin(marketId: string, margin: number) {
  return Math.round(margin * getMarketScale(marketId).marginScale);
}

export function unscalePrice(marketId: string, price: number) {
  return price / getMarketScale(marketId).priceScale;
}

export function unscaleQty(marketId: string, qty: number) {
  return qty / getMarketScale(marketId).qtyScale;
}

export function unscaleMargin(marketId: string, margin: number) {
  return margin / getMarketScale(marketId).marginScale;
}