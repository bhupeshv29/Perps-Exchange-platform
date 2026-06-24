import z from "zod";

export const createStripeCheckoutSchema = z.object({
  amount: z.coerce.number().int().positive(),
});
export const createRazorpayOrderSchema = z.object({
  amount: z.coerce.number().int().positive(),
});
export const verifyRazorPaymentSchema = z.object({
  paymentId: z.string().min(1),
  orderId: z.string().min(1),
  signature: z.string().min(1),
});

