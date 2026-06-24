import { Router } from "express";
import { sendToEngine } from "../services/loopback";
import { unscalePrice, unscaleQty } from "@repo/common";
import { getMarketCandles } from "../services/timescale";

export const marketRouter = Router();

marketRouter.get("/:marketId/depth", async (req, res) => {
  try {
    const marketId = req.params.marketId;

    const response = await sendToEngine({
      type: "GET_DEPTH",
      payload: { marketId },
    });

    if (response.type !== "DEPTH") return res.json(response);

    return res.json({
      ...response,
      payload: {
        marketId,
        bids: response.payload.bids.map(([price, qty]) => [
          unscalePrice(marketId, price),
          unscaleQty(marketId, qty),
        ]),
        asks: response.payload.asks.map(([price, qty]) => [
          unscalePrice(marketId, price),
          unscaleQty(marketId, qty),
        ]),
      },
    });
  } catch (error) {
    return res.status(504).json({
      message: error instanceof Error ? error.message : "Engine timeout",
    });
  }
});

marketRouter.get("/:marketId/candles", async (req, res) => {
  const { marketId } = req.params;

  const interval = String(req.query.interval || "1m");
  const limit = Math.min(Number(req.query.limit || 500), 1000);

  if (!["1m", "5m", "15m", "1h", "1d"].includes(interval)) {
    return res.status(400).json({
      message: "Invalid interval",
    });
  }

  const candles = await getMarketCandles({
    marketId,
    interval: interval as "1m" | "5m" | "15m" | "1h" | "1d",
    limit,
  });

  return res.json({
    marketId,
    interval,
    candles,
  });
});
