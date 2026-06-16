import type { DbEvent, WsEvent } from "@repo/common";
import { CHANNELS, STREAMS } from "@repo/common";
import { publishPubSubMessage, publishStreamMessage } from "@repo/redis";
import { redis } from "../redis";

export async function publishDbEvent(event: DbEvent) {
  try {
    await publishStreamMessage(redis, STREAMS.DB_EVENTS, event);
  } catch (error) {
    console.error("failed to publish db event", {
      type: event.type,
      error,
    });
  }
}

export async function publishWsEvent(event: WsEvent) {
  try {
    await publishPubSubMessage(redis, CHANNELS.WS_EVENTS, event);
  } catch (error) {
    console.error("failed to publish ws event", {
      type: event.type,
      error,
    });
  }
}