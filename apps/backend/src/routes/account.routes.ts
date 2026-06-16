import { Router } from "express";
import { prisma } from "@repo/db";
import { requireAuth, type AuthRequest } from "../middleware/auth";
import { validateBody } from "../middleware/validate";
import { onRampSchema } from "../schemas/order.schema";
import { sendToEngine } from "../services/loopback";
import {
  scaleBalance,
  unscaleBalance,
  unscalePrice,
  unscaleQty,
} from "../utils/scaling";

export const accountRouter = Router();

accountRouter.post(
  "/on-ramp",
  requireAuth,
  validateBody(onRampSchema),
  async (req: AuthRequest, res) => {
    const response = await sendToEngine({
      type: "ON_RAMP",
      payload: {
        userId: req.userId!,
        amount: scaleBalance(req.body.amount),
      },
    });

    if (response.type !== "ON_RAMP_SUCCESS") return res.json(response);

    return res.json({
      ...response,
      payload: {
        ...response.payload,
        available: unscaleBalance(response.payload.available),
        locked: unscaleBalance(response.payload.locked),
      },
    });
  },
);

accountRouter.get("/balance", requireAuth, async (req: AuthRequest, res) => {
  const response = await sendToEngine({
    type: "GET_BALANCE",
    payload: { userId: req.userId! },
  });

  if (response.type !== "BALANCE") return res.json(response);

  return res.json({
    ...response,
    payload: {
      ...response.payload,
      available: unscaleBalance(response.payload.available),
      locked: unscaleBalance(response.payload.locked),
    },
  });
});

accountRouter.get("/positions", requireAuth, async (req: AuthRequest, res) => {
  const response = await sendToEngine({
    type: "GET_POSITIONS",
    payload: { userId: req.userId! },
  });

  if (response.type !== "POSITIONS") return res.json(response);

  return res.json({
    ...response,
    payload: response.payload.map((p) => ({
      ...p,
      qty: unscaleQty(p.marketId, p.qty),
      entryPrice: unscalePrice(p.marketId, p.entryPrice),
      margin: unscaleBalance(p.margin),
      realizedPnl: unscaleBalance(p.realizedPnl),
    })),
  });
});

accountRouter.get("/orders", requireAuth, async (req: AuthRequest, res) => {
  const orders = await prisma.order.findMany({
    where: { userId: req.userId! },
    orderBy: { createdAt: "desc" },
  });

  return res.json({
    orders: orders.map((o) => ({
      ...o,
      price: o.price === null ? null : unscalePrice(o.marketId, o.price),
      qty: unscaleQty(o.marketId, o.qty),
      filledQty: unscaleQty(o.marketId, o.filledQty),
      margin: unscaleBalance(o.margin),
    })),
  });
});

accountRouter.get("/fills", requireAuth, async (req: AuthRequest, res) => {
  const fills = await prisma.fill.findMany({
    where: {
      OR: [{ makerUserId: req.userId! }, { takerUserId: req.userId! }],
    },
    orderBy: { createdAt: "desc" },
  });

  return res.json({
    fills: fills.map((f) => ({
      ...f,
      price: unscalePrice(f.marketId, f.price),
      qty: unscaleQty(f.marketId, f.qty),
    })),
  });
});

accountRouter.get(
  "/closed-positions",
  requireAuth,
  async (req: AuthRequest, res) => {
    const positions = await prisma.closedPosition.findMany({
      where: { userId: req.userId! },
      orderBy: { closedAt: "desc" },
    });

    return res.json({
      positions: positions.map((p) => ({
        ...p,
        qty: unscaleQty(p.marketId, p.qty),
        entryPrice: unscalePrice(p.marketId, p.entryPrice),
        exitPrice: unscalePrice(p.marketId, p.exitPrice),
        margin: unscaleBalance(p.margin),
        realizedPnl: unscaleBalance(p.realizedPnl),
      })),
    });
  },
);
