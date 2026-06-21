import { useQuery } from "@tanstack/react-query";
import { getClosedPositions } from "@/services/account";
import { useSession } from "next-auth/react";

export function useClosedPositions() {
  const { status } = useSession();
  return useQuery({
    queryKey: ["closed-positions"],
    queryFn: getClosedPositions,
    enabled: status === "authenticated",
  });
}
