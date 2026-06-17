import { getMarkets } from "@/services/market";
import { useQuery } from "@tanstack/react-query";

export function useMarkets() {
  return useQuery({
    queryKey: ["markets"],
    queryFn: getMarkets,
  });
}
