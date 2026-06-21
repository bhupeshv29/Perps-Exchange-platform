import { getOrders } from "@/services/order";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";

export function useOrders() {
  const { status } = useSession();

  return useQuery({
    queryKey: ["orders"],
    queryFn: getOrders,
    enabled: status === "authenticated",
  });
}
