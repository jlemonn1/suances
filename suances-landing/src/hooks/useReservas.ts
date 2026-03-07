import { useState } from 'react';
import type { DisponibilidadResponse, ReservaPublicaRequest, ReservaResponse } from '../types';
import { reservaService } from '../services/reservaService';

export function useReservas() {
  const [disponibilidad, setDisponibilidad] = useState<DisponibilidadResponse[]>([]);
  const [reserva, setReserva] = useState<ReservaResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkDisponibilidad = async (fecha: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await reservaService.getDisponibilidad(fecha);
      setDisponibilidad(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const crearReserva = async (data: ReservaPublicaRequest) => {
    setLoading(true);
    setError(null);
    try {
      const nuevaReserva = await reservaService.crearReserva(data);
      setReserva(nuevaReserva);
      return nuevaReserva;
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Error desconocido';
      setError(msg);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const consultarReserva = async (codigo: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await reservaService.getReserva(codigo);
      setReserva(data);
      return data;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error desconocido');
      throw e;
    } finally {
      setLoading(false);
    }
  };

  return {
    disponibilidad,
    reserva,
    loading,
    error,
    checkDisponibilidad,
    crearReserva,
    consultarReserva,
  };
}
