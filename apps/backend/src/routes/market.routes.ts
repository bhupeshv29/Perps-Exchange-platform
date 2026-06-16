import { Router } from "express";
import { sendToEngine } from "../services/loopback";
import { unscalePrice, unscaleQty } from "../utils/scaling";

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
