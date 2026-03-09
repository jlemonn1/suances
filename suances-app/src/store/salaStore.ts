import { create } from 'zustand';
import { salaService } from '../services/salaService';
import type {
  Comanda,
  ComandaDetalle,
  MesaOperativa,
  MesasResponse,
  CuentaResponse,
  CobroResponse,
  CrearComandaRequest,
  AgregarPedidoRequest,
  CobrarRequest,
} from '../types/sala';

interface SalaState {
  mesas: MesaOperativa[];
  mesasResumen: { totalMesas: number; libres: number; ocupadas: number; reservadas: number } | null;
  mesaSeleccionada: MesaOperativa | null;
  loadingMesas: boolean;
  errorMesas: string | null;

  comandas: Comanda[];
  comandaActiva: ComandaDetalle | null;
  loadingComandas: boolean;
  errorComandas: string | null;

  cuenta: CuentaResponse | null;
  loadingCuenta: boolean;

  loadingAccion: boolean;
  errorAccion: string | null;

  fetchMesas: (params?: { salaId?: string; estado?: string }) => Promise<void>;
  fetchComandas: (params?: { estado?: string }) => Promise<void>;
  fetchComanda: (id: string) => Promise<void>;
  fetchCuenta: (comandaId: string) => Promise<void>;

  crearComanda: (data: CrearComandaRequest) => Promise<Comanda>;
  agregarPedido: (comandaId: string, data: AgregarPedidoRequest) => Promise<void>;
  cambiarEstadoPedido: (pedidoId: string, estado: string) => Promise<void>;
  cerrarComanda: (comandaId: string, tipoPago: string) => Promise<void>;
  cobrarComanda: (comandaId: string, data: CobrarRequest) => Promise<CobroResponse>;
  cancelarComanda: (comandaId: string, motivo: string) => Promise<void>;

  seleccionarMesa: (mesa: MesaOperativa | null) => void;
  setComandaActiva: (comanda: ComandaDetalle | null) => void;
  limpiarEstado: () => void;
  limpiarError: () => void;
  updateMesaFromSSE: (data: { mesaId: string; estado: string; reservaId?: string; nombreCliente?: string; franjaId?: string }) => void;
}

export const useSalaStore = create<SalaState>((set, get) => ({
  mesas: [],
  mesasResumen: null,
  mesaSeleccionada: null,
  loadingMesas: false,
  errorMesas: null,

  comandas: [],
  comandaActiva: null,
  loadingComandas: false,
  errorComandas: null,

  cuenta: null,
  loadingCuenta: false,

  loadingAccion: false,
  errorAccion: null,

  fetchMesas: async (params) => {
    console.log('[salaStore] fetchMesas iniciado. params:', params);
    set({ loadingMesas: true, errorMesas: null });
    try {
      console.log('[salaStore] Llamando salaService.listarMesas...');
      const response: MesasResponse = await salaService.listarMesas(params);
      console.log('[salaStore] Respuesta recibida. Mesas:', response.mesas?.length, 'Resumen:', response.resumen);
      set({
        mesas: response.mesas || [],
        mesasResumen: response.resumen,
        loadingMesas: false,
      });
      console.log('[salaStore] Estado actualizado. Mesas en store:', response.mesas?.length);
    } catch (error: any) {
      console.error('[salaStore] Error en fetchMesas:', error);
      set({
        errorMesas: error.response?.data?.message || 'Error al cargar mesas',
        loadingMesas: false,
      });
    }
  },

  updateMesaFromSSE: (data) => {
    console.log('[salaStore] Actualizando mesa desde SSE:', data);
    set((state) => {
      const mesasActualizadas = state.mesas.map((mesa) => {
        if (mesa.id === data.mesaId) {
          const nuevaMesa = { ...mesa };
          if (data.estado === 'RESERVADA') {
            nuevaMesa.estadoOperativo = 'RESERVADA';
            nuevaMesa.reservaActualId = data.reservaId;
            nuevaMesa.nombreClienteReserva = data.nombreCliente;
          } else if (data.estado === 'LIBRE') {
            nuevaMesa.estadoOperativo = 'LIBRE';
            nuevaMesa.reservaActualId = undefined;
            nuevaMesa.nombreClienteReserva = undefined;
          }
          return nuevaMesa;
        }
        return mesa;
      });

      // Recalcular resumen
      const libres = mesasActualizadas.filter(m => m.estadoOperativo === 'LIBRE').length;
      const ocupadas = mesasActualizadas.filter(m => m.estadoOperativo === 'OCUPADA').length;
      const reservadas = mesasActualizadas.filter(m => m.estadoOperativo === 'RESERVADA').length;

      console.log('[salaStore] Mesa actualizada. Total:', mesasActualizadas.length, 'Libres:', libres, 'Ocupadas:', ocupadas, 'Reservadas:', reservadas);

      return {
        mesas: mesasActualizadas,
        mesasResumen: {
          totalMesas: mesasActualizadas.length,
          libres,
          ocupadas,
          reservadas,
        },
      };
    });
  },

  fetchComandas: async (params) => {
    set({ loadingComandas: true, errorComandas: null });
    try {
      const response = await salaService.listarComandas(params);
      set({
        comandas: response.content || [],
        loadingComandas: false,
      });
    } catch (error: any) {
      set({
        errorComandas: error.response?.data?.message || 'Error al cargar comandas',
        loadingComandas: false,
      });
    }
  },

  fetchComanda: async (id) => {
    set({ loadingComandas: true, errorComandas: null });
    try {
      const comanda = await salaService.obtenerComanda(id);
      set({
        comandaActiva: comanda,
        loadingComandas: false,
      });
    } catch (error: any) {
      set({
        errorComandas: error.response?.data?.message || 'Error al cargar comanda',
        loadingComandas: false,
      });
    }
  },

  fetchCuenta: async (comandaId) => {
    set({ loadingCuenta: true });
    try {
      const cuenta = await salaService.obtenerCuenta(comandaId);
      set({ cuenta, loadingCuenta: false });
    } catch (error: any) {
      set({
        errorAccion: error.response?.data?.message || 'Error al cargar cuenta',
        loadingCuenta: false,
      });
    }
  },

  crearComanda: async (data) => {
    set({ loadingAccion: true, errorAccion: null });
    try {
      const comanda = await salaService.crearComanda(data);
      await get().fetchMesas();
      set({ loadingAccion: false });
      return comanda;
    } catch (error: any) {
      set({
        errorAccion: error.response?.data?.message || 'Error al crear comanda',
        loadingAccion: false,
      });
      throw error;
    }
  },

  agregarPedido: async (comandaId, data) => {
    set({ loadingAccion: true, errorAccion: null });
    try {
      await salaService.agregarPedido(comandaId, data);
      await get().fetchComanda(comandaId);
      await get().fetchMesas();
      set({ loadingAccion: false });
    } catch (error: any) {
      set({
        errorAccion: error.response?.data?.message || 'Error al agregar pedido',
        loadingAccion: false,
      });
      throw error;
    }
  },

  cambiarEstadoPedido: async (pedidoId, estado) => {
    set({ loadingAccion: true, errorAccion: null });
    try {
      await salaService.cambiarEstadoPedido(pedidoId, { estado });
      const { comandaActiva } = get();
      if (comandaActiva) {
        await get().fetchComanda(comandaActiva.id);
      }
      await get().fetchMesas();
      set({ loadingAccion: false });
    } catch (error: any) {
      set({
        errorAccion: error.response?.data?.message || 'Error al cambiar estado',
        loadingAccion: false,
      });
      throw error;
    }
  },

  cerrarComanda: async (comandaId, tipoPago) => {
    set({ loadingAccion: true, errorAccion: null });
    try {
      await salaService.cerrarComanda(comandaId, { tipoPago });
      await get().fetchComanda(comandaId);
      set({ loadingAccion: false });
    } catch (error: any) {
      set({
        errorAccion: error.response?.data?.message || 'Error al cerrar comanda',
        loadingAccion: false,
      });
      throw error;
    }
  },

  cobrarComanda: async (comandaId, data) => {
    set({ loadingAccion: true, errorAccion: null });
    try {
      const resultado = await salaService.cobrarComanda(comandaId, data);
      set({
        comandaActiva: null,
        cuenta: null,
        loadingAccion: false,
      });
      await get().fetchMesas();
      return resultado;
    } catch (error: any) {
      set({
        errorAccion: error.response?.data?.message || 'Error al cobrar',
        loadingAccion: false,
      });
      throw error;
    }
  },

  cancelarComanda: async (comandaId, motivo) => {
    set({ loadingAccion: true, errorAccion: null });
    try {
      await salaService.cancelarComanda(comandaId, motivo);
      set({ comandaActiva: null });
      await get().fetchMesas();
      set({ loadingAccion: false });
    } catch (error: any) {
      set({
        errorAccion: error.response?.data?.message || 'Error al cancelar',
        loadingAccion: false,
      });
      throw error;
    }
  },

  seleccionarMesa: (mesa) => set({ mesaSeleccionada: mesa }),

  setComandaActiva: (comanda) => set({ comandaActiva: comanda }),

  limpiarEstado: () =>
    set({
      comandaActiva: null,
      cuenta: null,
      mesaSeleccionada: null,
    }),

  limpiarError: () => set({ errorAccion: null }),
}));
