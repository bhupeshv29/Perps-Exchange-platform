import { STREAMS, GROUPS } from "@repo/common";

import {
  consumeStreamMessages,
  createConsumerGroup,
  ackStreamMessage,
} from "@repo/redis";

import { redis } from "./redis";

import { markPrices } from "./state/state";

import { publishWsEvent } from "./publish/events";

import { checkLiquidations } from "./liquidation";

type PriceUpdate = {
  marketId: string;
  price: number;
  createdAt: number;
};

export async function startPriceConsumer() {
  await createConsumerGroup(redis, STREAMS.PRICE_UPDATES, GROUPS.ENGINE);

  while (true) {
    const response = await consumeStreamMessages(redis, {
      stream: STREAMS.PRICE_UPDATES,
      group: GROUPS.ENGINE,
      consumer: "engine-price",
    });

    if (!response) {
      continue;
    }

    for (const stream of response) {
      for (const message of stream.messages) {
        try {
          const raw = message.message.payload;

          if (!raw) {
            await ackStreamMessage(
              redis,
              STREAMS.PRICE_UPDATES,
              GROUPS.ENGINE,
              message.id,
            );

            continue;
          }

          const update = JSON.parse(raw) as PriceUpdate;

          markPrices[update.marketId] = update.price;

          await publishWsEvent({
            type: "MARK_PRICE_UPDATE",
            marketId: update.marketId,
            payload: {
              price: update.price,
            },
            createdAt: Date.now(),
          });

          await checkLiquidations(update.marketId);

          await ackStreamMessage(
            redis,
            STREAMS.PRICE_UPDATES,
            GROUPS.ENGINE,
            message.id,
          );
        } catch (error) {
          console.error("price update processing failed", error);

          await ackStreamMessage(
            redis,
            STREAMS.PRICE_UPDATES,
            GROUPS.ENGINE,
            message.id,
          );
        }
      }
    }
  }
}
