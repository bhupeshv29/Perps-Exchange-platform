import { z } from "zod";
import { DEFAULT_LEVERAGE } from "@repo/common";

export const createOrderSchema = z.object({
  marketId: z.string().min(1),
  side: z.enum(["BUY", "SELL"]),
  orderType: z.enum(["LIMIT", "MARKET"]),
  price: z.coerce.number().int().positive().optional(),
  qty: z.coerce.number().int().positive(),
  margin: z.coerce.number().int().positive(),
  leverage: z.coerce.number().default(DEFAULT_LEVERAGE),
});

export const cancelOrderSchema = z.object({
  marketId: z.string().min(1),
  orderId: z.string().min(1),
});

export const onRampSchema = z.object({
  amount: z.coerce.number().int().positive(),
});
