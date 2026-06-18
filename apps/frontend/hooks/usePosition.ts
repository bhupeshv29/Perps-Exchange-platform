import { getPositions } from "@/services/account";
import { useQuery } from "@tanstack/react-query";

export function usePositions() {
  return useQuery({
    queryKey: ["positions"],
    queryFn: getPositions,
  });
}
