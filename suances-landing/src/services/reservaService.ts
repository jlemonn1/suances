import type {
  FranjaResponse,
  DisponibilidadResponse,
  ReservaPublicaRequest,
  ReservaResponse,
} from '../types';

const API_BASE = 'http://localhost/api/reservas';

export const reservaService = {
  async getFranjas(): Promise<FranjaResponse[]> {
    const res = await fetch(`${API_BASE}/public/reservas/franjas`);
    if (!res.ok) throw new Error('Error al obtener franjas');
    return res.json();
  },

  async getDisponibilidad(fecha: string): Promise<DisponibilidadResponse[]> {
    const res = await fetch(
      `${API_BASE}/public/reservas/consultar?fecha=${fecha}`
    );
    if (!res.ok) throw new Error('Error al obtener disponibilidad');
    return res.json();
  },

  async crearReserva(data: ReservaPublicaRequest): Promise<ReservaResponse> {
    const res = await fetch(`${API_BASE}/public/reservas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fecha: data.fecha,
        franjaId: data.franjaId,
        comensales: data.comensales,
        nombre: data.nombre,
        telefono: data.telefono,
      }),
    });
    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(error.message || 'Error al crear reserva');
    }
    return res.json();
  },

  async getReserva(codigo: string): Promise<ReservaResponse> {
    const res = await fetch(`${API_BASE}/public/reservas/${codigo}`);
    if (!res.ok) throw new Error('Reserva no encontrada');
    return res.json();
  },
};
