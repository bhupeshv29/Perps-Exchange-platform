import { api } from "@/lib/api";

export async function createStripeCheckout(amount: number) {
  const { data } = await api.post<{
    checkoutUrl: string;
  }>("/payments/stripe/checkout", {
    amount,
  });

  return data;
}

export async function createRazorpayOrder(amount: number) {
  const { data } = await api.post<{
    keyId: string;
    orderId: string;
    amount: number;
    currency: string;
    paymentId: string;
  }>("/payments/razorpay/order", {
    amount,
  });

  return data;
}
