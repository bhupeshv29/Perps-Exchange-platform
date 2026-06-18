import { getDepth } from "@/services/market";
import { useQuery } from "@tanstack/react-query";

export function useDepth(marketId: string) {
  return useQuery({
    queryKey: ["depth", marketId],
    queryFn: () => getDepth(marketId),
    enabled: !!marketId,
  });
}

