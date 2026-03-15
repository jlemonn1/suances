import { create } from 'zustand';
import { salaService } from '../services/salaService';
import type {
  Comanda,
  ComandaDetalle,
  ComandaDetalleRondas,
  MesaOperativa,
  MesasResponse,
  CuentaResponse,
  CobroResponse,
  CrearComandaRequest,
  AgregarPedidoRequest,
  CobrarRequest,
  Pedido,
  TipoRonda,
  TicketResponse,
  ComandaHoyResponse,
} from '../types/sala';

interface SalaState {
  mesas: MesaOperativa[];
  mesasResumen: { totalMesas: number; libres: number; ocupadas: number; reservadas: number } | null;
  mesaSeleccionada: MesaOperativa | null;
  loadingMesas: boolean;
  errorMesas: string | null;

  // Estado de conexión SSE (canal en vivo)
  sseConnected: boolean;
  setSseConnected: (connected: boolean) => void;

  comandas: Comanda[];
  comandaActiva: ComandaDetalle | null;
  comandaConRondas: ComandaDetalleRondas | null;
  loadingComandas: boolean;
  errorComandas: string | null;

  // Comandas del día (para OWNER/MANAGER)
  comandasHoy: ComandaHoyResponse[];
  loadingComandasHoy: boolean;
  errorComandasHoy: string | null;

  // Selección de items para enviar a cocina
  itemsSeleccionados: string[];
  modoSeleccion: boolean;

  // Selección de items para eliminar (modo edición OWNER/MANAGER)
  itemsSeleccionadosEliminar: string[];
  modoEdicionEliminar: boolean;

  cuenta: CuentaResponse | null;
  loadingCuenta: boolean;

  loadingAccion: boolean;
  errorAccion: string | null;

  fetchMesas: (params?: { salaId?: string; estado?: string }) => Promise<void>;
  fetchComandas: (params?: { estado?: string }) => Promise<void>;
  fetchComanda: (id: string) => Promise<void>;
  fetchComandaConRondas: (id: string) => Promise<void>;
  fetchCuenta: (comandaId: string) => Promise<void>;

  crearComanda: (data: CrearComandaRequest) => Promise<Comanda>;
  agregarPedido: (comandaId: string, data: AgregarPedidoRequest) => Promise<Pedido[]>;
  cambiarEstadoPedido: (pedidoId: string, estado: string) => Promise<void>;
  cerrarComanda: (comandaId: string, impresora?: string) => Promise<TicketResponse>;
  cobrarComanda: (comandaId: string, data: CobrarRequest) => Promise<CobroResponse>;
  cancelarComanda: (comandaId: string, motivo: string) => Promise<void>;

  // Nuevos métodos para gestión de cuenta cerrada
  reenviarTicket: (comandaId: string, impresora: string) => Promise<void>;
  modificarLineasCuenta: (comandaId: string, itemIds: string[], motivo: string) => Promise<TicketResponse>;
  cancelarCuentaCerrada: (comandaId: string, motivo: string, usuarioNombre: string) => Promise<TicketResponse>;
  fetchComandasHoy: () => Promise<void>;

  // Nuevos métodos para rondas y envío a cocina
  enviarACocina: (comandaId: string, ronda: TipoRonda, itemIds: string[]) => Promise<void>;
  crearYEnviarACocina: (comandaId: string, items: AgregarPedidoRequest[]) => Promise<Pedido[]>;
  crearNuevaRonda: (comandaId: string) => Promise<number>;
  toggleSeleccionItem: (itemId: string) => void;
  seleccionarTodosItems: (itemIds: string[]) => void;
  limpiarSeleccion: () => void;
  setModoSeleccion: (activo: boolean) => void;

  // Métodos para eliminar items (modo edición OWNER/MANAGER)
  toggleSeleccionItemEliminar: (itemId: string) => void;
  limpiarSeleccionEliminar: () => void;
  setModoEdicionEliminar: (activo: boolean) => void;
  eliminarItems: (comandaId: string, motivo: string) => Promise<void>;

  seleccionarMesa: (mesa: MesaOperativa | null) => void;
  setComandaActiva: (comanda: ComandaDetalle | null) => void;
  setComandaConRondas: (comanda: ComandaDetalleRondas | null) => void;
  limpiarEstado: () => void;
  limpiarError: () => void;
  updateMesaFromSSE: (data: { mesaId: string; estado: string; comandaId?: string; codigo?: string; camareroId?: string; reservaId?: string; nombreCliente?: string; franjaId?: string }) => void;
}

export const useSalaStore = create<SalaState>((set, get) => ({
  mesas: [],
  mesasResumen: null,
  mesaSeleccionada: null,
  loadingMesas: false,
  errorMesas: null,

  // Estado de conexión SSE (canal en vivo)
  sseConnected: true, // Por defecto asumimos conectado
  setSseConnected: (connected) => set({ sseConnected: connected }),

  comandas: [],
  comandaActiva: null,
  comandaConRondas: null,
  loadingComandas: false,
  errorComandas: null,

  // Comandas del día (para OWNER/MANAGER)
  comandasHoy: [],
  loadingComandasHoy: false,
  errorComandasHoy: null,

  // Selección de items para enviar a cocina
  itemsSeleccionados: [],
  modoSeleccion: false,

  // Selección de items para eliminar (modo edición OWNER/MANAGER)
  itemsSeleccionadosEliminar: [],
  modoEdicionEliminar: false,

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
            nuevaMesa.comandaActivaId = undefined;
            nuevaMesa.codigoComanda = undefined;
            nuevaMesa.reservaActualId = undefined;
            nuevaMesa.nombreClienteReserva = undefined;
          } else if (data.estado === 'CUENTA') {
            // Estado CUENTA: cuenta cerrada pendiente de cobro
            nuevaMesa.estadoOperativo = 'CUENTA';
            nuevaMesa.comandaActivaId = data.comandaId;
            nuevaMesa.codigoComanda = data.codigo;
          } else if (data.estado === 'OCUPADA') {
            // Estado OCUPADA: comanda abierta
            nuevaMesa.estadoOperativo = 'OCUPADA';
            nuevaMesa.comandaActivaId = data.comandaId;
            nuevaMesa.codigoComanda = data.codigo;
            nuevaMesa.camareroAsignadoId = data.camareroId;
          }
          return nuevaMesa;
        }
        return mesa;
      });

      // Recalcular resumen incluyendo CUENTA
      const libres = mesasActualizadas.filter(m => m.estadoOperativo === 'LIBRE' || m.estadoOperativo === 'COBRADA').length;
      const ocupadas = mesasActualizadas.filter(m => m.estadoOperativo === 'OCUPADA').length;
      const cuentas = mesasActualizadas.filter(m => m.estadoOperativo === 'CUENTA').length;
      const reservadas = mesasActualizadas.filter(m => m.estadoOperativo === 'RESERVADA').length;

      console.log('[salaStore] Mesa actualizada. Total:', mesasActualizadas.length, 'Libres:', libres, 'Ocupadas:', ocupadas, 'Cuentas:', cuentas, 'Reservadas:', reservadas);

      return {
        mesas: mesasActualizadas,
        mesasResumen: {
          totalMesas: mesasActualizadas.length,
          libres,
          ocupadas: ocupadas + cuentas, // CUENTA se considera ocupada para el resumen
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

  fetchComandaConRondas: async (id) => {
    console.log('[salaStore] fetchComandaConRondas iniciado:', id);
    set({ loadingComandas: true, errorComandas: null });
    try {
      const comanda = await salaService.obtenerComandaConRondas(id);
      
      // Validar que la respuesta tenga la estructura correcta
      if (!comanda) {
        throw new Error('La comanda no existe');
      }
      
      // Asegurar que rondas sea siempre un array
      const comandaValidada = {
        ...comanda,
        rondas: (comanda.rondas || []).map((ronda: any) => ({
          ...ronda,
          pedidos: ronda.pedidos || [],
          numeroRonda: ronda.numeroRonda || 0,
        })),
      };
      
      console.log('[salaStore] Comanda validada. Rondas:', comandaValidada.rondas?.length);
      set({
        comandaConRondas: comandaValidada,
        loadingComandas: false,
      });
    } catch (error: any) {
      console.error('[salaStore] Error en fetchComandaConRondas:', error);
      set({
        errorComandas: error.response?.data?.message || error.message || 'Error al cargar comanda',
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
    console.log('[salaStore] agregarPedido iniciado:', { comandaId, data });
    set({ loadingAccion: true, errorAccion: null });
    try {
      console.log('[salaStore] Llamando salaService.agregarPedido...');
      const pedidosCreados = await salaService.agregarPedido(comandaId, data);
      console.log('[salaStore] Pedidos creados:', pedidosCreados);
      
      // Actualizar la comanda activa para reflejar el nuevo pedido
      console.log('[salaStore] Recargando comanda...');
      await get().fetchComandaConRondas(comandaId);
      await get().fetchMesas();
      
      set({ loadingAccion: false });
      
      console.log('[salaStore] agregarPedido completado exitosamente');
      return pedidosCreados;
    } catch (error: any) {
      console.error('[salaStore] Error en agregarPedido:', error);
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

  cerrarComanda: async (comandaId, impresora) => {
    set({ loadingAccion: true, errorAccion: null });
    try {
      const ticket = await salaService.cerrarComanda(comandaId, impresora);
      await get().fetchComanda(comandaId);
      await get().fetchComandaConRondas(comandaId);
      set({ loadingAccion: false });
      return ticket;
    } catch (error: any) {
      set({
        errorAccion: error.response?.data?.message || 'Error al cerrar comanda',
        loadingAccion: false,
      });
      throw error;
    }
  },

  reenviarTicket: async (comandaId, impresora) => {
    set({ loadingAccion: true, errorAccion: null });
    try {
      await salaService.reenviarTicket(comandaId, impresora);
      set({ loadingAccion: false });
    } catch (error: any) {
      set({
        errorAccion: error.response?.data?.message || 'Error al reenviar ticket',
        loadingAccion: false,
      });
      throw error;
    }
  },

  modificarLineasCuenta: async (comandaId, itemIds, motivo) => {
    set({ loadingAccion: true, errorAccion: null });
    try {
      const ticket = await salaService.modificarLineasCuenta(comandaId, itemIds, motivo);
      await get().fetchComandaConRondas(comandaId);
      await get().fetchCuenta(comandaId);
      set({ loadingAccion: false });
      return ticket;
    } catch (error: any) {
      set({
        errorAccion: error.response?.data?.message || 'Error al modificar líneas',
        loadingAccion: false,
      });
      throw error;
    }
  },

  cancelarCuentaCerrada: async (comandaId, motivo, usuarioNombre) => {
    set({ loadingAccion: true, errorAccion: null });
    try {
      const ticket = await salaService.cancelarCuentaCerrada(comandaId, motivo, usuarioNombre);
      set({ loadingAccion: false });
      return ticket;
    } catch (error: any) {
      set({
        errorAccion: error.response?.data?.message || 'Error al cancelar cuenta',
        loadingAccion: false,
      });
      throw error;
    }
  },

  fetchComandasHoy: async () => {
    set({ loadingComandasHoy: true, errorComandasHoy: null });
    try {
      const comandas = await salaService.listarComandasHoy();
      set({ comandasHoy: comandas, loadingComandasHoy: false });
    } catch (error: any) {
      set({
        errorComandasHoy: error.response?.data?.message || 'Error al cargar comandas del día',
        loadingComandasHoy: false,
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

  // Nuevos métodos para rondas y envío a cocina
  enviarACocina: async (comandaId, ronda, itemIds) => {
    set({ loadingAccion: true, errorAccion: null });
    try {
      await salaService.enviarACocina(comandaId, { ronda, itemIds });
      await get().fetchComandaConRondas(comandaId);
      set({
        itemsSeleccionados: [],
        modoSeleccion: false,
        loadingAccion: false,
      });
    } catch (error: any) {
      set({
        errorAccion: error.response?.data?.message || 'Error al enviar a cocina',
        loadingAccion: false,
      });
      throw error;
    }
  },

  crearYEnviarACocina: async (comandaId, items) => {
    console.log('[salaStore] crearYEnviarACocina iniciado:', { comandaId, itemsCount: items.length });
    set({ loadingAccion: true, errorAccion: null });
    try {
      const pedidosCreados = await salaService.crearYEnviarACocina(comandaId, items);
      console.log('[salaStore] Pedidos creados y enviados:', pedidosCreados);
      
      // Solo actualizar mesas, la comanda se actualizará desde el callback
      await get().fetchMesas();
      
      set({ loadingAccion: false });
      return pedidosCreados;
    } catch (error: any) {
      console.error('[salaStore] Error en crearYEnviarACocina:', error);
      set({
        errorAccion: error.response?.data?.message || 'Error al crear y enviar pedidos',
        loadingAccion: false,
      });
      throw error;
    }
  },

  crearNuevaRonda: async (comandaId) => {
    console.log('[salaStore] === INICIO crearNuevaRonda ===');
    console.log('[salaStore] comandaId recibido:', comandaId);
    console.log('[salaStore] typeof comandaId:', typeof comandaId);
    
    if (!comandaId) {
      console.error('[salaStore] ERROR: comandaId es undefined o null');
      throw new Error('ID de comanda no válido');
    }
    
    set({ loadingAccion: true, errorAccion: null });
    console.log('[salaStore] loadingAccion seteado a true');
    
    try {
      console.log('[salaStore] Llamando salaService.crearNuevaRonda...');
      const resultado = await salaService.crearNuevaRonda(comandaId);
      console.log('[salaStore] Resultado recibido:', resultado);
      console.log('[salaStore] resultado.numeroRonda:', resultado?.numeroRonda);
      set({ loadingAccion: false });
      console.log('[salaStore] === FIN crearNuevaRonda === retornando:', resultado?.numeroRonda);
      return resultado.numeroRonda;
    } catch (error: any) {
      console.error('[salaStore] === ERROR en crearNuevaRonda ===');
      console.error('[salaStore] Error completo:', error);
      console.error('[salaStore] Error message:', error?.message);
      console.error('[salaStore] Error response:', error?.response);
      console.error('[salaStore] Error response data:', error?.response?.data);
      set({
        errorAccion: error.response?.data?.message || 'Error al crear nueva ronda',
        loadingAccion: false,
      });
      throw error;
    }
  },

  toggleSeleccionItem: (itemId) => {
    set((state) => {
      const seleccionados = state.itemsSeleccionados;
      if (seleccionados.includes(itemId)) {
        return { itemsSeleccionados: seleccionados.filter(id => id !== itemId) };
      } else {
        return { itemsSeleccionados: [...seleccionados, itemId] };
      }
    });
  },

  seleccionarTodosItems: (itemIds) => {
    set({ itemsSeleccionados: itemIds });
  },

  limpiarSeleccion: () => {
    set({ itemsSeleccionados: [], modoSeleccion: false });
  },

  setModoSeleccion: (activo) => {
    set({ modoSeleccion: activo, itemsSeleccionados: [] });
  },

  // Métodos para modo edición eliminar
  toggleSeleccionItemEliminar: (itemId) => {
    set((state) => {
      const seleccionados = state.itemsSeleccionadosEliminar;
      if (seleccionados.includes(itemId)) {
        return { itemsSeleccionadosEliminar: seleccionados.filter(id => id !== itemId) };
      } else {
        return { itemsSeleccionadosEliminar: [...seleccionados, itemId] };
      }
    });
  },

  limpiarSeleccionEliminar: () => {
    set({ itemsSeleccionadosEliminar: [], modoEdicionEliminar: false });
  },

  setModoEdicionEliminar: (activo) => {
    set({ modoEdicionEliminar: activo, itemsSeleccionadosEliminar: [] });
  },

  eliminarItems: async (comandaId, motivo) => {
    const { itemsSeleccionadosEliminar } = get();
    if (itemsSeleccionadosEliminar.length === 0) return;

    set({ loadingAccion: true, errorAccion: null });
    try {
      // Eliminar items uno por uno
      for (const itemId of itemsSeleccionadosEliminar) {
        await salaService.eliminarItem(comandaId, itemId, motivo);
      }
      // Recargar la comanda para actualizar la vista
      await get().fetchComandaConRondas(comandaId);
      set({ 
        loadingAccion: false, 
        itemsSeleccionadosEliminar: [],
        modoEdicionEliminar: false 
      });
    } catch (error: any) {
      set({
        errorAccion: error.response?.data?.message || 'Error al eliminar items',
        loadingAccion: false,
      });
      throw error;
    }
  },

  seleccionarMesa: (mesa) => set({ mesaSeleccionada: mesa }),

  setComandaActiva: (comanda) => set({ comandaActiva: comanda }),

  setComandaConRondas: (comanda) => set({ comandaConRondas: comanda }),

  limpiarEstado: () =>
    set({
      comandaActiva: null,
      comandaConRondas: null,
      cuenta: null,
      mesaSeleccionada: null,
      itemsSeleccionados: [],
      modoSeleccion: false,
      itemsSeleccionadosEliminar: [],
      modoEdicionEliminar: false,
    }),

  limpiarError: () => set({ errorAccion: null }),
}));
