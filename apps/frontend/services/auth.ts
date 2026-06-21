import {
  signIn as nextAuthSignIn,
  signOut as nextAuthSignOut,
} from "next-auth/react";

import { publicApi } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import { useAccountStore } from "@/stores/account-store";
import { useTradeStore } from "@/stores/trade-store";
import { WebSocketManager } from "@/managers/WebSocketManager";

type AuthInput = {
  email: string;
  password: string;
};

export async function signIn(data: AuthInput) {
  const result = await nextAuthSignIn("credentials", {
    email: data.email,
    password: data.password,
    redirect: false,
  });

  if (result?.error) {
    throw new Error("Invalid credentials");
  }

  return result;
}

export async function signUp(data: AuthInput) {
  const response = await publicApi.post("/auth/signup", data);
  return response.data;
}

export async function signOut() {
  await publicApi.post("/auth/logout").catch(() => {});

  WebSocketManager.getInstance().disconnect();

  useAccountStore.setState({
    balance: null,
    positions: [],
    orders: [],
    fills: [],
    depositOpen: false,
  });

  useTradeStore.getState().resetDepth();
  useTradeStore.getState().resetTrades();
  useTradeStore.getState().resetPrices();

  queryClient.clear();

  await nextAuthSignOut({
    redirectTo: "/auth?mode=signin",
  });
}
