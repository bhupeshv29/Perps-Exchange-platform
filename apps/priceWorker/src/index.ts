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


// similuating a fake data now -> later will connect with binance ws. 
// challenge is market selection.(can send all the registered market to engine.) then surely i need to move to common package
// 