import { create } from 'zustand';
import { IngredienteResponse, IngredienteRequest } from '../types/ingrediente';
import { cartaService } from '../services/cartaService';

interface IngredienteState {
  ingredientes: IngredienteResponse[];
  isLoading: boolean;
  fetchIngredientes: (activo?: boolean) => Promise<void>;
  addIngrediente: (ingrediente: IngredienteResponse) => void;
  updateIngrediente: (ingrediente: IngredienteResponse) => void;
  removeIngrediente: (id: string) => void;
}

export const useIngredienteStore = create<IngredienteState>((set) => ({
  ingredientes: [],
  isLoading: false,

  fetchIngredientes: async (activo: boolean = true) => {
    set({ isLoading: true });
    try {
      const data = await cartaService.getIngredientes(activo);
      set({ ingredientes: data, isLoading: false });
    } catch (error) {
      console.error('Error fetching ingredientes:', error);
      set({ isLoading: false });
    }
  },

  addIngrediente: (ingrediente: IngredienteResponse) => {
    set((state) => ({ ingredientes: [...state.ingredientes, ingrediente] }));
  },

  updateIngrediente: (ingrediente: IngredienteResponse) => {
    set((state) => ({
      ingredientes: state.ingredientes.map((i) =>
        i.id === ingrediente.id ? ingrediente : i
      ),
    }));
  },

  removeIngrediente: (id: string) => {
    set((state) => ({
      ingredientes: state.ingredientes.filter((i) => i.id !== id),
    }));
  },
}));
