import { useQuery } from "@tanstack/react-query";

import { getFills } from "@/services/account";

export function useFills() {
  return useQuery({
    queryKey: ["fills"],
    queryFn: getFills,
  });
}
