import { z } from "zod";
import { DEFAULT_LEVERAGE } from "@repo/common";

export const createOrderSchema = z.object({
  marketId: z.string().min(1),
  side: z.enum(["BID", "ASK"]),
  orderType: z.enum(["LIMIT", "MARKET"]),
  price: z.coerce.number().positive().optional(),
  qty: z.coerce.number().positive(),
  leverage: z.coerce.number().int().positive().default(DEFAULT_LEVERAGE),
  reduceOnly: z.boolean().optional().default(false),
});

export const cancelOrderSchema = z.object({
  marketId: z.string().min(1),
  orderId: z.string().min(1),
});

export const onRampSchema = z.object({
  amount: z.coerce.number().positive(),
});
