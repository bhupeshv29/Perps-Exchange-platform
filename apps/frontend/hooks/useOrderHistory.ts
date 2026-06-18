import { useQuery } from "@tanstack/react-query";
import { getOrderHistory } from "@/services/account";

export function useOrderHistory() {
  return useQuery({
    queryKey: ["order-history"],
    queryFn: getOrderHistory,
  });
}