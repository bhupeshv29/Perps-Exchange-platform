import { z } from "zod";
import { DEFAULT_LEVERAGE, MAX_LEVERAGE } from "@repo/common";

export const createOrderSchema = z.object({
  marketId: z.string().min(1),
  side: z.enum(["BUY", "SELL"]),
  orderType: z.enum(["LIMIT", "MARKET"]),
  price: z.string().optional(),
  qty: z.string(),
  margin: z.string(),
  /**
   * coerce - automatically convert into needed types
   * like "22" -> 22
   */
  leverage: z.coerce
    .number()
    .min(DEFAULT_LEVERAGE)
    .max(MAX_LEVERAGE)
    .default(DEFAULT_LEVERAGE),
});
export const cancelOrderSchema = z.object({
  marketId: z.string().min(1),
  orderId: z.string().min(1),
});

export const onRampSchema = z.object({
  amount: z.string().min(1),
});
