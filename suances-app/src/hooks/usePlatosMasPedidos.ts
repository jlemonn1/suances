import { useMemo } from 'react';
import { usePlatoStore } from '../store/platoStore';
import { PlatoResponse } from '../types/plato';

export const usePlatosMasPedidos = (limit: number = 4): PlatoResponse[] => {
  const platos = usePlatoStore((state) => state.platos);

  return useMemo(() => {
    return [...platos]
      .filter((plato) => plato.activo)
      .sort((a, b) => b.contadorPedidos - a.contadorPedidos)
      .slice(0, limit);
  }, [platos, limit]);
};
