import { getBalance } from "@/services/account";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";

export function useBalance() {
  const { status } = useSession();

  return useQuery({
    queryKey: ["balance"],
    queryFn: getBalance,
    enabled: status === "authenticated",
  });
}
