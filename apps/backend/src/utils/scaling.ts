const BALANCE_SCALE = 100;

const MARKET_SCALE: Record<
  string,
  {
    priceScale: number;
    qtyScale: number;
  }
> = {
  BTCUSDT: { priceScale: 100, qtyScale: 1000 },
  ETHUSDT: { priceScale: 100, qtyScale: 1000 },
  SOLUSDT: { priceScale: 100, qtyScale: 1000 },
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

export function scaleBalance(amount: number) {
  return Math.round(amount * BALANCE_SCALE);
}

export function unscalePrice(marketId: string, price: number) {
  return price / getMarketScale(marketId).priceScale;
}

export function unscaleQty(marketId: string, qty: number) {
  return qty / getMarketScale(marketId).qtyScale;
}

export function unscaleBalance(amount: number) {
  return amount / BALANCE_SCALE;
}