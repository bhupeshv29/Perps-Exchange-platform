import { create } from "zustand";

export type BottomTab =
  | "balances"
  | "positions"
  | "open-orders"
  | "fill-history"
  | "order-history";

type UiStore = {
  bottomTab: BottomTab;
  setBottomTab: (tab: BottomTab) => void;
};

export const useUiStore = create<UiStore>((set) => ({
  bottomTab: "positions",
  setBottomTab: (bottomTab) => set({ bottomTab }),
}));
