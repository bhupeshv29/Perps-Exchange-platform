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
