import { WebSocketServer, WebSocket } from "ws";
import { CHANNELS, type WsEvent } from "@repo/common";

import { connectRedis, redis } from "./redis";
import { verifyToken } from "./auth";
import { formatWsEvent } from "./formatWsEvent";

type Client = {
  ws: WebSocket;
  marketIds: Set<string>;
  userId?: string;
};

type PrivateWsEvent = Extract<
  WsEvent,
  {
    userId: string;
  }
>;

const clients = new Set<Client>();

const wss = new WebSocketServer({
  port: Number(process.env.WS_PORT || 3002),
});

function parseCookies(cookieHeader?: string): Record<string, string> {
  if (!cookieHeader) {
    return {};
  }

  return cookieHeader
    .split(";")
    .reduce<Record<string, string>>((acc, cookie) => {
      const [key, ...value] = cookie.trim().split("=");

      if (!key) {
        return acc;
      }

      acc[key] = decodeURIComponent(value.join("="));

      return acc;
    }, {});
}

function getUserIdFromCookie(cookieHeader?: string): string | undefined {
  const cookies = parseCookies(cookieHeader);

  const token = cookies.token;

  if (!token) {
    return undefined;
  }

  try {
    const payload = verifyToken(token);

    return payload.userId;
  } catch {
    return undefined;
  }
}

wss.on("connection", (ws, req) => {
  const client: Client = {
    ws,
    userId: getUserIdFromCookie(req.headers.cookie),
    marketIds: new Set(),
  };

  clients.add(client);

  ws.on("message", (raw) => {
    try {
      const message = JSON.parse(raw.toString());

      if (message.type === "SUBSCRIBE_MARKET") {
        client.marketIds.add(message.marketId);
        return;
      }

      if (message.type === "UNSUBSCRIBE_MARKET") {
        client.marketIds.delete(message.marketId);
        return;
      }

      ws.send(
        JSON.stringify({
          type: "ERROR",
          message: "unknown ws message type",
        }),
      );
    } catch {
      ws.send(
        JSON.stringify({
          type: "ERROR",
          message: "invalid ws message",
        }),
      );
    }
  });

  ws.on("close", () => {
    clients.delete(client);
  });

  ws.on("error", () => {
    clients.delete(client);
  });
});

function sendToClient(client: Client, event: WsEvent) {
  if (client.ws.readyState !== WebSocket.OPEN) return;

  const formattedEvent = formatWsEvent(event);
  const message = JSON.stringify(formattedEvent);

  if (!message) return;

  client.ws.send(message);
}

function isPrivateEvent(event: WsEvent): event is PrivateWsEvent {
  return "userId" in event;
}

function broadcastEvent(event: WsEvent) {
  for (const client of clients) {
    if (isPrivateEvent(event)) {
      if (!client.userId) {
        continue;
      }

      if (client.userId !== event.userId) {
        continue;
      }

      sendToClient(client, event);

      continue;
    }

    if ("marketId" in event) {
      if (!client.marketIds.has(event.marketId)) {
        continue;
      }

      sendToClient(client, event);
    }
  }
}

async function main() {
  await connectRedis();

  await redis.subscribe(CHANNELS.WS_EVENTS, (raw) => {
    try {
      const event = JSON.parse(raw) as WsEvent;

      broadcastEvent(event);
    } catch (error) {
      console.error("failed to parse ws event", error);
    }
  });

  console.log("ws-gateway running on port 3002");
}

main().catch((error) => {
  console.error("ws-gateway startup failed", error);

  process.exit(1);
});
