import { randomUUID } from "crypto";

import { STREAMS, GROUPS } from "@repo/common";
import type { EngineRequest, EngineResponse } from "@repo/common";

import {
  ackStreamMessage,
  consumeStreamMessages,
  createConsumerGroup,
  publishStreamMessage,
} from "@repo/redis";

import { redis } from "../redis";

const pendingRequests = new Map<
  string,
  {
    resolve: (value: EngineResponse) => void;
    reject: (error: Error) => void;
  }
>();

const TIMEOUT_MS = 5000;

export async function sendToEngine(
  request: Omit<EngineRequest, "requestId">,
): Promise<EngineResponse> {
  const requestId = randomUUID();

  const fullRequest = {
    ...request,
    requestId,
  } as EngineRequest;

  const promise = new Promise<EngineResponse>((resolve, reject) => {
    const timeout = setTimeout(() => {
      pendingRequests.delete(requestId);

      reject(new Error("engine timeout"));
    }, TIMEOUT_MS);

    pendingRequests.set(requestId, {
      resolve: (value) => {
        clearTimeout(timeout);
        resolve(value);
      },

      reject: (error) => {
        clearTimeout(timeout);
        reject(error);
      },
    });
  });

  try {
    await publishStreamMessage(redis, STREAMS.ENGINE_REQUESTS, fullRequest);

    return promise;
  } catch (error) {
    pendingRequests.delete(requestId);
    throw error;
  }
}

export async function startLoopbackConsumer() {
  await createConsumerGroup(redis, STREAMS.ENGINE_RESPONSES, GROUPS.BACKEND);

  while (true) {
    const response = await consumeStreamMessages(redis, {
      stream: STREAMS.ENGINE_RESPONSES,
      group: GROUPS.BACKEND,
      consumer: "backend-1",
    });

    if (!response) continue;

    for (const stream of response) {
      for (const message of stream.messages) {
        const raw = message.message.payload;

        if (!raw) {
          await ackStreamMessage(
            redis,
            STREAMS.ENGINE_RESPONSES,
            GROUPS.BACKEND,
            message.id,
          );

          continue;
        }

        try {
          const engineResponse = JSON.parse(raw) as EngineResponse;

          const pending = pendingRequests.get(engineResponse.requestId);

          if (pending) {
            pending.resolve(engineResponse);
            pendingRequests.delete(engineResponse.requestId);
          }

          await ackStreamMessage(
            redis,
            STREAMS.ENGINE_RESPONSES,
            GROUPS.BACKEND,
            message.id,
          );
        } catch (error) {
          console.error("failed to process engine response", error);

          await ackStreamMessage(
            redis,
            STREAMS.ENGINE_RESPONSES,
            GROUPS.BACKEND,
            message.id,
          );
        }
      }
    }
  }
}
