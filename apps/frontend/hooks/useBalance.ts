import { getBalance } from "@/services/account";
import { useQuery } from "@tanstack/react-query";

export function useBalance() {
  return useQuery({
    queryKey: ["balance"],
    queryFn: getBalance,
  });
}
