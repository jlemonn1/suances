import { useEffect, useRef } from 'react';
import EventSource from 'react-native-sse';
import { API_CONFIG } from '../config';
import { usePlatoStore } from '../store/platoStore';
import { useIngredienteStore } from '../store/ingredienteStore';
import { useTipoCartaOperativoStore } from '../store/tipoCartaOperativoStore';

interface UseCartaSSEOptions {
  enabled?: boolean;
  onPlatoChanged?: () => void;
  onTipoCartaChanged?: () => void;
}

export const useCartaSSE = (options: UseCartaSSEOptions = {}) => {
  const { enabled = true, onPlatoChanged, onTipoCartaChanged } = options;
  const eventSourceRef = useRef<any>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const enabledRef = useRef(enabled);
  
  // Guardar refs de las funciones para evitar re-creación
  const onPlatoChangedRef = useRef(onPlatoChanged);
  const onTipoCartaChangedRef = useRef(onTipoCartaChanged);
  
  // Actualizar refs cuando cambian
  enabledRef.current = enabled;
  onPlatoChangedRef.current = onPlatoChanged;
  onTipoCartaChangedRef.current = onTipoCartaChanged;
  
  const { updatePlatoFromSSE } = usePlatoStore();
  const { updateIngredienteFromSSE } = useIngredienteStore();
  const { updateTipoCartaFromSSE } = useTipoCartaOperativoStore();

  useEffect(() => {
    if (!enabled) {
      return;
    }
    
    console.log('[CARTA-SSE] Iniciando conexión SSE...');
    
    const connect = () => {
      if (eventSourceRef.current) {
        console.log('[CARTA-SSE] Ya existe conexión, saltando');
        return;
      }

      try {
        const url = `${API_CONFIG.SALA_BASE_URL}/carta/events`;
        console.log('[CARTA-SSE] Conectando a:', url);

        const es = new EventSource(url);

        es.addEventListener('open', () => {
          console.log('[CARTA-SSE] Conexión establecida');
        });

        es.addEventListener('connected', (event: any) => {
          console.log('[CARTA-SSE] Evento connected recibido');
        });

        // Evento: Plato creado
        es.addEventListener('carta.plato_creado', (event: any) => {
          try {
            const data = JSON.parse(event.data);
            console.log('[CARTA-SSE] Plato creado:', data.platoId);
            
            updatePlatoFromSSE({
              platoId: data.platoId,
              nombre: data.nombre,
              descripcion: data.descripcion,
              precioVenta: data.precioVenta,
              categoriaId: data.categoriaId,
              categoriaNombre: data.categoriaNombre,
              activo: data.activo,
              imagenUrl: data.imagenUrl,
              ingredientes: data.ingredientes,
            });
            
            onPlatoChangedRef.current?.();
          } catch (error) {
            console.error('[CARTA-SSE] Error parseando plato_creado:', error);
          }
        });

        // Evento: Plato actualizado
        es.addEventListener('carta.plato_actualizado', (event: any) => {
          try {
            const data = JSON.parse(event.data);
            console.log('[CARTA-SSE] Plato actualizado:', data.platoId);
            
            updatePlatoFromSSE({
              platoId: data.platoId,
              nombre: data.nombre,
              descripcion: data.descripcion,
              precioVenta: data.precioVenta,
              categoriaId: data.categoriaId,
              categoriaNombre: data.categoriaNombre,
              activo: data.activo,
              imagenUrl: data.imagenUrl,
              ingredientes: data.ingredientes,
            });
            
            onPlatoChangedRef.current?.();
          } catch (error) {
            console.error('[CARTA-SSE] Error parseando plato_actualizado:', error);
          }
        });

        // Evento: Plato disponible
        es.addEventListener('carta.plato_disponible', (event: any) => {
          try {
            const data = JSON.parse(event.data);
            console.log('[CARTA-SSE] Plato disponible:', data.platoId);
            
            updatePlatoFromSSE({
              platoId: data.platoId,
              nombre: data.nombre,
              disponible: true,
            });
            
            onPlatoChangedRef.current?.();
          } catch (error) {
            console.error('[CARTA-SSE] Error parseando plato_disponible:', error);
          }
        });

        // Evento: Plato no disponible
        es.addEventListener('carta.plato_no_disponible', (event: any) => {
          try {
            const data = JSON.parse(event.data);
            console.log('[CARTA-SSE] Plato no disponible:', data.platoId);
            
            updatePlatoFromSSE({
              platoId: data.platoId,
              nombre: data.nombre,
              disponible: false,
            });
            
            onPlatoChangedRef.current?.();
          } catch (error) {
            console.error('[CARTA-SSE] Error parseando plato_no_disponible:', error);
          }
        });

        // Evento: Stock de plato cambiado
        es.addEventListener('carta.plato_stock_changed', (event: any) => {
          try {
            const data = JSON.parse(event.data);
            console.log('[CARTA-SSE] Stock plato cambiado:', data.platoId);
            
            updatePlatoFromSSE({
              platoId: data.platoId,
              nombre: data.nombre,
              stockDisponible: data.stockDisponible,
              stockBajo: data.stockBajo,
            });
            
            onPlatoChangedRef.current?.();
          } catch (error) {
            console.error('[CARTA-SSE] Error parseando plato_stock_changed:', error);
          }
        });

        // Evento: Tipo de carta actualizado
        es.addEventListener('carta.tipo_carta_updated', (event: any) => {
          try {
            const data = JSON.parse(event.data);
            console.log('[CARTA-SSE] Tipo carta actualizado:', data.tipoCartaId);
            
            updateTipoCartaFromSSE({
              tipoCartaId: data.tipoCartaId,
              nombre: data.nombre,
              horaInicio: data.horaInicio,
              horaFin: data.horaFin,
              activo: data.activo,
              tipo: data.tipo,
              platoId: data.platoId,
            });
            
            onTipoCartaChangedRef.current?.();
            
            if (data.tipo === 'PLATO_ADDED_TO_CARTA' || data.tipo === 'PLATO_REMOVED_FROM_CARTA') {
              onPlatoChangedRef.current?.();
            }
          } catch (error) {
            console.error('[CARTA-SSE] Error parseando tipo_carta_updated:', error);
          }
        });

        // Evento: Stock cambiado
        es.addEventListener('carta.stock_changed', (event: any) => {
          try {
            const data = JSON.parse(event.data);
            updateIngredienteFromSSE({
              ingredienteId: data.ingredienteId,
              nombre: data.nombre,
              stockActual: data.stockActual,
              umbralAlerta: data.umbralAlerta,
            });
          } catch (error) {
            console.error('[CARTA-SSE] Error parseando stock_changed:', error);
          }
        });

        // Evento: Stock bajo
        es.addEventListener('carta.stock_bajo', (event: any) => {
          try {
            const data = JSON.parse(event.data);
            updateIngredienteFromSSE({
              ingredienteId: data.ingredienteId,
              nombre: data.nombre,
              stockActual: data.stockActual,
              umbralAlerta: data.umbralAlerta,
              tipoAlerta: 'STOCK_BAJO',
            });
          } catch (error) {
            console.error('[CARTA-SSE] Error parseando stock_bajo:', error);
          }
        });

        // Manejar errores con reconexión
        es.addEventListener('error', (event: any) => {
          console.error('[CARTA-SSE] Error en conexión');
          
          if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
          }
          
          eventSourceRef.current?.close();
          eventSourceRef.current = null;
          
          reconnectTimeoutRef.current = setTimeout(() => {
            if (enabledRef.current) {
              console.log('[CARTA-SSE] Reconectando...');
              connect();
            }
          }, 5000);
        });

        eventSourceRef.current = es;
      } catch (error) {
        console.error('[CARTA-SSE] Error al crear EventSource:', error);
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
        console.log('[CARTA-SSE] Desconectado');
      }
    };

    connect();

    return () => {
      disconnect();
    };
  }, [enabled, updatePlatoFromSSE, updateIngredienteFromSSE, updateTipoCartaFromSSE]);

  return { 
    connect: () => {}, 
    disconnect: () => {} 
  };
};
