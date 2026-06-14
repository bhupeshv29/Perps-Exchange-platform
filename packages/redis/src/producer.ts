import { createRedisClient } from "./client";

const redis = createRedisClient();

export async function connectProducer() {
  if (!redis.isOpen) {
    await redis.connect();
  }
}

export async function publishMessage(
  stream: string,
  message: unknown
) {
  await redis.xAdd(stream, "*", {
    payload: JSON.stringify(message),
  });
}

export async function publishPubSub(
  channel: string,
  message: unknown
) {
  await redis.publish(
    channel,
    JSON.stringify(message)
  );
}