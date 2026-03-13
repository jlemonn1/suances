import { create } from 'zustand';
import {
  AgendaFilters,
  BloqueoRequest,
  DisponibilidadResponse,
  FranjaHoraria,
  FranjaRequest,
  Mesa,
  MesaRequest,
  Reserva,
  ReservaRequest,
  ReservasMetrics,
  Sala,
  SalaRequest,
  WaitlistEntry,
  WaitlistEstado,
} from '../types/reservas';
import { reservasService, MesasOcupadasResponse } from '../services/reservasService';

interface LoadingState {
  salas: boolean;
  franjas: boolean;
  reservas: boolean;
  waitlist: boolean;
  disponibilidad: boolean;
  mesas: Record<string, boolean>;
}

interface ReservasState {
  salas: Sala[];
  mesasBySala: Record<string, Mesa[]>;
  mesasOcupadas: MesasOcupadasResponse | null;
  franjas: FranjaHoraria[];
  reservas: Reserva[];
  waitlist: WaitlistEntry[];
  disponibilidad: DisponibilidadResponse[];
  agendaFilters: AgendaFilters;
  loading: LoadingState;
  error?: string | null;
  fetchSalas: () => Promise<void>;
  saveSala: (payload: SalaRequest, salaId?: string) => Promise<Sala>;
  fetchMesas: (salaId: string) => Promise<void>;
  saveMesa: (salaId: string, payload: MesaRequest, mesaId?: string) => Promise<Mesa>;
  updateMesaPosition: (salaId: string, mesaId: string, pos: { posX: number; posY: number }) => Promise<void>;
  crearBloqueo: (mesaId: string, payload: BloqueoRequest) => Promise<string>;
  eliminarBloqueo: (mesaId: string, bloqueoId: string) => Promise<void>;
  fetchFranjas: () => Promise<void>;
  saveFranja: (payload: FranjaRequest, franjaId?: string) => Promise<FranjaHoraria>;
  deleteFranja: (franjaId: string) => Promise<void>;
  fetchReservas: (filters?: Partial<AgendaFilters>) => Promise<void>;
  createReserva: (payload: ReservaRequest) => Promise<Reserva>;
  updateReserva: (reservaId: string, payload: Partial<ReservaRequest>) => Promise<Reserva>;
  cancelReserva: (reservaId: string, motivo?: string) => Promise<Reserva>;
  fetchWaitlist: (fecha?: string, franjaId?: string) => Promise<void>;
  updateWaitlistEstado: (entryId: string, estado: WaitlistEstado) => Promise<void>;
  fetchDisponibilidad: (fecha: string) => Promise<void>;
  fetchMesasOcupadas: (fecha: string, franjaId: string) => Promise<void>;
  handleReservaCreated: (reserva: Reserva) => void;
  handleReservaCancelled: (reserva: Reserva) => void;
  handleReservaUpdated: (reserva: Reserva) => void;
  setAgendaFilters: (filters: Partial<AgendaFilters>) => void;
  getMetrics: () => ReservasMetrics;
}

const getToday = (): string => new Date().toISOString().split('T')[0];

export const useReservasStore = create<ReservasState>((set, get) => ({
  salas: [],
  mesasBySala: {},
  mesasOcupadas: null,
  franjas: [],
  reservas: [],
  waitlist: [],
  disponibilidad: [],
  agendaFilters: { fecha: getToday() },
  loading: {
    salas: false,
    franjas: false,
    reservas: false,
    waitlist: false,
    disponibilidad: false,
    mesas: {},
  },
  error: null,

  fetchSalas: async () => {
    set((state) => ({ loading: { ...state.loading, salas: true }, error: null }));
    try {
      const salas = await reservasService.getSalas();
      set((state) => ({ salas, loading: { ...state.loading, salas: false } }));
    } catch (error) {
      console.error('Error fetching salas', error);
      set((state) => ({ loading: { ...state.loading, salas: false }, error: 'No se pudieron cargar las salas' }));
    }
  },

  saveSala: async (payload, salaId) => {
    const sala = salaId
      ? await reservasService.updateSala(salaId, payload)
      : await reservasService.createSala(payload);

    set((state) => ({
      salas: salaId
        ? state.salas.map((s) => (s.id === sala.id ? sala : s))
        : [...state.salas, sala],
    }));
    return sala;
  },

  fetchMesas: async (salaId) => {
    set((state) => ({
      loading: { ...state.loading, mesas: { ...state.loading.mesas, [salaId]: true } },
    }));
    try {
      const mesas = await reservasService.getMesasBySala(salaId);
      set((state) => ({
        mesasBySala: { ...state.mesasBySala, [salaId]: mesas },
        loading: { ...state.loading, mesas: { ...state.loading.mesas, [salaId]: false } },
      }));
    } catch (error) {
      console.error('Error fetching mesas', error);
      set((state) => ({
        loading: { ...state.loading, mesas: { ...state.loading.mesas, [salaId]: false } },
        error: 'No se pudieron cargar las mesas',
      }));
    }
  },

  saveMesa: async (salaId, payload, mesaId) => {
    const mesa = mesaId
      ? await reservasService.updateMesa(mesaId, payload)
      : await reservasService.createMesa(salaId, payload);

    set((state) => {
      const current = state.mesasBySala[salaId] || [];
      const mesasActualizadas = mesaId
        ? current.map((m) => (m.id === mesa.id ? mesa : m))
        : [...current, mesa];
      return {
        mesasBySala: { ...state.mesasBySala, [salaId]: mesasActualizadas },
      };
    });
    return mesa;
  },

  updateMesaPosition: async (salaId, mesaId, pos) => {
    const state = get();
    const mesa = (state.mesasBySala[salaId] || []).find((m) => m.id === mesaId);
    if (!mesa) return;
    const payload: MesaRequest = {
      numero: mesa.numero,
      capacidad: mesa.capacidad,
      posX: Math.round(pos.posX),
      posY: Math.round(pos.posY),
      ancho: mesa.ancho ?? undefined,
      alto: mesa.alto ?? undefined,
      visibleOnline: mesa.visibleOnline,
      activa: mesa.activa,
    };
    const updated = await reservasService.updateMesa(mesaId, payload);
    set((current) => {
      const currentMesaList = current.mesasBySala[salaId] || [];
      return {
        mesasBySala: {
          ...current.mesasBySala,
          [salaId]: currentMesaList.map((m) => (m.id === mesaId ? updated : m)),
        },
      };
    });
  },

  crearBloqueo: async (mesaId, payload) => {
    return reservasService.crearBloqueo(mesaId, payload);
  },

  eliminarBloqueo: async (mesaId, bloqueoId) => {
    await reservasService.eliminarBloqueo(mesaId, bloqueoId);
  },

  fetchFranjas: async () => {
    set((state) => ({ loading: { ...state.loading, franjas: true } }));
    try {
      const franjas = await reservasService.getFranjas();
      set((state) => ({ franjas, loading: { ...state.loading, franjas: false } }));
    } catch (error) {
      console.error('Error fetching franjas', error);
      set((state) => ({ loading: { ...state.loading, franjas: false }, error: 'No se pudieron cargar las franjas' }));
    }
  },

  saveFranja: async (payload, franjaId) => {
    const franja = franjaId
      ? await reservasService.updateFranja(franjaId, payload)
      : await reservasService.createFranja(payload);

    set((state) => ({
      franjas: franjaId
        ? state.franjas.map((f) => (f.id === franja.id ? franja : f))
        : [...state.franjas, franja],
    }));
    return franja;
  },

  deleteFranja: async (franjaId) => {
    await reservasService.deleteFranja(franjaId);
    set((state) => ({ franjas: state.franjas.filter((f) => f.id !== franjaId) }));
  },

  fetchReservas: async (filters) => {
    const patch = filters ?? {};
    const currentFilters = { ...get().agendaFilters, ...patch };
    set({ agendaFilters: currentFilters });
    set((state) => ({ loading: { ...state.loading, reservas: true } }));
    try {
      const reservas = await reservasService.getReservas(currentFilters);
      set((state) => ({ reservas, loading: { ...state.loading, reservas: false } }));
    } catch (error) {
      console.error('Error fetching reservas', error);
      set((state) => ({ loading: { ...state.loading, reservas: false }, error: 'No se pudieron cargar las reservas' }));
    }
  },

  createReserva: async (payload) => {
    console.log('[FRONT] Creando reserva:', payload);
    const nueva = await reservasService.createReserva(payload);
    console.log('[FRONT] Reserva creada:', nueva.codigo);
    set((state) => ({ reservas: [nueva, ...state.reservas] }));
    return nueva;
  },

  updateReserva: async (reservaId, payload) => {
    console.log('[FRONT] Actualizando reserva:', reservaId, payload);
    const actualizada = await reservasService.updateReserva(reservaId, payload);
    console.log('[FRONT] Reserva actualizada:', actualizada.codigo);
    set((state) => ({
      reservas: state.reservas.map((r) => (r.id === reservaId ? actualizada : r)),
    }));
    return actualizada;
  },

  cancelReserva: async (reservaId, motivo) => {
    console.log('[FRONT] Cancelando reserva:', reservaId, 'motivo:', motivo);
    const updated = await reservasService.cancelReserva(reservaId, motivo);
    console.log('[FRONT] Reserva cancelada:', updated.codigo);
    set((state) => ({
      reservas: state.reservas.map((r) => (r.id === reservaId ? updated : r)),
    }));
    return updated;
  },

  fetchWaitlist: async (fecha, franjaId) => {
    const filters = get().agendaFilters;
    const resolvedFecha = fecha ?? filters.fecha;
    const resolvedFranja = franjaId ?? filters.franjaId;
    if (!resolvedFecha || !resolvedFranja) {
      set({ waitlist: [] });
      return;
    }

    set((state) => ({ loading: { ...state.loading, waitlist: true } }));
    try {
      const entries = await reservasService.getWaitlist(resolvedFecha, resolvedFranja);
      set((state) => ({ waitlist: entries, loading: { ...state.loading, waitlist: false } }));
    } catch (error) {
      console.error('Error fetching waitlist', error);
      set((state) => ({ loading: { ...state.loading, waitlist: false }, error: 'No se pudo cargar la lista de espera' }));
    }
  },

  updateWaitlistEstado: async (entryId, estado) => {
    const actualizado = await reservasService.actualizarWaitlistEstado(entryId, estado);
    set((state) => ({
      waitlist: state.waitlist.map((entry) => (entry.id === entryId ? actualizado : entry)),
    }));
  },

  fetchDisponibilidad: async (fecha) => {
    set((state) => ({ loading: { ...state.loading, disponibilidad: true } }));
    try {
      const disponibilidad = await reservasService.consultarDisponibilidad(fecha);
      set((state) => ({ disponibilidad, loading: { ...state.loading, disponibilidad: false } }));
    } catch (error) {
      console.error('Error fetching disponibilidad', error);
      set((state) => ({ loading: { ...state.loading, disponibilidad: false }, error: 'No se pudo cargar la disponibilidad' }));
    }
  },

  fetchMesasOcupadas: async (fecha, franjaId) => {
    try {
      const mesasOcupadas = await reservasService.getMesasOcupadas(fecha, franjaId);
      set({ mesasOcupadas });
    } catch (error) {
      console.error('Error fetching mesas ocupadas', error);
      set({ mesasOcupadas: null });
    }
  },

  handleReservaCreated: (reserva) => {
    set((state) => {
      const exists = state.reservas.some((r) => r.id === reserva.id);
      if (exists) return state;
      return { reservas: [reserva, ...state.reservas] };
    });
  },

  handleReservaCancelled: (reserva) => {
    set((state) => ({
      reservas: state.reservas.map((r) => (r.id === reserva.id ? reserva : r)),
    }));
  },

  handleReservaUpdated: (reserva) => {
    set((state) => ({
      reservas: state.reservas.map((r) => (r.id === reserva.id ? reserva : r)),
    }));
  },

  setAgendaFilters: (filters) => {
    set((state) => ({ agendaFilters: { ...state.agendaFilters, ...filters } }));
  },

  getMetrics: () => {
    const { reservas, waitlist, mesasBySala, agendaFilters } = get();
    const reservasFiltradas = agendaFilters.fecha 
      ? reservas.filter((r) => r.fecha === agendaFilters.fecha)
      : reservas;
    const reservasTotales = reservasFiltradas.length;
    const reservasConfirmadas = reservasFiltradas.filter((r) => r.estado === 'CONFIRMADA').length;
    const reservasPendientes = reservasFiltradas.filter((r) => r.estado === 'PENDIENTE').length;
    const reservasCanceladas = reservasFiltradas.filter((r) => r.estado === 'CANCELADA').length;
    const waitlistSize = waitlist.length;
    const mesasBloqueadas = Object.values(mesasBySala).reduce(
      (acc, mesas) => acc + mesas.filter((m) => m.estado === 'BLOQUEADA').length,
      0
    );

    const metrics: ReservasMetrics = {
      reservasTotales,
      reservasConfirmadas,
      reservasPendientes,
      reservasCanceladas,
      waitlistSize,
      mesasBloqueadas,
    };
    return metrics;
  },
}));
