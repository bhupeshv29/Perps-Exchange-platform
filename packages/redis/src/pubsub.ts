import type { RedisClientType } from "redis";

export async function publishPubSubMessage(
  redis: RedisClientType,
  channel: string,
  message: unknown,
) {
  return redis.publish(channel, JSON.stringify(message));
}
