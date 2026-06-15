import { publishStreamMessage } from "@repo/redis";
import { STREAMS } from "@repo/common";
import { redis } from "../redis";

export async function publishResponse(response: unknown) {
  await publishStreamMessage(redis, STREAMS.ENGINE_RESPONSES, response);
}
