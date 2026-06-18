import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createOrder } from "@/services/order";

export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createOrder,

    onSuccess: (response) => {
      if (response.type === "ORDER_REJECTED" || response.type === "ERROR") {
        toast.error(response.error || "Order rejected");
        return;
      }

      toast.success("Order created");

      queryClient.invalidateQueries({ queryKey: ["balance"] });
      queryClient.invalidateQueries({ queryKey: ["positions"] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["fills"] });
    },

    onError: () => {
      toast.error("Failed to create order");
    },
  });
}
