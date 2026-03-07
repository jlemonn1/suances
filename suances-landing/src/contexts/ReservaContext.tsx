import { createContext, useContext, type ReactNode } from 'react';
import type { FranjaResponse, DisponibilidadResponse, ReservaResponse } from '../types';

interface ReservaContextType {
  franjas: FranjaResponse[];
  disponibilidad: DisponibilidadResponse[];
  reservaActual: ReservaResponse | null;
  loading: boolean;
  error: string | null;
}

const ReservaContext = createContext<ReservaContextType | null>(null);

export function ReservaProvider({ children }: { children: ReactNode }) {
  return (
    <ReservaContext.Provider
      value={{
        franjas: [],
        disponibilidad: [],
        reservaActual: null,
        loading: false,
        error: null,
      }}
    >
      {children}
    </ReservaContext.Provider>
  );
}

export function useReservaContext() {
  const context = useContext(ReservaContext);
  if (!context) {
    throw new Error('useReservaContext must be used within ReservaProvider');
  }
  return context;
}
