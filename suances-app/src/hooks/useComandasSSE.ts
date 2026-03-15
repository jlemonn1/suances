import { useEffect, useRef } from 'react';
import EventSource from 'react-native-sse';
import { useSalaStore } from '../store/salaStore';
import { API_CONFIG } from '../config';

interface UseComandasSSEOptions {
  enabled?: boolean;
}

export const useComandasSSE = (options: UseComandasSSEOptions = {}) => {
  const { enabled = true } = options;
  const eventSourceRef = useRef<any>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const enabledRef = useRef(enabled);
  
  const { fetchComandasHoy, setSseConnected } = useSalaStore();

  useEffect(() => {
    if (!enabled) {
      return;
    }
    
    console.log('[COMANDAS-SSE] Iniciando conexión SSE para comandas...');
    
    const connect = () => {
      if (eventSourceRef.current) {
        console.log('[COMANDAS-SSE] Ya existe conexión, saltando');
        return;
      }

      try {
        const url = `${API_CONFIG.SALA_BASE_URL}/mesas/events`;
        console.log('[COMANDAS-SSE] Conectando a:', url);

        const es = new EventSource(url);

        es.addEventListener('open', () => {
          console.log('[COMANDAS-SSE] Conexión establecida');
          setSseConnected(true);
        });

        es.addEventListener('connected', (event: any) => {
          console.log('[COMANDAS-SSE] Evento connected recibido');
        });

        // Escuchar cambios en mesas que afectan a comandas
        es.addEventListener('mesa.estado_cambiado', (event: any) => {
          try {
            const data = JSON.parse(event.data);
            console.log('[COMANDAS-SSE] Estado de mesa cambiado, recargando comandas:', data);
            
            // Recargar comandas cuando cambia el estado de una mesa
            fetchComandasHoy();
          } catch (error) {
            console.error('[COMANDAS-SSE] Error parseando mesa.estado_cambiado:', error);
          }
        });

        es.addEventListener('error', (event: any) => {
          console.error('[COMANDAS-SSE] Error en conexión');
          setSseConnected(false);
          
          if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
          }
          
          eventSourceRef.current?.close();
          eventSourceRef.current = null;
          
          reconnectTimeoutRef.current = setTimeout(() => {
            if (enabledRef.current) {
              console.log('[COMANDAS-SSE] Reconectando...');
              connect();
            }
          }, 5000);
        });

        eventSourceRef.current = es;
      } catch (error) {
        console.error('[COMANDAS-SSE] Error al crear EventSource:', error);
      }
    };

    const disconnect = () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
        console.log('[COMANDAS-SSE] Desconectado');
      }
    };

    connect();

    return () => {
      disconnect();
    };
  }, [enabled, fetchComandasHoy, setSseConnected]);

  return { 
    connect: () => {}, 
    disconnect: () => {} 
  };
};
