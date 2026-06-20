import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { connectRedis } from "./redis";
import { startLoopbackConsumer } from "./services/loopback";
import { authRouter } from "./routes/auth.routes";
import { orderRouter } from "./routes/order.routes";
import { accountRouter } from "./routes/account.routes";
import { marketRouter } from "./routes/market.routes";
import { accountLimiter, authLimiter, globalLimiter } from "./middleware/rateLimit";

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  }),
);

app.use(express.json());
app.use(cookieParser());
app.set("trust proxy", 1);

app.use(globalLimiter);

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/auth", authLimiter, authRouter);

app.use("/orders", orderRouter);

app.use("/account", accountLimiter, accountRouter);

app.use("/markets", marketRouter);

async function main() {
  await connectRedis();

  startLoopbackConsumer().catch((error) => {
    console.error("engine response consumer crashed", error);
    process.exit(1);
  });

  const port = Number(process.env.PORT || 3001);

  app.listen(port, () => {
    console.log(`backend running on port ${port}`);
  });
}

main();
