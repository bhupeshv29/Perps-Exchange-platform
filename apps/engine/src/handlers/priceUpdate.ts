import { publishWsEvent } from "../publish/events";

export type PriceUpdate = {
  marketId: string;
  price: number;
  createdAt: number;
};

export async function processPriceUpdate(update: PriceUpdate) {
  await publishWsEvent({
    type: "MARK_PRICE_UPDATE",
    marketId: update.marketId,
    payload: {
      price: update.price,
    },
    createdAt: update.createdAt,
  });
}