import { create } from 'zustand';
import { TipoCartaOperativo } from '../types/carta';
import { salaService } from '../services/salaService';

interface TipoCartaOperativoState {
  tiposCarta: TipoCartaOperativo[];
  isLoading: boolean;
  fetchTiposCartaOperativos: () => Promise<void>;
  updateTipoCartaFromSSE: (data: {
    tipoCartaId: string;
    nombre?: string;
    horaInicio?: string;
    horaFin?: string;
    activo?: boolean;
    tipo?: string;
    platoId?: string;
  }) => void;
  refreshTipoCarta: (tipoCartaId: string) => Promise<void>;
}

export const useTipoCartaOperativoStore = create<TipoCartaOperativoState>((set, get) => ({
  tiposCarta: [],
  isLoading: false,

  fetchTiposCartaOperativos: async () => {
    set({ isLoading: true });
    try {
      const data = await salaService.getTiposCartaOperativos();
      set({ tiposCarta: data, isLoading: false });
      console.log('[tipoCartaOperativoStore] Tipos de carta cargados:', data.length);
    } catch (error) {
      console.error('Error fetching tipos carta operativos:', error);
      set({ isLoading: false });
    }
  },

  updateTipoCartaFromSSE: (data) => {
    console.log('[tipoCartaOperativoStore] Actualizando tipo carta desde SSE:', data);
    
    // Si es un cambio específico de plato, recargamos todo el tipo para mantener consistencia
    if (data.tipo === 'PLATO_ADDED_TO_CARTA' || data.tipo === 'PLATO_REMOVED_FROM_CARTA') {
      console.log('[tipoCartaOperativoStore] Cambio detectado en platos, recargando tipo:', data.tipoCartaId);
      get().refreshTipoCarta(data.tipoCartaId);
      return;
    }
    
    // Actualización general del tipo de carta
    set((state) => ({
      tiposCarta: state.tiposCarta.map((t) => {
        if (t.tipoCartaId === data.tipoCartaId) {
          const updatedTipo = {
            ...t,
            ...(data.nombre !== undefined && { nombre: data.nombre }),
            ...(data.horaInicio !== undefined && { horaInicio: data.horaInicio }),
            ...(data.horaFin !== undefined && { horaFin: data.horaFin }),
            ...(data.activo !== undefined && { activo: data.activo }),
          };
          console.log('[tipoCartaOperativoStore] Tipo de carta actualizado:', updatedTipo.nombre);
          return updatedTipo;
        }
        return t;
      }),
    }));
  },

  refreshTipoCarta: async (tipoCartaId: string) => {
    try {
      // Recargar todos los tipos de carta para mantener consistencia
      const data = await salaService.getTiposCartaOperativos();
      set({ tiposCarta: data });
      console.log('[tipoCartaOperativoStore] Tipo de carta refrescado:', tipoCartaId);
    } catch (error) {
      console.error('Error refreshing tipo carta:', error);
    }
  },
}));
