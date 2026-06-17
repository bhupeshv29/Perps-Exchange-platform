import { useMutation } from "@tanstack/react-query";
import { createOrder } from "@/services/order";

export function useCreateOrder() {
  return useMutation({
    mutationFn: createOrder,
  });
}
