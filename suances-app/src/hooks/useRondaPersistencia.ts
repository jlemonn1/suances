import AsyncStorage from '@react-native-async-storage/async-storage';
import type { PlatoRondaItem } from '../types/sala';

const STORAGE_KEY = (comandaId: string) => `ronda_pendiente_${comandaId}`;

export const useRondaPersistencia = () => {
  const guardar = async (comandaId: string, platos: PlatoRondaItem[]) => {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEY(comandaId),
        JSON.stringify(platos)
      );
      console.log(`[useRondaPersistencia] Guardados ${platos.length} platos para comanda ${comandaId}`);
    } catch (e) {
      console.error('[useRondaPersistencia] Error guardando ronda:', e);
    }
  };

  const cargar = async (comandaId: string): Promise<PlatoRondaItem[] | null> => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY(comandaId));
      if (data) {
        const platos = JSON.parse(data);
        console.log(`[useRondaPersistencia] Cargados ${platos.length} platos para comanda ${comandaId}`);
        return platos;
      }
      return null;
    } catch (e) {
      console.error('[useRondaPersistencia] Error cargando ronda:', e);
      return null;
    }
  };

  const limpiar = async (comandaId: string) => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY(comandaId));
      console.log(`[useRondaPersistencia] Limpiada ronda para comanda ${comandaId}`);
    } catch (e) {
      console.error('[useRondaPersistencia] Error limpiando ronda:', e);
    }
  };

  return { guardar, cargar, limpiar };
};
