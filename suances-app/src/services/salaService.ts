import { salaApi } from './api';
import type {
  Comanda,
  ComandaDetalle,
  ComandaDetalleRondas,
  Pedido,
  MesaOperativa,
  MesasResponse,
  CuentaResponse,
  CobroResponse,
  CrearComandaRequest,
  AgregarPedidoRequest,
  CobrarRequest,
  FranjaHoraria,
  Sala,
  EnviarCocinaRequest,
  TipoRonda,
  TicketResponse,
  ComandaHoyResponse,
} from '../types/sala';
import type { PlatoOperativo, TipoCartaOperativo } from '../types/carta';

export const salaService = {
  // Mesas
  listarMesas: async (params?: {
    salaId?: string;
    estado?: string;
    camareroId?: string;
    franjaId?: string;
  }): Promise<MesasResponse> => {
    console.log('[salaService] listarMesas iniciado. params:', params);
    const response = await salaApi.get<MesasResponse>('/mesas', { params });
    console.log('[salaService] listarMesas respuesta:', response.status, 'mesas:', response.data?.mesas?.length);
    return response.data;
  },

  obtenerMesa: async (id: string): Promise<MesaOperativa> => {
    const response = await salaApi.get<MesaOperativa>(`/mesas/${id}`);
    return response.data;
  },

  cambiarEstadoMesa: async (
    id: string,
    data: { estadoOperativo: string; motivo?: string; forzar?: boolean }
  ): Promise<MesaOperativa> => {
    const response = await salaApi.patch(`/mesas/${id}/estado`, data);
    return response.data;
  },

  // Comandas
  crearComanda: async (data: CrearComandaRequest): Promise<Comanda> => {
    const response = await salaApi.post<Comanda>('/comandas', data);
    return response.data;
  },

  listarComandas: async (params?: {
    estado?: string;
    mesaId?: string;
    page?: number;
    size?: number;
  }): Promise<{ content: Comanda[]; totalElements: number }> => {
    const response = await salaApi.get('/comandas', { params });
    return response.data;
  },

  obtenerComanda: async (id: string): Promise<ComandaDetalle> => {
    const response = await salaApi.get<ComandaDetalle>(`/comandas/${id}`);
    return response.data;
  },

  cambiarEstadoComanda: async (
    id: string,
    data: { estado: string; motivo?: string }
  ): Promise<{ id: string; estado: string; estadoAnterior: string }> => {
    const response = await salaApi.patch(`/comandas/${id}/estado`, data);
    return response.data;
  },

  cerrarComanda: async (id: string, impresora?: string): Promise<TicketResponse> => {
    console.log('[salaService] cerrarComanda iniciado:', { id, impresora });
    try {
      const response = await salaApi.post<TicketResponse>(`/comandas/${id}/cuenta/cerrar`, {
        impresora: impresora || 'Isabella'
      });
      console.log('[salaService] cerrarComanda respuesta:', response.status, response.data);
      return response.data;
    } catch (error: any) {
      console.error('[salaService] cerrarComanda error:', error.message, error.response?.data);
      throw error;
    }
  },

  cobrarComanda: async (id: string, data: CobrarRequest): Promise<CobroResponse> => {
    const response = await salaApi.post<CobroResponse>(`/comandas/${id}/cuenta/cobrar`, data);
    return response.data;
  },

  cancelarComanda: async (id: string, motivo: string): Promise<void> => {
    await salaApi.delete(`/comandas/${id}`, { params: { motivo } });
  },

  // Pedidos (items)
  agregarPedido: async (
    comandaId: string,
    data: AgregarPedidoRequest
  ): Promise<Pedido[]> => {
    console.log('[salaService] agregarPedido iniciado:', { comandaId, data });
    try {
      const response = await salaApi.post<Pedido[]>(
        `/comandas/${comandaId}/items`,
        [data]
      );
      console.log('[salaService] agregarPedido respuesta:', response.status, response.data);
      return response.data;
    } catch (error: any) {
      console.error('[salaService] agregarPedido error:', error.message, error.response?.data);
      throw error;
    }
  },

  // Agregar múltiples pedidos (items)
  agregarPedidos: async (
    comandaId: string,
    data: AgregarPedidoRequest[]
  ): Promise<Pedido[]> => {
    const response = await salaApi.post<Pedido[]>(
      `/comandas/${comandaId}/items`,
      data
    );
    return response.data;
  },

  listarPedidos: async (
    comandaId: string,
    params?: { estado?: string; incluirCancelados?: boolean }
  ): Promise<{ pedidos: Pedido[] }> => {
    const response = await salaApi.get(`/comandas/${comandaId}/pedidos`, {
      params,
    });
    return response.data;
  },

  cambiarEstadoPedido: async (
    id: string,
    data: { estado: string; notasCambio?: string }
  ): Promise<{
    id: string;
    estado: string;
    estadoAnterior: string;
    horaListo?: string;
    comandaEstadoActualizado?: string;
  }> => {
    const response = await salaApi.patch(`/pedidos/${id}/estado`, data);
    return response.data;
  },

  cancelarPedido: async (id: string, motivo: string): Promise<void> => {
    await salaApi.delete(`/pedidos/${id}`, { params: { motivo } });
  },

  eliminarItem: async (comandaId: string, itemId: string, motivo: string): Promise<void> => {
    await salaApi.delete(`/comandas/${comandaId}/items/${itemId}`, { params: { motivo } });
  },

  // Cuenta
  obtenerCuenta: async (comandaId: string): Promise<CuentaResponse> => {
    const response = await salaApi.get<CuentaResponse>(
      `/comandas/${comandaId}/cuenta`
    );
    return response.data;
  },

  aplicarDescuento: async (
    comandaId: string,
    data: { porcentaje: number; motivo: string }
  ): Promise<{
    comandaId: string;
    descuentoPorcentaje: number;
    descuentoMonto: number;
    totalNuevo: number;
  }> => {
    const response = await salaApi.post(`/comandas/${comandaId}/descuento`, data);
    return response.data;
  },

  // Franjas horarias (proxy a reservas-service)
  getFranjas: async (): Promise<FranjaHoraria[]> => {
    const response = await salaApi.get<FranjaHoraria[]>('/mesas/franjas');
    return response.data;
  },

  // Salas (proxy a reservas-service)
  getSalas: async (): Promise<Sala[]> => {
    const response = await salaApi.get<Sala[]>('/mesas/salas');
    return response.data;
  },

  // Sincronizar todo el catálogo (franjas, salas, mesas, reservas)
  sincronizarTodo: async (): Promise<string> => {
    const response = await salaApi.post<string>('/mesas/sincronizar-todo');
    return response.data;
  },

  // Sincronizar carta completa (platos, tipos de carta, ingredientes)
  sincronizarCarta: async (): Promise<string> => {
    const response = await salaApi.post<string>('/carta/sync');
    return response.data;
  },

  // Sincronizar TODO: carta + mesas + reservas
  sincronizarTodoCompleto: async (): Promise<{ mensaje: string; resultados: { carta: string; catalogo: string } }> => {
    console.log('[salaService] Iniciando sincronización completa...');
    
    // Ejecutar ambas sincronizaciones en paralelo
    const [resultadoCarta, resultadoCatalogo] = await Promise.all([
      salaApi.post<string>('/carta/sync'),
      salaApi.post<string>('/mesas/sincronizar-todo'),
    ]);
    
    console.log('[salaService] Sincronización completa finalizada');
    
    return {
      mensaje: 'Sincronización completada exitosamente',
      resultados: {
        carta: resultadoCarta.data,
        catalogo: resultadoCatalogo.data,
      },
    };
  },

  // Carta operativa (desde tablas de sala-service)
  getPlatosOperativos: async (): Promise<PlatoOperativo[]> => {
    const response = await salaApi.get<PlatoOperativo[]>('/carta/platos');
    return response.data;
  },

  getPlatoOperativo: async (platoId: string): Promise<PlatoOperativo> => {
    const response = await salaApi.get<PlatoOperativo>(`/carta/platos/${platoId}`);
    return response.data;
  },

  getTiposCartaOperativos: async (): Promise<TipoCartaOperativo[]> => {
    const response = await salaApi.get<TipoCartaOperativo[]>('/carta/tipos-carta');
    return response.data;
  },

  getCartaActivaOperativa: async (): Promise<TipoCartaOperativo[]> => {
    const response = await salaApi.get<TipoCartaOperativo[]>('/carta/tipos-carta/activa');
    return response.data;
  },

  getPlatosStockBajoAfectados: async (): Promise<PlatoOperativo[]> => {
    const response = await salaApi.get<PlatoOperativo[]>('/carta/platos/stock-bajo-afectados');
    return response.data;
  },

  // Nuevos métodos para gestión de rondas y envío a cocina
  obtenerComandaConRondas: async (comandaId: string): Promise<ComandaDetalleRondas> => {
    const response = await salaApi.get<ComandaDetalleRondas>(`/comandas/${comandaId}/detalle-rondas`);
    return response.data;
  },

  enviarACocina: async (comandaId: string, data: EnviarCocinaRequest): Promise<void> => {
    await salaApi.post(`/comandas/${comandaId}/items/enviar-cocina`, data);
  },

  crearYEnviarACocina: async (comandaId: string, items: AgregarPedidoRequest[]): Promise<Pedido[]> => {
    console.log('[salaService] POST /comandas/${comandaId}/items/crear-y-enviar - Iniciando llamada API');
    try {
      const response = await salaApi.post<Pedido[]>(`/comandas/${comandaId}/items/crear-y-enviar`, items);
      console.log('[salaService] POST /comandas/${comandaId}/items/crear-y-enviar - Respuesta exitosa:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('[salaService] POST /comandas/${comandaId}/items/crear-y-enviar - Error:', error.response?.data || error.message);
      throw error;
    }
  },

  crearNuevaRonda: async (comandaId: string): Promise<{ numeroRonda: number }> => {
    console.log('[salaService] POST /comandas/${comandaId}/nueva-ronda - Iniciando llamada API');
    try {
      const response = await salaApi.post<{ numeroRonda: number }>(`/comandas/${comandaId}/nueva-ronda`);
      console.log('[salaService] POST /comandas/${comandaId}/nueva-ronda - Respuesta exitosa:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('[salaService] POST /comandas/${comandaId}/nueva-ronda - Error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Nuevos métodos para gestión de cuenta cerrada
  reenviarTicket: async (comandaId: string, impresora: string): Promise<void> => {
    console.log('[salaService] Reenviando ticket:', { comandaId, impresora });
    try {
      await salaApi.post(`/comandas/${comandaId}/cuenta/reimprimir`, {
        impresora
      });
      console.log('[salaService] Ticket reenviado exitosamente');
    } catch (error: any) {
      console.error('[salaService] Error al reenviar ticket:', error.message);
      throw error;
    }
  },

  modificarLineasCuenta: async (
    comandaId: string,
    itemIds: string[],
    motivo: string
  ): Promise<TicketResponse> => {
    console.log('[salaService] Modificando líneas de cuenta:', { comandaId, itemIds, motivo });
    try {
      const response = await salaApi.post<TicketResponse>(
        `/comandas/${comandaId}/cuenta/modificar`,
        itemIds,
        { params: { motivo } }
      );
      console.log('[salaService] Líneas modificadas exitosamente');
      return response.data;
    } catch (error: any) {
      console.error('[salaService] Error al modificar líneas:', error.message, error.response?.data);
      throw error;
    }
  },

  cancelarCuentaCerrada: async (
    comandaId: string,
    motivo: string,
    usuarioNombre: string
  ): Promise<TicketResponse> => {
    console.log('[salaService] Cancelando cuenta cerrada:', { comandaId, motivo, usuarioNombre });
    try {
      const response = await salaApi.post<TicketResponse>(
        `/comandas/${comandaId}/cuenta/cancelar`,
        null,
        { params: { motivo, usuarioNombre } }
      );
      console.log('[salaService] Cuenta cancelada exitosamente');
      return response.data;
    } catch (error: any) {
      console.error('[salaService] Error al cancelar cuenta:', error.message, error.response?.data);
      throw error;
    }
  },

  listarComandasHoy: async (): Promise<ComandaHoyResponse[]> => {
    console.log('[salaService] Listando comandas del día');
    try {
      const response = await salaApi.get<ComandaHoyResponse[]>('/comandas/hoy');
      console.log('[salaService] Comandas del día obtenidas:', response.data.length);
      return response.data;
    } catch (error: any) {
      console.error('[salaService] Error al listar comandas:', error.message);
      throw error;
    }
  },
};
