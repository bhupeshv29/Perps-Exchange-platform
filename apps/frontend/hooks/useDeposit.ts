import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { deposit } from "@/services/account";

export function useDeposit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deposit,

    onSuccess: () => {
      toast.success("Deposit successful");
      queryClient.invalidateQueries({ queryKey: ["balance"] });
    },

    onError: () => {
      toast.error("Deposit failed");
    },
  });
}
