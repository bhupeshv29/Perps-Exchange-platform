import { STREAMS, GROUPS } from "@repo/common";

import type { EngineRequest } from "@repo/common";

import {
  consumeStreamMessages,
  createConsumerGroup,
  ackStreamMessage,
} from "@repo/redis";

import { connectRedis, redis } from "./redis";

import { processOnRamp } from "./handlers/onRamp";
import { publishResponse } from "./publish/publish";
import { processGetPositions } from "./handlers/getPositions";
import { processGetBalance } from "./handlers/getBalance";
import { processCreateOrder } from "./handlers/createOrder";

async function startEngine() {
  await connectRedis();

  await createConsumerGroup(redis, STREAMS.ENGINE_REQUESTS, GROUPS.ENGINE);

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

          switch (request.type) {
            case "ON_RAMP": {
              const response = await processOnRamp(request);
              await publishResponse(response);
              break;
            }

            case "GET_BALANCE": {
              const response = await processGetBalance(request);
              await publishResponse(response);
              break;
            }

            case "GET_POSITIONS": {
              const response = await processGetPositions(request);
              await publishResponse(response);
              break;
            }

            case "CREATE_ORDER": {
              const response = await processCreateOrder(request);
              await publishResponse(response);
              break;
            }
          }

          await ackStreamMessage(
            redis,
            STREAMS.ENGINE_REQUESTS,
            GROUPS.ENGINE,
            message.id,
          );
        } catch (error) {
          console.error(error);
        }
      }
    }
  }
}

startEngine();
