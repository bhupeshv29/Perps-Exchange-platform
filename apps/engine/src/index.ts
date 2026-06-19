import { GROUPS, STREAMS } from "@repo/common";
import type { EngineRequest } from "@repo/common";

import {
  ackStreamMessage,
  consumeStreamMessages,
  createConsumerGroup,
} from "@repo/redis";

import { connectRedis, redis } from "./redis";
import { publishResponse } from "./publish/publish";
import { processEngineRequest } from "./engine";
import { saveSnapshot } from "./snapshot/saveSnapShot";
import { loadSnapshot } from "./snapshot/loadSnapShot";
import { startPriceConsumer } from "./priceConsumer";
import { startFundingWorker } from "./funding";

async function startEngineRequestConsumer() {
  while (true) {
    const response = await consumeStreamMessages(redis, {
      stream: STREAMS.ENGINE_REQUESTS,
      group: GROUPS.ENGINE,
      consumer: "engine-1",
    });

    if (!response) continue;

    for (const stream of response) {
      for (const message of stream.messages) {
        const raw = message.message.payload;

        if (!raw) {
          await ackStreamMessage(
            redis,
            STREAMS.ENGINE_REQUESTS,
            GROUPS.ENGINE,
            message.id,
          );
          continue;
        }

        try {
          const request = JSON.parse(raw) as EngineRequest;
          const engineResponse = await processEngineRequest(request);

          await publishResponse(engineResponse);

          await ackStreamMessage(
            redis,
            STREAMS.ENGINE_REQUESTS,
            GROUPS.ENGINE,
            message.id,
          );
        } catch (error) {
          console.error("failed to process engine request", error);

          await ackStreamMessage(
            redis,
            STREAMS.ENGINE_REQUESTS,
            GROUPS.ENGINE,
            message.id,
          );
        }
      }
    }
  }
}

async function startEngine() {
  await connectRedis();

  await Promise.all([
    createConsumerGroup(redis, STREAMS.ENGINE_REQUESTS, GROUPS.ENGINE),
    createConsumerGroup(redis, STREAMS.PRICE_UPDATES, GROUPS.ENGINE),
  ]);

  await loadSnapshot();
  startFundingWorker();

  setInterval(() => {
    saveSnapshot().catch(console.error);
  }, 30_000);

  startEngineRequestConsumer().catch((error) => {
    console.error("engine request consumer crashed", error);
    process.exit(1);
  });

  startPriceConsumer().catch((error) => {
    console.error("price consumer crashed", error);
    process.exit(1);
  });

  console.log("engine running");
}

async function gracefulShutdown() {
  try {
    await saveSnapshot();
    console.log("final snapshot saved");
  } catch (error) {
    console.error("failed to save snapshot", error);
  }

  process.exit(0);
}

process.once("SIGINT", gracefulShutdown);
process.once("SIGTERM", gracefulShutdown);

startEngine().catch((error) => {
  console.error("engine startup failed", error);
  process.exit(1);
});
