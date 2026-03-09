import { useEffect, useCallback } from 'react';
import { useReservasStore } from '../store/reservasStore';

interface UseReservaEventsOptions {
  enabled?: boolean;
}

export const useReservaEvents = (options: UseReservaEventsOptions = {}) => {
  const { enabled = true } = options;
  const { agendaFilters, fetchReservas } = useReservasStore();

  const loadInitial = useCallback(async () => {
    try {
      const { fecha } = agendaFilters;
      if (!fecha) return;

      await fetchReservas({ fecha });
    } catch (error) {
      console.error('[FRONT] Error cargando reservas:', error);
    }
  }, [agendaFilters.fecha, fetchReservas]);

  useEffect(() => {
    if (enabled) {
      loadInitial();
    }
  }, [enabled, loadInitial]);

  return {
    isConnected: true,
  };
};
