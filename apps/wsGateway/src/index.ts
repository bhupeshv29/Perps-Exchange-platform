import { WebSocketServer, WebSocket } from "ws";
import { CHANNELS, type WsEvent } from "@repo/common";
import { connectRedis, redis } from "./redis";
import { verifyToken } from "./auth";

type Client = {
  ws: WebSocket;
  marketIds: Set<string>;
  userId?: string;
};

const clients = new Set<Client>();

const wss = new WebSocketServer({
  port: Number(process.env.WS_PORT || 3002),
});

wss.on("connection", (ws) => {
  const client: Client = {
    ws,
    marketIds: new Set(),
  };

  clients.add(client);

  ws.on("message", (raw) => {
    try {
      const message = JSON.parse(raw.toString());

      if (message.type === "AUTH") {
        const payload = verifyToken(message.token);
        client.userId = payload.userId;

        ws.send(
          JSON.stringify({
            type: "AUTH_SUCCESS",
          }),
        );

        return;
      }

      if (message.type === "SUBSCRIBE_MARKET") {
        client.marketIds.add(message.marketId);
        return;
      }

      if (message.type === "UNSUBSCRIBE_MARKET") {
        client.marketIds.delete(message.marketId);
        return;
      }
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
});

function sendToClient(client: Client, event: WsEvent) {
  if (client.ws.readyState !== WebSocket.OPEN) return;
  client.ws.send(JSON.stringify(event));
}

function isPrivateEvent(event: WsEvent) {
  return (
    event.type === "ORDER_UPDATE" ||
    event.type === "POSITION_UPDATE" ||
    event.type === "BALANCE_UPDATE"
  );
}

function broadcastEvent(event: WsEvent) {
  for (const client of clients) {
    if (isPrivateEvent(event)) {
      if (client.userId !== event.userId) continue;
      sendToClient(client, event);
      continue;
    }

    if ("marketId" in event && event.marketId) {
      if (!client.marketIds.has(event.marketId)) continue;
      sendToClient(client, event);
    }
  }
}

async function main() {
  await connectRedis();

  await redis.subscribe(CHANNELS.WS_EVENTS, (raw) => {
    const event = JSON.parse(raw) as WsEvent;
    broadcastEvent(event);
  });

  console.log("ws-gateway running on port 3002");
}

main();