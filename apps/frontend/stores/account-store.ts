import { create } from "zustand";

type AccountStore = {
  depositOpen: boolean;
  openDeposit: () => void;
  closeDeposit: () => void;
};

export const useAccountStore = create<AccountStore>((set) => ({
  depositOpen: false,
  openDeposit: () => set({ depositOpen: true }),
  closeDeposit: () => set({ depositOpen: false }),
}));
