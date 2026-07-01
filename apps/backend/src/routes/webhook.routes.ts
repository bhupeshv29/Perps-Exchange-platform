// import { Router } from "express";
// import { prisma } from "@repo/db";
// import { PaymentStatus } from "@repo/common";

// import { sendToEngine } from "../services/loopback";
// import {
//   stripe,
//   verifyRazorpayWebhookSignature,
// } from "../services/payment.service";

// export const webhookRouter = Router();

// webhookRouter.post("/razorpay", async (req, res) => {
//   const signature = req.headers["x-razorpay-signature"];

//   if (!signature || typeof signature !== "string") {
//     return res.status(400).json({ message: "Missing razorpay signature" });
//   }

//   const rawBody = req.body.toString();

//   const valid = verifyRazorpayWebhookSignature({
//     rawBody,
//     signature,
//   });

//   if (!valid) {
//     return res.status(400).json({ message: "Invalid razorpay signature" });
//   }

//   const event = JSON.parse(rawBody);

//   if (event.event === "payment.captured") {
//     const entity = event.payload.payment.entity;

//     const paymentId = entity.notes?.paymentId;
//     const userId = entity.notes?.userId;
//     const amount = Number(entity.notes?.amount);

//     if (!paymentId || !userId || !amount) {
//       return res.status(400).json({ message: "Invalid metadata" });
//     }

//     const result = await prisma.payment.updateMany({
//       where: {
//         id: paymentId,
//         status: PaymentStatus.PENDING,
//       },
//       data: {
//         status: PaymentStatus.SUCCESS,
//         providerPaymentId: entity.id,
//         rawPayload: event,
//       },
//     });

//     if (result.count === 0) {
//       return res.json({ received: true });
//     }

//     await sendToEngine({
//       type: "ON_RAMP",
//       payload: {
//         userId,
//         amount,
//       },
//     });
//   }

//   return res.json({ received: true });
// });

// // stripe
// webhookRouter.post("/stripe", async (req, res) => {
//   const signature = req.headers["stripe-signature"];

//   if (!signature) {
//     return res.status(400).json({ message: "Missing stripe signature" });
//   }

//   let event;

//   try {
//     event = stripe.webhooks.constructEvent(
//       req.body,
//       signature,
//       process.env.STRIPE_WEBHOOK_SECRET!,
//     );
//   } catch {
//     return res.status(400).json({ message: "Invalid stripe signature" });
//   }

//   if (event.type === "checkout.session.completed") {
//     const session = event.data.object;

//     const paymentId = session.metadata?.paymentId;
//     const userId = session.metadata?.userId;
//     const amount = Number(session.metadata?.amount);

//     if (!paymentId || !userId || !amount) {
//       return res.status(400).json({ message: "Invalid metadata" });
//     }

//     const result = await prisma.payment.updateMany({
//       where: {
//         id: paymentId,
//         status: PaymentStatus.PENDING,
//       },
//       data: {
//         status: PaymentStatus.SUCCESS,
//         providerPaymentId: session.payment_intent?.toString(),
//         rawPayload: event as any,
//       },
//     });

//     if (result.count === 0) {
//       return res.json({ received: true });
//     }

//     await sendToEngine({
//       type: "ON_RAMP",
//       payload: {
//         userId,
//         amount,
//       },
//     });
//   }

//   return res.json({ received: true });
// });
