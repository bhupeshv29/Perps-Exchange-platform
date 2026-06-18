import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { cancelOrder } from "@/services/order";

export function useCancelOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cancelOrder,

    onSuccess: (response) => {
      if (response.type === "ERROR") {
        toast.error(response.error || "Cancel failed");
        return;
      }

      toast.success("Order cancelled");

      queryClient.invalidateQueries({ queryKey: ["balance"] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },

    onError: () => {
      toast.error("Failed to cancel order");
    },
  });
}
