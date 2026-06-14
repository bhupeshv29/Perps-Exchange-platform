import { createRedisClient } from "./client";

const redis = createRedisClient();

export async function connectConsumer() {
  if (!redis.isOpen) {
    await redis.connect();
  }
}

export async function consumeMessages(
  stream: string,
  group: string,
  consumer: string
) {
  return redis.xReadGroup(
    group,
    consumer,
    {
      key: stream,
      id: ">",
    },
    {
      COUNT: 100,
      BLOCK: 1000,
    }
  );
}

export async function acknowledgeMessage(
  stream: string,
  group: string,
  messageId: string
) {
  await redis.xAck(
    stream,
    group,
    messageId
  );
}