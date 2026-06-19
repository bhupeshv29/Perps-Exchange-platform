import { MARKETS, STREAMS, scalePrice } from "@repo/common";
import { publishStreamMessage } from "@repo/redis";
import { connectRedis, redis } from "./redis";

const streams = Object.keys(MARKETS)
  .map((marketId) => `${marketId.toLowerCase()}@markPrice@1s`)
  .join("/");

const BINANCE_WS_URL = `wss://fstream.binance.com/market/stream?streams=${streams}`;

type BinanceCombinedMessage = {
  stream: string;
  data: {
    e: "markPriceUpdate";
    E: number;
    s: string;
    p: string;
    r: string;
  };
};

function connectBinance() {
  const ws = new WebSocket(BINANCE_WS_URL);

  ws.onopen = () => {
    console.log("binance mark price ws connected");
  };

  ws.onmessage = async (event) => {
    try {
      const message = JSON.parse(String(event.data)) as BinanceCombinedMessage;

      const marketId = message.data.s;
      const markPrice = Number(message.data.p);

      if (!MARKETS[marketId]) return;
      if (!Number.isFinite(markPrice)) return;

      await publishStreamMessage(redis, STREAMS.PRICE_UPDATES, {
        marketId,
        price: scalePrice(marketId, markPrice),
        createdAt: message.data.E,
      });

      console.log("mark price", marketId, markPrice);
    } catch (error) {
      console.error("failed to process binance mark price", error);
    }
  };

  ws.onerror = (error) => {
    console.error("binance ws error", error);
  };

  ws.onclose = () => {
    console.error("binance ws closed, reconnecting...");
    setTimeout(connectBinance, 3000);
  };
}

async function main() {
  await connectRedis();
  connectBinance();
}

main();
