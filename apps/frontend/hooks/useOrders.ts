import { getOrders } from "@/services/order";
import { useQuery } from "@tanstack/react-query";

export function useOrders() {
  return useQuery({
    queryKey: ["orders"],
    queryFn: getOrders,
  });
}
