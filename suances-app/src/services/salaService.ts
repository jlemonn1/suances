import { salaApi } from './api';
import type {
  Comanda,
  ComandaDetalle,
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

  cerrarComanda: async (
    id: string,
    data: { tipoPago: string }
  ): Promise<Comanda> => {
    const response = await salaApi.post(`/comandas/${id}/cerrar`, data);
    return response.data;
  },

  cobrarComanda: async (id: string, data: CobrarRequest): Promise<CobroResponse> => {
    const response = await salaApi.post<CobroResponse>(`/comandas/${id}/cobrar`, data);
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
    const response = await salaApi.post<Pedido[]>(
      `/comandas/${comandaId}/items`,
      [data]
    );
    return response.data;
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
};
