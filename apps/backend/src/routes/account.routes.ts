import { Router } from "express";
import { requireAuth, type AuthRequest } from "../middleware/auth";
import { validateBody } from "../middleware/validate";
import { onRampSchema } from "../schemas/order.schema";
import { sendToEngine } from "../services/loopback";

export const accountRouter = Router();

accountRouter.post(
  "/on-ramp",
  requireAuth,
  validateBody(onRampSchema),
  async (req: AuthRequest, res) => {
    try {
      const response = await sendToEngine({
        type: "ON_RAMP",
        payload: {
          userId: req.userId!,
          ...req.body,
        },
      });

      return res.json(response);
    } catch (error) {
      return res.status(504).json({
        message: error instanceof Error ? error.message : "Engine timeout",
      });
    }
  },
);

accountRouter.get("/balance", requireAuth, async (req: AuthRequest, res) => {
  try {
    const response = await sendToEngine({
      type: "GET_BALANCE",
      payload: {
        userId: req.userId!,
      },
    });

    return res.json(response);
  } catch (error) {
    return res.status(504).json({
      message: error instanceof Error ? error.message : "Engine timeout",
    });
  }
});

accountRouter.get("/positions", requireAuth, async (req: AuthRequest, res) => {
  try {
    const response = await sendToEngine({
      type: "GET_POSITIONS",
      payload: {
        userId: req.userId!,
      },
    });

    return res.json(response);
  } catch (error) {
    return res.status(504).json({
      message: error instanceof Error ? error.message : "Engine timeout",
    });
  }
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
      positions,
    });
  },
);

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
    orders,
  });
});

accountRouter.get("/fills", requireAuth, async (req: AuthRequest, res) => {
  const fills = await prisma.fill.findMany({
    where: {
      OR: [
        {
          makerUserId: req.userId!,
        },
        {
          takerUserId: req.userId!,
        },
      ],
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return res.json({
    fills,
  });
});
