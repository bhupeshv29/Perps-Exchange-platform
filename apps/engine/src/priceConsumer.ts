import { GROUPS, STREAMS } from "@repo/common";
import type { MarkPriceUpdate } from "@repo/common";

import {
  ackStreamMessage,
  consumeStreamMessages,
  createConsumerGroup,
} from "@repo/redis";

import { redis } from "./redis";
import { processPriceUpdate } from "./handlers/priceUpdate";

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

          const update = JSON.parse(raw) as MarkPriceUpdate;

          await processPriceUpdate(update);

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
