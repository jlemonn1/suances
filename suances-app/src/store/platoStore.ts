import { create } from 'zustand';
import { PlatoResponse, PlatoRequest } from '../types/plato';
import { cartaService } from '../services/cartaService';

interface PlatoState {
  platos: PlatoResponse[];
  isLoading: boolean;
  fetchPlatos: (activo?: boolean) => Promise<void>;
  addPlato: (plato: PlatoResponse) => void;
  updatePlato: (plato: PlatoResponse) => void;
  removePlato: (id: string) => void;
}

export const usePlatoStore = create<PlatoState>((set, get) => ({
  platos: [],
  isLoading: false,

  fetchPlatos: async (activo: boolean = true) => {
    set({ isLoading: true });
    try {
      const data = await cartaService.getPlatos(activo);
      set({ platos: data, isLoading: false });
    } catch (error) {
      console.error('Error fetching platos:', error);
      set({ isLoading: false });
    }
  },

  addPlato: (plato: PlatoResponse) => {
    set((state) => ({ platos: [...state.platos, plato] }));
  },

  updatePlato: (plato: PlatoResponse) => {
    set((state) => ({
      platos: state.platos.map((p) => (p.id === plato.id ? plato : p)),
    }));
  },

  removePlato: (id: string) => {
    set((state) => ({
      platos: state.platos.filter((p) => p.id !== id),
    }));
  },
}));
