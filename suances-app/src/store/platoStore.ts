import { create } from 'zustand';
import { PlatoResponse, PlatoRequest } from '../types/plato';
import { IngredienteResponse } from '../types/ingrediente';
import { cartaService } from '../services/cartaService';
import { useIngredienteStore } from './ingredienteStore';

interface PlatoState {
  platos: PlatoResponse[];
  isLoading: boolean;
  platosAgotados: PlatoResponse[];
  fetchPlatos: (activo?: boolean) => Promise<void>;
  addPlato: (plato: PlatoResponse) => void;
  updatePlato: (plato: PlatoResponse) => void;
  removePlato: (id: string) => void;
  checkDisponibilidad: () => PlatoResponse[];
  setPlatosAgotadosFromPoll: (platosAgotados: PlatoResponse[]) => void;
  getAgotadosCount: () => number;
}

export const usePlatoStore = create<PlatoState>((set, get) => ({
  platos: [],
  isLoading: false,
  platosAgotados: [],

  fetchPlatos: async (activo: boolean = true) => {
    set({ isLoading: true });
    try {
      const data = await cartaService.getPlatos(activo);
      
      // Verificar disponibilidad de platos
      const disponibles = get().checkDisponibilidad();
      
      set({ 
        platos: data, 
        isLoading: false,
        platosAgotados: data.filter(p => !disponibles.find(d => d.id === p.id))
      });
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

  checkDisponibilidad: () => {
    const { platos } = get();
    const ingredienteStore = useIngredienteStore.getState();
    const { ingredientes } = ingredienteStore;
    
    // Por ahora, asumimos que un plato está disponible si tiene ingredientes
    // La lógica real vendría del backend (escandallo)
    // Aquí simplificado: disponible si no hay alerta crítica de ingredientes
    const stockCriticoIds = new Set(
      ingredientes.filter(i => i.stockActual <= 0).map(i => i.id)
    );
    
    // Por ahora, devolvemos todos los platos como disponibles
    // En una implementación real, verificaríamos el escandallo de cada plato
    return platos.filter(p => p.activo);
  },

  setPlatosAgotadosFromPoll: (platosAgotados) => {
    set({ platosAgotados });
  },

  getAgotadosCount: () => {
    return get().platosAgotados.length;
  },
}));
