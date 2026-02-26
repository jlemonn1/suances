import { create } from 'zustand';
import { TipoCartaResponse, TipoCartaRequest } from '../types/carta';
import { cartaService } from '../services/cartaService';

interface TipoCartaState {
  tiposCarta: TipoCartaResponse[];
  isLoading: boolean;
  fetchTiposCarta: () => Promise<void>;
  addTipoCarta: (tipo: TipoCartaResponse) => void;
  updateTipoCarta: (tipo: TipoCartaResponse) => void;
  removeTipoCarta: (id: string) => void;
}

export const useTipoCartaStore = create<TipoCartaState>((set) => ({
  tiposCarta: [],
  isLoading: false,

  fetchTiposCarta: async () => {
    set({ isLoading: true });
    try {
      const data = await cartaService.getTiposCarta();
      set({ tiposCarta: data, isLoading: false });
    } catch (error) {
      console.error('Error fetching tipos carta:', error);
      set({ isLoading: false });
    }
  },

  addTipoCarta: (tipo: TipoCartaResponse) => {
    set((state) => ({ tiposCarta: [...state.tiposCarta, tipo] }));
  },

  updateTipoCarta: (tipo: TipoCartaResponse) => {
    set((state) => ({
      tiposCarta: state.tiposCarta.map((t) => (t.id === tipo.id ? tipo : t)),
    }));
  },

  removeTipoCarta: (id: string) => {
    set((state) => ({
      tiposCarta: state.tiposCarta.filter((t) => t.id !== id),
    }));
  },
}));
