import { Router } from "express";
import { prisma } from "@repo/db";

import { requireAuth, type AuthRequest } from "../middleware/auth";
import { validateBody } from "../middleware/validate";
import { onRampSchema } from "../schemas/order.schema";
import { sendToEngine } from "../services/loopback";

import {
  unscalePosition,
  scaleBalance,
  unscalePrice,
  unscaleQty,
  unscaleBalance,
  unscaleBalanceResponse,
} from "@repo/common";

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

    if (response.type !== "ON_RAMP_SUCCESS") {
      return res.json(response);
    }

    return res.json({
      ...response,
      payload: unscaleBalanceResponse(response.payload),
    });
  },
);

accountRouter.get("/balance", requireAuth, async (req: AuthRequest, res) => {
  const response = await sendToEngine({
    type: "GET_BALANCE",
    payload: {
      userId: req.userId!,
    },
  });

  if (response.type !== "BALANCE") {
    return res.json(response);
  }

  return res.json({
    ...response,
    payload: unscaleBalanceResponse(response.payload),
  });
});

accountRouter.get("/positions", requireAuth, async (req: AuthRequest, res) => {
  const response = await sendToEngine({
    type: "GET_POSITIONS",
    payload: {
      userId: req.userId!,
    },
  });

  if (response.type !== "POSITIONS") {
    return res.json(response);
  }

  return res.json({
    ...response,
    payload: response.payload.map(unscalePosition),
  });
});

accountRouter.get("/orders", requireAuth, async (req: AuthRequest, res) => {
  const orders = await prisma.order.findMany({
    where: {
      userId: req.userId!,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return res.json({
    orders: orders.map((order) => ({
      ...order,
      price:
        order.price === null ? null : unscalePrice(order.marketId, order.price),
      qty: unscaleQty(order.marketId, order.qty),
      filledQty: unscaleQty(order.marketId, order.filledQty),
      margin: unscaleBalance(order.margin),
    })),
  });
});

accountRouter.get("/fills", requireAuth, async (req: AuthRequest, res) => {
  const fills = await prisma.fill.findMany({
    where: {
      OR: [{ makerUserId: req.userId! }, { takerUserId: req.userId! }],
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return res.json({
    fills: fills.map((fill) => ({
      ...fill,
      price: unscalePrice(fill.marketId, fill.price),
      qty: unscaleQty(fill.marketId, fill.qty),
    })),
  });
});

accountRouter.get(
  "/closed-positions",
  requireAuth,
  async (req: AuthRequest, res) => {
    const positions = await prisma.closedPosition.findMany({
      where: {
        userId: req.userId!,
      },
      orderBy: {
        closedAt: "desc",
      },
    });

    return res.json({
      positions: positions.map((position) => ({
        ...position,
        qty: unscaleQty(position.marketId, position.qty),
        entryPrice: unscalePrice(position.marketId, position.entryPrice),
        exitPrice: unscalePrice(position.marketId, position.exitPrice),
        margin: unscaleBalance(position.margin),
        realizedPnl: unscaleBalance(position.realizedPnl),
      })),
    });
  },
);
