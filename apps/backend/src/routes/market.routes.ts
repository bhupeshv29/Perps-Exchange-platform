import { Router } from "express";
import { sendToEngine } from "../services/loopback";

export const marketRouter = Router();

marketRouter.get("/:marketId/depth", async (req, res) => {
  try {
    const response = await sendToEngine({
      type: "GET_DEPTH",
      payload: {
        marketId: req.params.marketId,
      },
    });

    return res.json(response);
  } catch (error) {
    return res.status(504).json({
      message: error instanceof Error ? error.message : "Engine timeout",
    });
  }
});