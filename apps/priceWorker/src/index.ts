import { STREAMS } from "@repo/common";
import { publishStreamMessage } from "@repo/redis";
import { connectRedis, redis } from "./redis";

async function main() {
  await connectRedis();

  setInterval(async () => {
    const price = 100000 + Math.floor(Math.random() * 1000);

    await publishStreamMessage(redis, STREAMS.PRICE_UPDATES, {
      marketId: "BTCUSDT",
      price,
      createdAt: Date.now(),
    });

    console.log("price update", price);
  }, 1000);
}

main();