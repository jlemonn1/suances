import { create } from 'zustand';
import { DistribuidorResponse, DistribuidorRequest } from '../types/ingrediente';
import { cartaService } from '../services/cartaService';

interface DistribuidorState {
  distribuidores: DistribuidorResponse[];
  isLoading: boolean;
  fetchDistribuidores: (activo?: boolean) => Promise<void>;
  addDistribuidor: (distribuidor: DistribuidorResponse) => void;
  updateDistribuidor: (distribuidor: DistribuidorResponse) => void;
  removeDistribuidor: (id: string) => void;
}

export const useDistribuidorStore = create<DistribuidorState>((set) => ({
  distribuidores: [],
  isLoading: false,

  fetchDistribuidores: async (activo: boolean = true) => {
    set({ isLoading: true });
    try {
      const data = await cartaService.getDistribuidores(activo);
      set({ distribuidores: data, isLoading: false });
    } catch (error) {
      console.error('Error fetching distribuidores:', error);
      set({ isLoading: false });
    }
  },

  addDistribuidor: (distribuidor: DistribuidorResponse) => {
    set((state) => ({ distribuidores: [...state.distribuidores, distribuidor] }));
  },

  updateDistribuidor: (distribuidor: DistribuidorResponse) => {
    set((state) => ({
      distribuidores: state.distribuidores.map((d) =>
        d.id === distribuidor.id ? distribuidor : d
      ),
    }));
  },

  removeDistribuidor: (id: string) => {
    set((state) => ({
      distribuidores: state.distribuidores.filter((d) => d.id !== id),
    }));
  },
}));
