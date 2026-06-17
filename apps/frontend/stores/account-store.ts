import { create } from "zustand";

type AccountStore = {
  depositeOpen: boolean;
  profileOpen: boolean;

  openDesposit(): void;

  closeDeposit(): void;

  toggleProfile(): void;
};

export const useAccountStore = create<AccountStore>((set) => ({
  depositeOpen: false,
  profileOpen: false,
  openDesposit: () => set({ depositeOpen: true }),
  closeDeposit: () => set({ depositeOpen: false }),
  toggleProfile: () =>
    set((state) => ({
      profileOpen: !state.profileOpen,
    })),
}));
