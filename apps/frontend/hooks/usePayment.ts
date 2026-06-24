import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  createRazorpayOrder,
  createStripeCheckout,
} from "@/services/payment";

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => {
      open: () => void;
    };
  }
}

type RazorpayOptions = {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
  }) => void;
  theme?: {
    color: string;
  };
};

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);

    document.body.appendChild(script);
  });
}

export function useStripeCheckout() {
  return useMutation({
    mutationFn: createStripeCheckout,

    onSuccess: (data) => {
      if (!data.checkoutUrl) {
        toast.error("Stripe checkout URL missing");
        return;
      }

      window.location.href = data.checkoutUrl;
    },

    onError: () => {
      toast.error("Failed to start Stripe checkout");
    },
  });
}

export function useRazorpayOrder() {
  return useMutation({
    mutationFn: createRazorpayOrder,

    onSuccess: async (data) => {
      const loaded = await loadRazorpayScript();

      if (!loaded || !window.Razorpay) {
        toast.error("Failed to load Razorpay");
        return;
      }

      const razorpay = new window.Razorpay({
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: "LeverageX",
        description: "Demo USDT Deposit",
        order_id: data.orderId,

        handler: () => {
          toast.success("Payment submitted. Balance will update after verification.");
        },

        theme: {
          color: "#f0b90b",
        },
      });

      razorpay.open();
    },

    onError: () => {
      toast.error("Failed to create Razorpay order");
    },
  });
}