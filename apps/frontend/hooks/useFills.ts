import { useQuery } from "@tanstack/react-query";

import { getFills } from "@/services/account";
import { useSession } from "next-auth/react";

export function useFills() {
  const { status } = useSession();

  return useQuery({
    queryKey: ["fills"],
    queryFn: getFills,
    enabled: status === "authenticated",
  });
}
