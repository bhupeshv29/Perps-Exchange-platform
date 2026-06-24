import { Router } from "express";
import { prisma } from "@repo/db";

import { requireAuth } from "../middleware/auth";
import { validateBody } from "../middleware/validate";
import {
  createRazorpayOrderSchema,
  createStripeCheckoutSchema,
} from "../schemas/payment.schema";
import { razorpay, stripe } from "../services/payment.service";
import { PaymentProvider, PaymentStatus } from "@repo/common";



export const paymentRouter = Router();

paymentRouter.post(
  "/stripe/checkout",
  requireAuth,
  validateBody(createStripeCheckoutSchema),
  async (req, res) => {
    const userId = req.userId!;
    const { amount } = req.body;

    const payment = await prisma.payment.create({
      data: {
        userId,
        amount,
        currency: "INR",
        provider: PaymentProvider.STRIPE,
        status: PaymentStatus.CREATED,
      },
    });

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      success_url: `${process.env.FRONTEND_URL}/trade/BTCUSDT?payment=success`,
      cancel_url: `${process.env.FRONTEND_URL}/trade/BTCUSDT?payment=cancelled`,
      metadata: {
        paymentId: payment.id,
        userId,
        amount: String(amount),
      },
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "inr",
            unit_amount: amount * 100,
            product_data: {
              name: "LeverageX Demo Deposit",
            },
          },
        },
      ],
    });

    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        providerOrderId: session.id,
        status: PaymentStatus.PENDING,
      },
    });

    return res.json({
      checkoutUrl: session.url,
    });
  },
);

paymentRouter.post(
  "/razorpay/order",
  requireAuth,
  validateBody(createRazorpayOrderSchema),
  async (req, res) => {
    const userId = req.userId!;
    const { amount } = req.body;

    const payment = await prisma.payment.create({
      data: {
        userId,
        amount,
        currency: "INR",
        provider: PaymentProvider.RAZORPAY,
        status: PaymentStatus.CREATED,
      },
    });

    const order = await razorpay.orders.create({
      amount: amount * 100,
      currency: "INR",
      receipt: payment.id,
      notes: {
        paymentId: payment.id,
        userId,
        amount: String(amount),
      },
    });

    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        providerOrderId: order.id,
        status: PaymentStatus.PENDING,
      },
    });

    return res.json({
      keyId: process.env.RAZORPAY_KEY_ID,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      paymentId: payment.id,
    });
  },
);

