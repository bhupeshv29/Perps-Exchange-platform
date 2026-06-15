import { GROUPS, STREAMS } from "@repo/common";
import type { EngineRequest } from "@repo/common";

import {
  ackStreamMessage,
  consumeStreamMessages,
  createConsumerGroup,
} from "@repo/redis";

import { connectRedis, redis } from "./redis";

import { publishResponse } from "./publish/publish";

import { processOnRamp } from "./handlers/onRamp";
import { processGetBalance } from "./handlers/getBalance";
import { processGetPositions } from "./handlers/getPositions";
import { processGetDepth } from "./handlers/getDepth";
import { processCreateOrder } from "./handlers/createOrder";
import { processCancelOrder } from "./handlers/cancelOrder";
import { processPriceUpdate, type PriceUpdate } from "./handlers/priceUpdate";

async function processEngineRequest(request: EngineRequest) {
  switch (request.type) {
    case "ON_RAMP":
      return processOnRamp(request);

    case "GET_BALANCE":
      return processGetBalance(request);

    case "GET_POSITIONS":
      return processGetPositions(request);

    case "GET_DEPTH":
      return processGetDepth(request);

    case "CREATE_ORDER":
      return processCreateOrder(request);

    case "CANCEL_ORDER":
      return processCancelOrder(request);
  }
}

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

          if (engineResponse) {
            await publishResponse(engineResponse);
          }

          await ackStreamMessage(
            redis,
            STREAMS.ENGINE_REQUESTS,
            GROUPS.ENGINE,
            message.id,
          );
        } catch (error) {
          console.error("failed to process engine request", error);
        }
      }
    }
  }
}

async function startPriceConsumer() {
  while (true) {
    const response = await consumeStreamMessages(redis, {
      stream: STREAMS.PRICE_UPDATES,
      group: GROUPS.ENGINE,
      consumer: "engine-price-1",
    });

    if (!response) continue;

    for (const stream of response) {
      for (const message of stream.messages) {
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

        try {
          const update = JSON.parse(raw) as PriceUpdate;

          await processPriceUpdate(update);

          await ackStreamMessage(
            redis,
            STREAMS.PRICE_UPDATES,
            GROUPS.ENGINE,
            message.id,
          );
        } catch (error) {
          console.error("failed to process price update", error);
        }
      }
    }
  }
}

async function startEngine() {
  await connectRedis();
  startPriceConsumer().catch(console.error);
  await createConsumerGroup(redis, STREAMS.ENGINE_REQUESTS, GROUPS.ENGINE);
  await createConsumerGroup(redis, STREAMS.PRICE_UPDATES, GROUPS.ENGINE);

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

startEngine();
