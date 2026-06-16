import { Router } from "express";
import { requireAuth, type AuthRequest } from "../middleware/auth";
import { validateBody } from "../middleware/validate";
import { createOrderSchema, cancelOrderSchema } from "../schemas/order.schema";
import { sendToEngine } from "../services/loopback";
import { scaleMargin, scalePrice, scaleQty } from "../utils/scaling";

export const orderRouter = Router();

orderRouter.post(
  "/",
  requireAuth,
  validateBody(createOrderSchema),
  async (req: AuthRequest, res) => {
    try {
      const body = req.body;

      const response = await sendToEngine({
        type: "CREATE_ORDER",
        payload: {
          userId: req.userId!,
          marketId: body.marketId,
          side: body.side,
          orderType: body.orderType,
          price:
            body.price === undefined
              ? undefined
              : scalePrice(body.marketId, body.price),
          qty: scaleQty(body.marketId, body.qty),
          margin: scaleMargin(body.marketId, body.margin),
          leverage: body.leverage,
        },
      });

      if (response.type === "ORDER_REJECTED" || response.type === "ERROR") {
        return res.status(400).json(response);
      }

      return res.status(201).json(response);
    } catch (error) {
      return res.status(504).json({
        message: error instanceof Error ? error.message : "Engine timeout",
      });
    }
  },
);

orderRouter.delete(
  "/",
  requireAuth,
  validateBody(cancelOrderSchema),
  async (req: AuthRequest, res) => {
    try {
      const response = await sendToEngine({
        type: "CANCEL_ORDER",
        payload: {
          userId: req.userId!,
          ...req.body,
        },
      });

      if (response.type === "ERROR") {
        return res.status(400).json(response);
      }

      return res.json(response);
    } catch (error) {
      return res.status(504).json({
        message: error instanceof Error ? error.message : "Engine timeout",
      });
    }
  },
);
