import { getPositions } from "@/services/account";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";

export function usePositions() {
  const { status } = useSession();

  return useQuery({
    queryKey: ["positions"],
    queryFn: getPositions,
    enabled: status === "authenticated",
  });
}
