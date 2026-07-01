// import { Router } from "express";
// import { prisma } from "@repo/db";
// import { PaymentProvider, PaymentStatus, scaleBalance } from "@repo/common";
// import { requireAuth } from "../middleware/auth";
// import { validateBody } from "../middleware/validate";
// import {
//   createRazorpayOrderSchema,
//   createStripeCheckoutSchema,
//   verifyRazorPaymentSchema,
// } from "../schemas/payment.schema";
// import {
//   razorpay,
//   stripe,
//   verifyRazorpaySignature,
// } from "../services/payment.service";
// import { sendToEngine } from "../services/loopback";

// export const paymentRouter = Router();

// paymentRouter.post(
//   "/stripe/checkout",
//   requireAuth,
//   validateBody(createStripeCheckoutSchema),
//   async (req, res) => {
//     const userId = req.userId!;
//     const { amount } = req.body;

//     const amountInPaise = scaleBalance(amount);

//     const payment = await prisma.payment.create({
//       data: {
//         userId,
//         amount: amountInPaise,
//         currency: "USD",
//         provider: PaymentProvider.STRIPE,
//         status: PaymentStatus.CREATED,
//       },
//     });

//     const session = await stripe.checkout.sessions.create({
//       mode: "payment",
//       payment_method_types: ["card"],
//       success_url: `${process.env.FRONTEND_URL}/trade/BTCUSDT?payment=success`,
//       cancel_url: `${process.env.FRONTEND_URL}/trade/BTCUSDT?payment=cancelled`,
//       metadata: {
//         paymentId: payment.id,
//         userId,
//         amount: String(amountInPaise),
//       },
//       line_items: [
//         {
//           quantity: 1,
//           price_data: {
//             currency: "USD",
//             unit_amount: amountInPaise,
//             product_data: {
//               name: "LeverageX Demo Deposit",
//             },
//           },
//         },
//       ],
//     });

//     await prisma.payment.update({
//       where: { id: payment.id },
//       data: {
//         providerOrderId: session.id,
//         status: PaymentStatus.PENDING,
//       },
//     });

//     return res.json({
//       checkoutUrl: session.url,
//     });
//   },
// );

// paymentRouter.post(
//   "/razorpay/order",
//   requireAuth,
//   validateBody(createRazorpayOrderSchema),
//   async (req, res) => {
//     const userId = req.userId!;
//     const { amount } = req.body;

//     const amountInPaise = scaleBalance(amount);

//     const payment = await prisma.payment.create({
//       data: {
//         userId,
//         amount: amountInPaise,
//         currency: "USD",
//         provider: PaymentProvider.RAZORPAY,
//         status: PaymentStatus.CREATED,
//       },
//     });

//     const order = await razorpay.orders.create({
//       amount: amountInPaise,
//       currency: "USD",
//       receipt: payment.id,
//       notes: {
//         paymentId: payment.id,
//         userId,
//         amount: String(amountInPaise),
//       },
//     });

//     await prisma.payment.update({
//       where: { id: payment.id },
//       data: {
//         providerOrderId: order.id,
//         status: PaymentStatus.PENDING,
//       },
//     });

//     return res.json({
//       keyId: process.env.RAZORPAY_KEY_ID,
//       orderId: order.id,
//       amount: order.amount,
//       currency: order.currency,
//       paymentId: payment.id,
//     });
//   },
// );

// paymentRouter.post(
//   "/razorpay/verify",
//   requireAuth,
//   validateBody(verifyRazorPaymentSchema),
//   async (req, res) => {
//     const userId = req.userId!;
//     const { paymentId, orderId, signature } = req.body;

//     const valid = verifyRazorpaySignature({
//       paymentId,
//       orderId,
//       signature,
//     });

//     if (!valid) {
//       return res.status(400).json({
//         message: "Invalid payment signature",
//       });
//     }

//     const payment = await prisma.payment.findFirst({
//       where: {
//         providerOrderId: orderId,
//         userId,
//       },
//     });

//     if (!payment) {
//       return res.status(404).json({
//         message: "Payment not found",
//       });
//     }

//     const result = await prisma.payment.updateMany({
//       where: {
//         id: payment.id,
//         status: PaymentStatus.PENDING,
//       },
//       data: {
//         status: PaymentStatus.SUCCESS,
//         providerPaymentId: paymentId,
//       },
//     });

//     if (result.count === 0) {
//       return res.json({
//         success: true,
//         message: "Payment already processed",
//       });
//     }

//     await sendToEngine({
//       type: "ON_RAMP",
//       payload: {
//         userId,
//         amount: payment.amount,
//       },
//     });

//     return res.json({
//       success: true,
//       message: "Payment verified and balance credited",
//     });
//   },
// );
