import { useMutation } from "@tanstack/react-query";

import { cancelOrder } from "@/services/order";

export function useCancelOrder() {
  return useMutation({
    mutationFn: cancelOrder,
  });
}
