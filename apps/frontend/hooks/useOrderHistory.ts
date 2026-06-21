import { useQuery } from "@tanstack/react-query";
import { getOrderHistory } from "@/services/account";
import { useSession } from "next-auth/react";

export function useOrderHistory() {
  const { status } = useSession();
  return useQuery({
    queryKey: ["order-history"],
    queryFn: getOrderHistory,
    enabled: status === "authenticated",
  });
}
