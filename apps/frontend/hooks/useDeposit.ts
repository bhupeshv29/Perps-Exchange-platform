import { useMutation } from "@tanstack/react-query";
import { deposit } from "@/services/account";

export function useDeposit() {
  return useMutation({
    mutationFn: deposit,
  });
}
