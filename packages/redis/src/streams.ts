import type { RedisClientType } from "redis";

export async function publishStreamMessage(
  redis: RedisClientType,
  stream: string,
  message: unknown,
) {
  return redis.xAdd(stream, "*", {
    payload: JSON.stringify(message),
  });
}

export async function createConsumerGroup(
  redis: RedisClientType,
  stream: string,
  group: string,
) {
  try {
    await redis.xGroupCreate(stream, group, "0", {
      MKSTREAM: true,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    if (!message.includes("BUSYGROUP")) {
      throw error;
    }
  }
}

export async function consumeStreamMessages(
  redis: RedisClientType,
  input: {
    stream: string;
    group: string;
    consumer: string;
    count?: number;
    blockMs?: number;
  },
) {
  return redis.xReadGroup(
    input.group,
    input.consumer,
    {
      key: input.stream,
      id: ">",
    },
    {
      COUNT: input.count ?? 100,
      BLOCK: input.blockMs ?? 1000,
    },
  );
}

export async function ackStreamMessage(
  redis: RedisClientType,
  stream: string,
  group: string,
  messageId: string,
) {
  return redis.xAck(stream, group, messageId);
}
