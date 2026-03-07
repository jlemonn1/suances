import { reservasApi } from './api';
import {
  AgendaFilters,
  BloqueoRequest,
  DisponibilidadResponse,
  FranjaHoraria,
  FranjaRequest,
  Mesa,
  MesaRequest,
  Reserva,
  ReservaRequest,
  ReservaEstado,
  Sala,
  SalaRequest,
  WaitlistEntry,
  WaitlistEstado,
} from '../types/reservas';

export interface MesasOcupadasResponse {
  mesaIds: string[];
}

export const reservasService = {
  // Salas
  getSalas: async (): Promise<Sala[]> => {
    const response = await reservasApi.get<Sala[]>('/salas');
    return response.data;
  },

  createSala: async (payload: SalaRequest): Promise<Sala> => {
    const response = await reservasApi.post<Sala>('/salas', payload);
    return response.data;
  },

  updateSala: async (id: string, payload: SalaRequest): Promise<Sala> => {
    const response = await reservasApi.put<Sala>(`/salas/${id}`, payload);
    return response.data;
  },

  // Mesas
  getMesasBySala: async (salaId: string): Promise<Mesa[]> => {
    const response = await reservasApi.get<Mesa[]>(`/salas/${salaId}/mesas`);
    return response.data;
  },

  createMesa: async (salaId: string, payload: MesaRequest): Promise<Mesa> => {
    const response = await reservasApi.post<Mesa>(`/salas/${salaId}/mesas`, payload);
    return response.data;
  },

  updateMesa: async (mesaId: string, payload: MesaRequest): Promise<Mesa> => {
    const response = await reservasApi.patch<Mesa>(`/mesas/${mesaId}`, payload);
    return response.data;
  },

  crearBloqueo: async (mesaId: string, payload: BloqueoRequest): Promise<string> => {
    const response = await reservasApi.post<string>(`/mesas/${mesaId}/bloqueos`, null, {
      params: {
        tipo: payload.tipo,
        fechaDesde: payload.fechaDesde,
        fechaHasta: payload.fechaHasta,
        motivo: payload.motivo,
      },
    });
    return response.data;
  },

  eliminarBloqueo: async (mesaId: string, bloqueoId: string): Promise<void> => {
    await reservasApi.delete(`/mesas/${mesaId}/bloqueos/${bloqueoId}`);
  },

  // Franjas
  getFranjas: async (): Promise<FranjaHoraria[]> => {
    const response = await reservasApi.get<FranjaHoraria[]>('/franjas');
    return response.data;
  },

  createFranja: async (payload: FranjaRequest): Promise<FranjaHoraria> => {
    const response = await reservasApi.post<FranjaHoraria>('/franjas', payload);
    return response.data;
  },

  updateFranja: async (id: string, payload: FranjaRequest): Promise<FranjaHoraria> => {
    const response = await reservasApi.put<FranjaHoraria>(`/franjas/${id}`, payload);
    return response.data;
  },

  deleteFranja: async (id: string): Promise<void> => {
    await reservasApi.delete(`/franjas/${id}`);
  },

  // Reservas privadas
  getReservas: async (filters: AgendaFilters): Promise<Reserva[]> => {
    const response = await reservasApi.get<Reserva[]>('/reservas', {
      params: {
        fecha: filters.fecha,
        franjaId: filters.franjaId,
        estado: filters.estado,
      },
    });
    return response.data;
  },

  getMesasOcupadas: async (fecha: string, franjaId: string): Promise<MesasOcupadasResponse> => {
    const response = await reservasApi.get<MesasOcupadasResponse>('/reservas/mesas-ocupadas', {
      params: { fecha, franjaId },
    });
    return response.data;
  },

  createReserva: async (payload: ReservaRequest): Promise<Reserva> => {
    const response = await reservasApi.post<Reserva>('/reservas', payload);
    return response.data;
  },

  updateReserva: async (reservaId: string, payload: Partial<ReservaRequest>): Promise<Reserva> => {
    const response = await reservasApi.patch<Reserva>(`/reservas/${reservaId}`, payload);
    return response.data;
  },

  cancelReserva: async (reservaId: string, motivo?: string): Promise<Reserva> => {
    const response = await reservasApi.delete<Reserva>(`/reservas/${reservaId}`, {
      params: { motivo },
    });
    return response.data;
  },

  // Público / online
  consultarReservaPorCodigo: async (codigo: string): Promise<Reserva> => {
    const response = await reservasApi.get<Reserva>(`/public/reservas/${codigo}`);
    return response.data;
  },

  consultarDisponibilidad: async (fecha: string): Promise<DisponibilidadResponse[]> => {
    const response = await reservasApi.post<DisponibilidadResponse[]>(
      '/public/reservas/consultar',
      null,
      {
        params: { fecha },
      }
    );
    return response.data;
  },

  // Waitlist
  getWaitlist: async (fecha: string, franjaId: string): Promise<WaitlistEntry[]> => {
    const response = await reservasApi.get<WaitlistEntry[]>('/waitlist', {
      params: { fecha, franjaId },
    });
    return response.data;
  },

  actualizarWaitlistEstado: async (
    entryId: string,
    estado: WaitlistEstado
  ): Promise<WaitlistEntry> => {
    const response = await reservasApi.post<WaitlistEntry>(`/waitlist/${entryId}/estado`, null, {
      params: { estado },
    });
    return response.data;
  },
};
