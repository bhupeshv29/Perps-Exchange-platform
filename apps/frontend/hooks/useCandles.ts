import { useQuery } from "@tanstack/react-query";
import { getCandles } from "@/services/market";

export function useCandles(marketId: string) {
  return useQuery({
    queryKey: ["candles", marketId, "1m"],
    queryFn: () =>
      getCandles({
        marketId,
        interval: "1m",
        limit: 500,
      }),
    enabled: !!marketId,
  });
}