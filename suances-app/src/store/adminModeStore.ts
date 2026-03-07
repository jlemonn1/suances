import { create } from 'zustand';

interface AdminModeState {
  isAdminModeOpen: boolean;
  openAdminMode: () => void;
  closeAdminMode: () => void;
  toggleAdminMode: () => void;
}

export const useAdminModeStore = create<AdminModeState>((set) => ({
  isAdminModeOpen: false,
  openAdminMode: () => set({ isAdminModeOpen: true }),
  closeAdminMode: () => set({ isAdminModeOpen: false }),
  toggleAdminMode: () => set((state) => ({ isAdminModeOpen: !state.isAdminModeOpen })),
}));
