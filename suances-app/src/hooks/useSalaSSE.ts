import { useEffect, useRef, useCallback } from 'react';
import EventSource from 'react-native-sse';
import { useSalaStore } from '../store/salaStore';
import { API_CONFIG } from '../config';

interface UseSalaSSEOptions {
  enabled?: boolean;
  salaId?: string;
}

export const useSalaSSE = (options: UseSalaSSEOptions = {}) => {
  const { enabled = true, salaId } = options;
  const eventSourceRef = useRef<any>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { updateMesaFromSSE, fetchMesas } = useSalaStore();

  const connect = useCallback(() => {
    console.log('[SALA-SSE] Intentando conectar...', 'EventSource existente:', eventSourceRef.current ? 'SÍ' : 'NO');
    
    if (eventSourceRef.current) {
      console.log('[SALA-SSE] Ya hay conexión existente, cancelando');
      return;
    }

    try {
      const url = `${API_CONFIG.SALA_BASE_URL}/mesas/events`;
      console.log('[SALA-SSE] Conectando a:', url);

      // El endpoint SSE es público, no necesita autenticación
      const es = new EventSource(url);
      
      console.log('[SALA-SSE] EventSource creado exitosamente');

      // Manejar apertura de conexión
      es.addEventListener('open', () => {
        console.log('[SALA-SSE] Conexión establecida');
      });

      // Manejar evento de conexión exitosa del servidor
      es.addEventListener('connected', (event: any) => {
        console.log('[SALA-SSE] Evento connected recibido:', event.data);
      });

      // Manejar TODOS los mensajes (debug)
      es.addEventListener('message', (event: any) => {
        console.log('[SALA-SSE] Mensaje recibido:', event.type, event.data);
      });

      // Manejar evento mesa.reservada
      es.addEventListener('mesa.reservada', (event: any) => {
        console.log('[SALA-SSE] Evento mesa.reservada RAW:', event);
        try {
          const data = JSON.parse(event.data);
          console.log('[SALA-SSE] Mesa reservada:', data);
          
          // Si es una modificación con cambio de mesa, hacer refetch completo
          if (data.tipo === 'MODIFICADA' || data.tipo === 'CAMBIO_MESA') {
            console.log('[SALA-SSE] Reserva modificada, haciendo refetch completo');
            fetchMesas({ salaId });
          } else {
            updateMesaFromSSE({
              mesaId: data.mesaId,
              estado: 'RESERVADA',
              reservaId: data.reservaId,
              nombreCliente: data.nombreCliente,
              franjaId: data.franjaId,
            });
          }
        } catch (error) {
          console.error('[SALA-SSE] Error parseando evento mesa.reservada:', error);
        }
      });

      // Manejar evento mesa.liberada
      es.addEventListener('mesa.liberada', (event: any) => {
        console.log('[SALA-SSE] Evento mesa.liberada RAW:', event);
        try {
          const data = JSON.parse(event.data);
          console.log('[SALA-SSE] Mesa liberada:', data);
          
          // Si es un cambio de mesa, hacer refetch completo para sincronizar ambas mesas
          if (data.tipo === 'CAMBIO_MESA') {
            console.log('[SALA-SSE] Cambio de mesa detectado, haciendo refetch completo');
            fetchMesas({ salaId });
          } else {
            updateMesaFromSSE({
              mesaId: data.mesaId,
              estado: 'LIBRE',
              reservaId: undefined,
              nombreCliente: undefined,
              franjaId: undefined,
            });
          }
        } catch (error) {
          console.error('[SALA-SSE] Error parseando evento mesa.liberada:', error);
        }
      });

      // Manejar evento mesa.estado_cambiado
      es.addEventListener('mesa.estado_cambiado', (event: any) => {
        console.log('[SALA-SSE] Evento mesa.estado_cambiado RAW:', event);
        try {
          const data = JSON.parse(event.data);
          console.log('[SALA-SSE] Estado de mesa cambiado:', data);
          fetchMesas({ salaId });
        } catch (error) {
          console.error('[SALA-SSE] Error parseando evento mesa.estado_cambiado:', error);
        }
      });

      // Manejar errores
      es.addEventListener('error', (event: any) => {
        console.error('[SALA-SSE] Error en conexión:', event);
        
        // Reconectar después de 5 segundos
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
        }
        reconnectTimeoutRef.current = setTimeout(() => {
          console.log('[SALA-SSE] Intentando reconexión...');
          disconnect();
          connect();
        }, 5000);
      });

      eventSourceRef.current = es;
      console.log('[SALA-SSE] EventSource guardado en ref');
    } catch (error) {
      console.error('[SALA-SSE] Error al crear EventSource:', error);
    }
  }, [updateMesaFromSSE, fetchMesas, salaId]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
      console.log('[SALA-SSE] Desconectado');
    }
  }, []);

  useEffect(() => {
    if (enabled && salaId) {
      connect();
    }
    return () => {
      disconnect();
    };
  }, [enabled, connect, disconnect, salaId]);

  return { connect, disconnect };
};
