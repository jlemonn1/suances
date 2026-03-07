import { useEffect, useRef, useCallback } from 'react';
import { useReservasStore } from '../store/reservasStore';

const POLLING_INTERVAL = 10000; // 10 segundos

interface UseReservaEventsOptions {
  enabled?: boolean;
}

export const useReservaEvents = (options: UseReservaEventsOptions = {}) => {
  const { enabled = true } = options;
  const { agendaFilters, fetchReservas } = useReservasStore();
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const poll = useCallback(async () => {
    try {
      const { fecha } = agendaFilters;
      if (!fecha) return;

      await fetchReservas({ fecha });
      console.log('[FRONT] Polling reservas para fecha:', fecha);
    } catch (error) {
      console.error('[FRONT] Polling error:', error);
    }
  }, [agendaFilters.fecha, fetchReservas]);

  const startPolling = useCallback(() => {
    if (pollingRef.current) return;
    
    console.log('[FRONT] Iniciando polling de reservas (cada 10s)');
    poll();
    pollingRef.current = setInterval(poll, POLLING_INTERVAL);
  }, [poll]);

  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      console.log('[FRONT] Deteniendo polling de reservas');
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (enabled) {
      startPolling();
    }
    return () => stopPolling();
  }, [enabled, startPolling, stopPolling]);

  return {
    isConnected: true,
    connect: startPolling,
    disconnect: stopPolling,
  };
};
