import { create } from "zustand";

import type { UserBalance, Position, Order, Fill } from "@repo/common";

type AccountStore = {
  depositOpen: boolean;

  balance: UserBalance | null;

  positions: Position[];

  orders: Order[];

  fills: Fill[];

  openDeposit(): void;

  closeDeposit(): void;

  setBalance(balance: UserBalance): void;

  setPositions(positions: Position[]): void;

  setOrders(orders: Order[]): void;

  setFills(fills: Fill[]): void;

  updatePosition(position: Position): void;

  updateOrder(order: Order): void;

  addFill(fill: Fill): void;

  removePosition: (marketId: string, side: "LONG" | "SHORT") => void;
};

export const useAccountStore = create<AccountStore>((set) => ({
  depositOpen: false,

  balance: null,

  positions: [],

  orders: [],

  fills: [],

  openDeposit: () =>
    set({
      depositOpen: true,
    }),

  closeDeposit: () =>
    set({
      depositOpen: false,
    }),

  setBalance: (balance) =>
    set({
      balance,
    }),

  setPositions: (positions) =>
    set({
      positions,
    }),

  setOrders: (orders) =>
    set({
      orders,
    }),

  setFills: (fills) =>
    set({
      fills,
    }),

  updatePosition: (position) =>
    set((state) => ({
      positions: state.positions.some(
        (p) =>
          p.userId === position.userId &&
          p.marketId === position.marketId &&
          p.side === position.side,
      )
        ? state.positions.map((p) =>
            p.userId === position.userId &&
            p.marketId === position.marketId &&
            p.side === position.side
              ? position
              : p,
          )
        : [...state.positions, position],
    })),

  updateOrder: (order) =>
    set((state) => ({
      orders: state.orders.some((o) => o.id === order.id)
        ? state.orders.map((o) => (o.id === order.id ? order : o))
        : [order, ...state.orders],
    })),

  addFill: (fill) =>
    set((state) => ({
      fills: [fill, ...state.fills].slice(0, 200),
    })),

  removePosition: (marketId, side) =>
    set((state) => ({
      positions: state.positions.filter(
        (position) =>
          !(position.marketId === marketId && position.side === side),
      ),
    })),
}));
