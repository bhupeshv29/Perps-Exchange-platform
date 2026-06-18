import { useMutation, useQueryClient } from "@tanstack/react-query";
import { cancelOrder } from "@/services/order";

export function useCancelOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cancelOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["balance"] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}
