import type { DbEvent, WsEvent } from "@repo/common";
import { CHANNELS, STREAMS } from "@repo/common";
import { publishPubSubMessage, publishStreamMessage } from "@repo/redis";
import { redis } from "../redis";

export async function publishDbEvent(event: DbEvent) {
  await publishStreamMessage(redis, STREAMS.DB_EVENTS, event);
}

export async function publishWsEvent(event: WsEvent) {
  await publishPubSubMessage(redis, CHANNELS.WS_EVENTS, event);
}