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
  updateIngredienteFromSSE: (data: {
    ingredienteId: string;
    nombre?: string;
    stockActual?: number;
    umbralAlerta?: number;
    tipoAlerta?: 'STOCK_BAJO' | 'STOCK_CRITICO';
  }) => void;
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

  updateIngredienteFromSSE: (data) => {
    console.log('[ingredienteStore] Actualizando ingrediente desde SSE:', data);
    
    set((state) => {
      const ingrediente = state.ingredientes.find(i => i.id === data.ingredienteId);
      if (!ingrediente) {
        console.log('[ingredienteStore] Ingrediente no encontrado:', data.ingredienteId);
        return state;
      }

      const stockActual = data.stockActual ?? ingrediente.stockActual;
      const umbralAlerta = data.umbralAlerta ?? ingrediente.umbralAlerta;

      const updatedIngrediente = {
        ...ingrediente,
        ...(data.nombre !== undefined && { nombre: data.nombre }),
        ...(data.stockActual !== undefined && { stockActual: data.stockActual }),
        ...(data.umbralAlerta !== undefined && { umbralAlerta: data.umbralAlerta }),
      };

      console.log('[ingredienteStore] Ingrediente actualizado:', updatedIngrediente.nombre);

      // Actualizar ingredientes
      const updatedIngredientes = state.ingredientes.map((i) =>
        i.id === data.ingredienteId ? updatedIngrediente : i
      );

      // Manejar alertas basado en el stock
      let newStockBajoAlertas = [...state.stockBajoAlertas];
      let newStockCriticoAlertas = [...state.stockCriticoAlertas];

      // Quitar de todas las alertas primero
      newStockBajoAlertas = newStockBajoAlertas.filter(a => a.id !== data.ingredienteId);
      newStockCriticoAlertas = newStockCriticoAlertas.filter(a => a.id !== data.ingredienteId);

      // Agregar a la alerta apropiada
      if (stockActual <= 0 || data.tipoAlerta === 'STOCK_CRITICO') {
        console.log('[ingredienteStore] Agregando a alertas críticas:', updatedIngrediente.nombre);
        newStockCriticoAlertas.push(updatedIngrediente);
      } else if ((stockActual < umbralAlerta) || data.tipoAlerta === 'STOCK_BAJO') {
        console.log('[ingredienteStore] Agregando a alertas de stock bajo:', updatedIngrediente.nombre);
        newStockBajoAlertas.push(updatedIngrediente);
      }

      return {
        ingredientes: updatedIngredientes,
        stockBajoAlertas: newStockBajoAlertas,
        stockCriticoAlertas: newStockCriticoAlertas,
      };
    });
  },
}));
