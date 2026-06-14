import { createClient } from "redis";

export function createRedisClient() {
  return createClient({
    url: process.env.REDIS_URL,
  });
}