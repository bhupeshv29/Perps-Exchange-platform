import { z } from "zod";

const positiveNumber = z.number().positive("Must be greater than 0");

export const orderFormSchema = z
  .object({
    side: z.enum(["BID", "ASK"]),
    orderType: z.enum(["LIMIT", "MARKET"]),
    price: z.number().positive("Price must be greater than 0").optional(),
    qty: positiveNumber,
    margin: positiveNumber,
    leverage: z.number().min(1).max(20),
  })
  .superRefine((data, ctx) => {
    if (data.orderType === "LIMIT" && !data.price) {
      ctx.addIssue({
        code: "custom",
        path: ["price"],
        message: "Price is required for limit orders",
      });
    }
  });

export type OrderFormInput = z.infer<typeof orderFormSchema>;

export type CreateOrderInput = OrderFormInput & {
  marketId: string;
};
