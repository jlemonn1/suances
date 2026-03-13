import { useEffect, useRef } from 'react';
import EventSource from 'react-native-sse';
import { useSalaStore } from '../store/salaStore';
import { API_CONFIG } from '../config';

interface UseSalaSSEOptions {
  enabled?: boolean;
  salaId?: string;
  franjaId?: string;
}

export const useSalaSSE = (options: UseSalaSSEOptions = {}) => {
  const { enabled = true, salaId, franjaId } = options;
  const eventSourceRef = useRef<any>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const enabledRef = useRef(enabled);
  const salaIdRef = useRef(salaId);
  const franjaIdRef = useRef(franjaId);
  
  // Actualizar refs
  enabledRef.current = enabled;
  salaIdRef.current = salaId;
  franjaIdRef.current = franjaId;
  
  const { updateMesaFromSSE, fetchMesas, setSseConnected } = useSalaStore();

  useEffect(() => {
    if (!enabled || !salaId) {
      return;
    }
    
    console.log('[SALA-SSE] Iniciando conexión SSE...');
    
    const connect = () => {
      if (eventSourceRef.current) {
        console.log('[SALA-SSE] Ya existe conexión, saltando');
        return;
      }

      try {
        const url = `${API_CONFIG.SALA_BASE_URL}/mesas/events`;
        console.log('[SALA-SSE] Conectando a:', url);

        const es = new EventSource(url);

        es.addEventListener('open', () => {
          console.log('[SALA-SSE] Conexión establecida');
          setSseConnected(true);
        });

        es.addEventListener('connected', (event: any) => {
          console.log('[SALA-SSE] Evento connected recibido');
        });

        es.addEventListener('mesa.reservada', (event: any) => {
          try {
            const data = JSON.parse(event.data);
            console.log('[SALA-SSE] Mesa reservada:', data.mesaId);
            
            if (data.tipo === 'MODIFICADA' || data.tipo === 'CAMBIO_MESA') {
              console.log('[SALA-SSE] Reserva modificada, haciendo refetch');
              fetchMesas({ salaId: salaIdRef.current, franjaId: franjaIdRef.current });
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
            console.error('[SALA-SSE] Error parseando mesa.reservada:', error);
          }
        });

        es.addEventListener('mesa.liberada', (event: any) => {
          try {
            const data = JSON.parse(event.data);
            console.log('[SALA-SSE] Mesa liberada:', data.mesaId);
            
            if (data.tipo === 'CAMBIO_MESA') {
              fetchMesas({ salaId: salaIdRef.current, franjaId: franjaIdRef.current });
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
            console.error('[SALA-SSE] Error parseando mesa.liberada:', error);
          }
        });

        es.addEventListener('mesa.estado_cambiado', (event: any) => {
          try {
            const data = JSON.parse(event.data);
            console.log('[SALA-SSE] Estado de mesa cambiado:', data);
            
            // Actualizar estado local inmediatamente
            updateMesaFromSSE({
              mesaId: data.mesaId,
              estado: data.estado,
              comandaId: data.comandaId,
              codigo: data.codigo,
              camareroId: data.camareroId,
            });
            
            // Refetch completo para asegurar sincronización
            fetchMesas({ salaId: salaIdRef.current, franjaId: franjaIdRef.current });
          } catch (error) {
            console.error('[SALA-SSE] Error parseando mesa.estado_cambiado:', error);
          }
        });

        es.addEventListener('error', (event: any) => {
          console.error('[SALA-SSE] Error en conexión');
          setSseConnected(false);
          
          if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
          }
          
          eventSourceRef.current?.close();
          eventSourceRef.current = null;
          
          reconnectTimeoutRef.current = setTimeout(() => {
            if (enabledRef.current && salaIdRef.current) {
              console.log('[SALA-SSE] Reconectando...');
              connect();
            }
          }, 5000);
        });

        eventSourceRef.current = es;
      } catch (error) {
        console.error('[SALA-SSE] Error al crear EventSource:', error);
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
        console.log('[SALA-SSE] Desconectado');
      }
    };

    connect();

    return () => {
      disconnect();
    };
  }, [enabled, salaId, franjaId, updateMesaFromSSE, fetchMesas, setSseConnected]);

  return { 
    connect: () => {}, 
    disconnect: () => {} 
  };
};
