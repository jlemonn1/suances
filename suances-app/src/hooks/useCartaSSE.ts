import { useEffect, useRef, useCallback } from 'react';
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
  
  const { updatePlatoFromSSE, fetchPlatos } = usePlatoStore();
  const { updateIngredienteFromSSE, fetchIngredientes } = useIngredienteStore();
  const { updateTipoCartaFromSSE } = useTipoCartaOperativoStore();

  const connect = useCallback(() => {
    console.log('[CARTA-SSE] Intentando conectar...');
    
    if (eventSourceRef.current) {
      console.log('[CARTA-SSE] Ya hay conexión existente, cancelando');
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
        console.log('[CARTA-SSE] Evento connected recibido:', event.data);
      });

      es.addEventListener('message', (event: any) => {
        console.log('[CARTA-SSE] Mensaje recibido:', event.type, event.data);
      });

      // Evento: Plato creado
      es.addEventListener('carta.plato_creado', (event: any) => {
        console.log('[CARTA-SSE] Evento carta.plato_creado RAW:', event);
        try {
          const data = JSON.parse(event.data);
          console.log('[CARTA-SSE] Plato creado:', data);
          
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
          
          // Notificar a la pantalla para recargar
          onPlatoChanged?.();
        } catch (error) {
          console.error('[CARTA-SSE] Error parseando evento plato_creado:', error);
        }
      });

      // Evento: Plato actualizado
      es.addEventListener('carta.plato_actualizado', (event: any) => {
        console.log('[CARTA-SSE] Evento carta.plato_actualizado RAW:', event);
        try {
          const data = JSON.parse(event.data);
          console.log('[CARTA-SSE] Plato actualizado:', data);
          
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
          
          // Notificar a la pantalla para recargar
          onPlatoChanged?.();
        } catch (error) {
          console.error('[CARTA-SSE] Error parseando evento plato_actualizado:', error);
        }
      });

      // Evento: Plato disponible (activado)
      es.addEventListener('carta.plato_disponible', (event: any) => {
        console.log('[CARTA-SSE] Evento carta.plato_disponible RAW:', event);
        try {
          const data = JSON.parse(event.data);
          console.log('[CARTA-SSE] Plato disponible:', data);
          
          updatePlatoFromSSE({
            platoId: data.platoId,
            nombre: data.nombre,
            disponible: true,
          });
          
          // Notificar a la pantalla para recargar
          onPlatoChanged?.();
        } catch (error) {
          console.error('[CARTA-SSE] Error parseando evento plato_disponible:', error);
        }
      });

      // Evento: Plato no disponible (desactivado)
      es.addEventListener('carta.plato_no_disponible', (event: any) => {
        console.log('[CARTA-SSE] Evento carta.plato_no_disponible RAW:', event);
        try {
          const data = JSON.parse(event.data);
          console.log('[CARTA-SSE] Plato no disponible:', data);
          
          updatePlatoFromSSE({
            platoId: data.platoId,
            nombre: data.nombre,
            disponible: false,
          });
          
          // Notificar a la pantalla para recargar
          onPlatoChanged?.();
        } catch (error) {
          console.error('[CARTA-SSE] Error parseando evento plato_no_disponible:', error);
        }
      });

      // Evento: Stock de plato cambiado
      es.addEventListener('carta.plato_stock_changed', (event: any) => {
        console.log('[CARTA-SSE] Evento carta.plato_stock_changed RAW:', event);
        try {
          const data = JSON.parse(event.data);
          console.log('[CARTA-SSE] Stock de plato cambiado:', data);
          
          updatePlatoFromSSE({
            platoId: data.platoId,
            nombre: data.nombre,
            stockDisponible: data.stockDisponible,
            stockBajo: data.stockBajo,
          });
          
          // Notificar a la pantalla para recargar
          onPlatoChanged?.();
        } catch (error) {
          console.error('[CARTA-SSE] Error parseando evento plato_stock_changed:', error);
        }
      });

      // Evento: Tipo de carta actualizado (platos añadidos/eliminados)
      es.addEventListener('carta.tipo_carta_updated', (event: any) => {
        console.log('[CARTA-SSE] Evento carta.tipo_carta_updated RAW:', event);
        try {
          const data = JSON.parse(event.data);
          console.log('[CARTA-SSE] Tipo de carta actualizado:', data);
          
          // Actualizar store de tipos de carta
          updateTipoCartaFromSSE({
            tipoCartaId: data.tipoCartaId,
            nombre: data.nombre,
            horaInicio: data.horaInicio,
            horaFin: data.horaFin,
            activo: data.activo,
            tipo: data.tipo,
            platoId: data.platoId,
          });
          
          // Notificar a la pantalla para recargar tipos de carta completos
          onTipoCartaChanged?.();
          
          // Si es un cambio específico de plato, también notificar cambio de plato
          if (data.tipo === 'PLATO_ADDED_TO_CARTA' || data.tipo === 'PLATO_REMOVED_FROM_CARTA') {
            onPlatoChanged?.();
          }
        } catch (error) {
          console.error('[CARTA-SSE] Error parseando evento tipo_carta_updated:', error);
        }
      });

      // Evento: Platos de tipo de carta actualizados (lista completa reemplazada)
      es.addEventListener('carta.tipo_carta.platos_updated', (event: any) => {
        console.log('[CARTA-SSE] Evento carta.tipo_carta.platos_updated RAW:', event);
        try {
          const data = JSON.parse(event.data);
          console.log('[CARTA-SSE] Platos de tipo de carta actualizados:', data);
          
          // Actualizar store de tipos de carta con los nuevos platos
          updateTipoCartaFromSSE({
            tipoCartaId: data.tipoCartaId,
            nombre: data.nombre,
            horaInicio: data.horaInicio,
            horaFin: data.horaFin,
            activo: data.activo,
            tipo: 'PLATOS_LISTA_COMPLETA',
          });
          
          // Notificar a la pantalla para recargar todo
          onTipoCartaChanged?.();
          onPlatoChanged?.();
        } catch (error) {
          console.error('[CARTA-SSE] Error parseando evento tipo_carta.platos_updated:', error);
        }
      });

      // Evento: Stock cambiado
      es.addEventListener('carta.stock_changed', (event: any) => {
        console.log('[CARTA-SSE] Evento carta.stock_changed RAW:', event);
        try {
          const data = JSON.parse(event.data);
          console.log('[CARTA-SSE] Stock cambiado:', data);
          
          updateIngredienteFromSSE({
            ingredienteId: data.ingredienteId,
            nombre: data.nombre,
            stockActual: data.stockActual,
            umbralAlerta: data.umbralAlerta,
          });
        } catch (error) {
          console.error('[CARTA-SSE] Error parseando evento stock_changed:', error);
        }
      });

      // Evento: Stock bajo
      es.addEventListener('carta.stock_bajo', (event: any) => {
        console.log('[CARTA-SSE] Evento carta.stock_bajo RAW:', event);
        try {
          const data = JSON.parse(event.data);
          console.log('[CARTA-SSE] Stock bajo:', data);
          
          updateIngredienteFromSSE({
            ingredienteId: data.ingredienteId,
            nombre: data.nombre,
            stockActual: data.stockActual,
            umbralAlerta: data.umbralAlerta,
            tipoAlerta: 'STOCK_BAJO',
          });
        } catch (error) {
          console.error('[CARTA-SSE] Error parseando evento stock_bajo:', error);
        }
      });

      // Manejar errores
      es.addEventListener('error', (event: any) => {
        console.error('[CARTA-SSE] Error en conexión:', event);
        
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
        }
        reconnectTimeoutRef.current = setTimeout(() => {
          console.log('[CARTA-SSE] Intentando reconexión...');
          disconnect();
          connect();
        }, 5000);
      });

      eventSourceRef.current = es;
      console.log('[CARTA-SSE] EventSource guardado en ref');
    } catch (error) {
      console.error('[CARTA-SSE] Error al crear EventSource:', error);
    }
  }, [updatePlatoFromSSE, updateIngredienteFromSSE, updateTipoCartaFromSSE, onPlatoChanged, onTipoCartaChanged]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
      console.log('[CARTA-SSE] Desconectado');
    }
  }, []);

  useEffect(() => {
    if (enabled) {
      connect();
    }
    return () => {
      disconnect();
    };
  }, [enabled, connect, disconnect]);

  return { connect, disconnect };
};
