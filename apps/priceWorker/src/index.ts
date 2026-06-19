import { STREAMS } from "@repo/common";
import { publishStreamMessage } from "@repo/redis";
import { connectRedis, redis } from "./redis";

async function main() {
  await connectRedis();

  setInterval(async () => {
    const price = 100000 + Math.floor(Math.random() * 100);

    await publishStreamMessage(redis, STREAMS.PRICE_UPDATES, {
      marketId: "BTCUSDT",
      price,
      createdAt: Date.now(),
    });

    console.log("price update", price);
  }, 1000);
}

main();


// similuating a fake data now -> later will connect with binance ws. 
// challenge is market selection.(can send all the registered market to engine.) then surely i need to move to common package
// 





// import { MARKETS, STREAMS, scalePrice } from "@repo/common";
// import { publishStreamMessage } from "@repo/redis";
// import { connectRedis, redis } from "./redis";

// type BinanceMarkPriceMessage = {
//   stream: string;
//   data: {
//     e: "markPriceUpdate";
//     E: number;
//     s: string;
//     p: string;
//   };
// };

// const BINANCE_FUTURES_WS = "wss://fstream.binance.com/stream";

// function buildStreamUrl() {
//   const streams = Object.values(MARKETS)
//     .filter((market) => market.isActive)
//     .map((market) => `${market.symbol.toLowerCase()}@markPrice@1s`)
//     .join("/");

//   return `${BINANCE_FUTURES_WS}?streams=${streams}`;
// }

// async function publishMarkPrice(marketId: string, rawPrice: string) {
//   const price = Number(rawPrice);

//   if (!Number.isFinite(price) || price <= 0) return;

//   await publishStreamMessage(redis, STREAMS.PRICE_UPDATES, {
//     marketId,
//     price: scalePrice(marketId, price),
//     createdAt: Date.now(),
//   });

//   console.log("mark price", marketId, price);
// }

// function startBinanceMarkPriceStream() {
//   const ws = new WebSocket(buildStreamUrl());

//   ws.onopen = () => {
//     console.log("connected to Binance mark price stream");
//   };

//   ws.onmessage = async (event) => {
//     try {
//       const message = JSON.parse(String(event.data)) as BinanceMarkPriceMessage;

//       const marketId = message.data.s.toUpperCase();
//       const rawPrice = message.data.p;

//       if (!MARKETS[marketId]) return;

//       await publishMarkPrice(marketId, rawPrice);
//     } catch (error) {
//       console.error("failed to process Binance price message", error);
//     }
//   };

//   ws.onerror = (error) => {
//     console.error("Binance websocket error", error);
//   };

//   ws.onclose = () => {
//     console.error("Binance websocket closed. Reconnecting in 3s...");

//     setTimeout(startBinanceMarkPriceStream, 3000);
//   };
// }

// async function main() {
//   await connectRedis();
//   startBinanceMarkPriceStream();
// }

// main().catch((error) => {
//   console.error("price worker failed", error);
//   process.exit(1);
// });