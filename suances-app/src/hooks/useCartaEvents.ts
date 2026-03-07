import { useEffect, useRef } from 'react';
import { useIngredienteStore } from '../store/ingredienteStore';
import { usePlatoStore } from '../store/platoStore';

const POLLING_INTERVAL = 10000; // 10 segundos

interface UseCartaEventsOptions {
  enabled?: boolean;
}

export const useCartaEvents = (options: UseCartaEventsOptions = {}) => {
  const { enabled = true } = options;
  
  const fetchIngredientes = useIngredienteStore((state) => state.fetchIngredientes);
  const fetchPlatos = usePlatoStore((state) => state.fetchPlatos);
  const setAlertasFromPoll = useIngredienteStore((state) => state.setAlertasFromPoll);
  const setPlatosAgotadosFromPoll = usePlatoStore((state) => state.setPlatosAgotadosFromPoll);
  const ingredientes = useIngredienteStore((state) => state.ingredientes);
  const platos = usePlatoStore((state) => state.platos);
  const checkDisponibilidad = usePlatoStore((state) => state.checkDisponibilidad);
  
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const previousIngredientesRef = useRef<string>('');
  const previousPlatosRef = useRef<string>('');

  const poll = async () => {
    try {
      await fetchIngredientes(true);
      await fetchPlatos(true);
      
      // Verificar cambios en ingredientes (usando valores frescos del store)
      const currentIngredientes = useIngredienteStore.getState().ingredientes;
      const currentKey = JSON.stringify(currentIngredientes.map(i => ({
        id: i.id,
        stockActual: i.stockActual,
        umbralAlerta: i.umbralAlerta,
      })));
      
      if (previousIngredientesRef.current && previousIngredientesRef.current !== currentKey) {
        const nuevosStockBajo = currentIngredientes.filter(i => 
          i.stockActual < (i.umbralAlerta || 0) && i.stockActual > 0
        );
        const nuevosStockCritico = currentIngredientes.filter(i => 
          i.stockActual <= 0
        );
        
        if (nuevosStockBajo.length > 0 || nuevosStockCritico.length > 0) {
          console.log('[CARTA-EVENTS] Nuevas alertas de stock:', {
            stockBajo: nuevosStockBajo.length,
            stockCritico: nuevosStockCritico.length
          });
          setAlertasFromPoll(nuevosStockBajo, nuevosStockCritico);
        }
      }
      previousIngredientesRef.current = currentKey;
      
      console.log('[FRONT] Polling carta - ingredientes:', currentIngredientes.length);
    } catch (error) {
      console.error('[FRONT] Polling carta error:', error);
    }
  };

  useEffect(() => {
    if (!enabled) return;
    
    // Poll inicial
    poll();
    
    // Poll periódico
    pollingRef.current = setInterval(poll, POLLING_INTERVAL);
    
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };
  }, [enabled]);

  return {
    isConnected: true,
  };
};
