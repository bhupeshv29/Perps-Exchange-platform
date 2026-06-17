import { getBalance, getPosition } from "@/services/account";
import { useQuery } from "@tanstack/react-query";

export function usePosition() {
  return useQuery({
    queryKey: ["positions"],
    queryFn: getPosition,
  });
}
