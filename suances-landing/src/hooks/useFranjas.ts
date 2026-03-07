import { useState, useEffect } from 'react';
import type { FranjaResponse } from '../types';
import { reservaService } from '../services/reservaService';

export function useFranjas() {
  const [franjas, setFranjas] = useState<FranjaResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    reservaService
      .getFranjas()
      .then(setFranjas)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return { franjas, loading, error };
}
