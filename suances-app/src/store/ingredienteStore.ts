import { create } from 'zustand';
import { IngredienteResponse, IngredienteRequest } from '../types/ingrediente';
import { cartaService } from '../services/cartaService';

interface IngredienteState {
  ingredientes: IngredienteResponse[];
  isLoading: boolean;
  stockBajoAlertas: IngredienteResponse[];
  stockCriticoAlertas: IngredienteResponse[];
  fetchIngredientes: (activo?: boolean) => Promise<void>;
  addIngrediente: (ingrediente: IngredienteResponse) => void;
  updateIngrediente: (ingrediente: IngredienteResponse) => void;
  removeIngrediente: (id: string) => void;
  setAlertasFromPoll: (stockBajo: IngredienteResponse[], stockCritico: IngredienteResponse[]) => void;
  clearAlertas: () => void;
  getAlertasCount: () => number;
}

export const useIngredienteStore = create<IngredienteState>((set, get) => ({
  ingredientes: [],
  isLoading: false,
  stockBajoAlertas: [],
  stockCriticoAlertas: [],

  fetchIngredientes: async (activo: boolean = true) => {
    set({ isLoading: true });
    try {
      const data = await cartaService.getIngredientes(activo);
      
      // Calcular alertas automáticamente
      const stockBajo = data.filter(i => 
        i.stockActual < (i.umbralAlerta || 0) && i.stockActual > 0
      );
      const stockCritico = data.filter(i => 
        i.stockActual <= 0
      );
      
      set({ 
        ingredientes: data, 
        isLoading: false,
        stockBajoAlertas: stockBajo,
        stockCriticoAlertas: stockCritico
      });
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

  setAlertasFromPoll: (stockBajo, stockCritico) => {
    set({
      stockBajoAlertas: stockBajo,
      stockCriticoAlertas: stockCritico
    });
  },

  clearAlertas: () => {
    set({
      stockBajoAlertas: [],
      stockCriticoAlertas: []
    });
  },

  getAlertasCount: () => {
    const state = get();
    return state.stockBajoAlertas.length + state.stockCriticoAlertas.length;
  },
}));
