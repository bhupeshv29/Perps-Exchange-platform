import type { DbEvent } from "@repo/common";
import { GROUPS, STREAMS } from "@repo/common";
import {
  ackStreamMessage,
  consumeStreamMessages,
  createConsumerGroup,
} from "@repo/redis";

import { connectRedis, redis } from "./redis";
import { handleDbEvent } from "./handlers/handleDbEvents";

async function startDbWorker() {
  await connectRedis();

  await createConsumerGroup(redis, STREAMS.DB_EVENTS, GROUPS.DB_WORKER);

  while (true) {
    const response = await consumeStreamMessages(redis, {
      stream: STREAMS.DB_EVENTS,
      group: GROUPS.DB_WORKER,
      consumer: "db-worker-1",
    });

    if (!response) continue;

    for (const stream of response) {
      for (const message of stream.messages) {
        const raw = message.message.payload;

        if (!raw) {
          await ackStreamMessage(
            redis,
            STREAMS.DB_EVENTS,
            GROUPS.DB_WORKER,
            message.id,
          );
          continue;
        }

        try {
          const event = JSON.parse(raw) as DbEvent;

          await handleDbEvent(event);

          await ackStreamMessage(
            redis,
            STREAMS.DB_EVENTS,
            GROUPS.DB_WORKER,
            message.id,
          );
        } catch (error) {
          console.error("failed to process db event", error);
        }
      }
    }
  }
}

startDbWorker();
