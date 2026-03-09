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
  updatePlatoFromSSE: (data: {
    platoId: string;
    nombre?: string;
    descripcion?: string;
    precioVenta?: number;
    categoriaId?: string;
    categoriaNombre?: string;
    activo?: boolean;
    disponible?: boolean;
    stockDisponible?: number;
    stockBajo?: boolean;
  }) => void;
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

  updatePlatoFromSSE: (data) => {
    console.log('[platoStore] Actualizando plato desde SSE:', data);
    set((state) => ({
      platos: state.platos.map((p) => {
        if (p.id === data.platoId) {
          const updatedPlato = {
            ...p,
            ...(data.nombre !== undefined && { nombre: data.nombre }),
            ...(data.descripcion !== undefined && { descripcion: data.descripcion }),
            ...(data.precioVenta !== undefined && { precioVenta: data.precioVenta }),
            ...(data.categoriaId !== undefined && { 
              categoria: { 
                ...p.categoria, 
                id: data.categoriaId,
                ...(data.categoriaNombre !== undefined && { nombre: data.categoriaNombre })
              } 
            }),
            ...(data.activo !== undefined && { activo: data.activo }),
            ...(data.disponible !== undefined && { disponible: data.disponible }),
            ...(data.stockDisponible !== undefined && { stockDisponible: data.stockDisponible }),
            ...(data.stockBajo !== undefined && { stockBajo: data.stockBajo }),
          };
          console.log('[platoStore] Plato actualizado:', updatedPlato.nombre);
          return updatedPlato;
        }
        return p;
      }),
    }));
    
    // Si el plato se desactivó o tiene stock bajo, agregarlo a la lista de agotados
    if (data.disponible === false || data.activo === false || data.stockBajo === true) {
      set((state) => {
        const plato = state.platos.find(p => p.id === data.platoId);
        if (plato && !state.platosAgotados.find(pa => pa.id === data.platoId)) {
          console.log('[platoStore] Agregando plato a lista de agotados:', plato.nombre);
          return { platosAgotados: [...state.platosAgotados, plato] };
        }
        return state;
      });
    }
    
    // Si el plato se activó y no tiene stock bajo, quitarlo de la lista de agotados
    if ((data.disponible === true || data.activo === true) && data.stockBajo !== true) {
      set((state) => {
        const platoExistente = state.platosAgotados.find(pa => pa.id === data.platoId);
        if (platoExistente) {
          console.log('[platoStore] Quitando plato de lista de agotados:', data.nombre || platoExistente.nombre);
          return { 
            platosAgotados: state.platosAgotados.filter(pa => pa.id !== data.platoId) 
          };
        }
        return state;
      });
    }
  },
}));
