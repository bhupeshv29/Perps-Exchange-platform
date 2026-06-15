import { createRedisClient } from "@repo/redis";

export const redis = createRedisClient();

export async function connectRedis() {
  if (!redis.isOpen) {
    await redis.connect();
  }
}