"use client";

import { useEffect } from "react";

import { useBalance } from "@/hooks/useBalance";
import { usePositions } from "@/hooks/usePosition";
import { useOrders } from "@/hooks/useOrders";
import { useFills } from "@/hooks/useFills";

import { useAccountStore } from "@/stores/account-store";

export function AccountDataProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const balanceQuery = useBalance();
  const positionsQuery = usePositions();
  const ordersQuery = useOrders();
  const fillsQuery = useFills();

  const setBalance = useAccountStore((state) => state.setBalance);
  const setPositions = useAccountStore((state) => state.setPositions);
  const setOrders = useAccountStore((state) => state.setOrders);
  const setFills = useAccountStore((state) => state.setFills);

  useEffect(() => {
    if (balanceQuery.data?.payload) {
      setBalance(balanceQuery.data.payload);
    }
  }, [balanceQuery.data, setBalance]);

  useEffect(() => {
    if (positionsQuery.data?.payload) {
      setPositions(positionsQuery.data.payload);
    }
  }, [positionsQuery.data, setPositions]);

  useEffect(() => {
    if (ordersQuery.data?.orders) {
      setOrders(ordersQuery.data.orders);
    }
  }, [ordersQuery.data, setOrders]);

  useEffect(() => {
    if (fillsQuery.data?.fills) {
      setFills(fillsQuery.data.fills);
    }
  }, [fillsQuery.data, setFills]);

  return children;
}
