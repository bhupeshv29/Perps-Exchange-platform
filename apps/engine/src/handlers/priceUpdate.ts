import type { MarkPriceUpdate } from "@repo/common";

import { markPrices } from "../state/state";
import { publishWsEvent } from "../publish/events";
import { checkLiquidations } from "../liquidation";

export async function processPriceUpdate(
  update: MarkPriceUpdate,
): Promise<void> {
  markPrices[update.marketId] = update.price;

  publishWsEvent({
    type: "MARK_PRICE_UPDATE",
    marketId: update.marketId,
    payload: {
      price: update.price,
    },
    createdAt: update.createdAt,
  });

  await checkLiquidations(update.marketId);
}
