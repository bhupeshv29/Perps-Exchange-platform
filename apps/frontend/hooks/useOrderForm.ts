import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { orderFormSchema, type OrderFormInput } from "@/schema/order";

export function useOrderForm() {
  return useForm<OrderFormInput>({
    resolver: zodResolver(orderFormSchema),
    defaultValues: {
      side: "BID",
      orderType: "LIMIT",
      price: undefined,
      qty: 1,
      margin: 100,
      leverage: 1,
    },
  });
}
