import { create } from 'zustand';

export type AIScreen = 'reservas' | 'carta' | 'inventario' | 'personal' | 'dashboard';

interface AIStore {
  isModalOpen: boolean;
  currentScreen: AIScreen;
  openModal: (screen: AIScreen) => void;
  closeModal: () => void;
  setCurrentScreen: (screen: AIScreen) => void;
}

export const useAIStore = create<AIStore>((set) => ({
  isModalOpen: false,
  currentScreen: 'dashboard',
  openModal: (screen) => set({ isModalOpen: true, currentScreen: screen }),
  closeModal: () => set({ isModalOpen: false }),
  setCurrentScreen: (screen) => set({ currentScreen: screen }),
}));
