import { getMarketConfig } from "./registry";

export function scalePrice(marketId: string, price: number): number {
  return Math.round(price * getMarketConfig(marketId).priceScale);
}

export function unscalePrice(marketId: string, price: number): number {
  return price / getMarketConfig(marketId).priceScale;
}

export function scaleQty(marketId: string, qty: number): number {
  return Math.round(qty * getMarketConfig(marketId).qtyScale);
}

export function unscaleQty(marketId: string, qty: number): number {
  return qty / getMarketConfig(marketId).qtyScale;
}

export function scaleBalance(amount: number): number {
  return Math.round(amount * 100);
}

export function unscaleBalance(amount: number): number {
  return amount / 100;
}