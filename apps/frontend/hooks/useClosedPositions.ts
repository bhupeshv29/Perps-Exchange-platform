import { useQuery } from "@tanstack/react-query";
import { getClosedPositions } from "@/services/account";

export function useClosedPositions() {
  return useQuery({
    queryKey: ["closed-positions"],
    queryFn: getClosedPositions,
  });
}
