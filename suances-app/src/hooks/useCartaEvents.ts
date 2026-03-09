import { useEffect } from 'react';
import { useIngredienteStore } from '../store/ingredienteStore';
import { usePlatoStore } from '../store/platoStore';

interface UseCartaEventsOptions {
  enabled?: boolean;
}

export const useCartaEvents = (options: UseCartaEventsOptions = {}) => {
  const { enabled = true } = options;
  
  const fetchIngredientes = useIngredienteStore((state) => state.fetchIngredientes);
  const fetchPlatos = usePlatoStore((state) => state.fetchPlatos);

  useEffect(() => {
    if (!enabled) return;
    
    // Carga inicial
    fetchIngredientes(true);
    fetchPlatos(true);
  }, [enabled, fetchIngredientes, fetchPlatos]);

  return {
    isConnected: true,
  };
};
