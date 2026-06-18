import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deposit } from "@/services/account";

export function useDeposit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deposit,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["balance"] });
    },
  });
}
