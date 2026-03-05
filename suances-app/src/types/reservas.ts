export type FranjaTipo = 'COMIDA' | 'CENA' | 'ESPECIAL';

export interface FranjaHoraria {
  id: string;
  nombre: string;
  tipo: FranjaTipo;
  horaInicio: string;
  horaFin: string;
  activa: boolean;
}

export interface FranjaRequest {
  nombre: string;
  tipo: FranjaTipo;
  horaInicio: string;
  horaFin: string;
  activa?: boolean;
}

export type MesaEstado = 'LIBRE' | 'OCUPADA' | 'BLOQUEADA';

export interface Mesa {
  id: string;
  salaId: string;
  numero: number;
  capacidad: number;
  posX?: number | null;
  posY?: number | null;
  ancho?: number | null;
  alto?: number | null;
  visibleOnline: boolean;
  estado: MesaEstado;
  activa: boolean;
}

export interface MesaRequest {
  numero: number;
  capacidad: number;
  posX?: number | null;
  posY?: number | null;
  ancho?: number | null;
  alto?: number | null;
  visibleOnline?: boolean;
  activa?: boolean;
}

export interface SalaLayout {
  ancho: number;
  alto: number;
  vertices: number[][];
}

export interface Sala {
  id: string;
  nombre: string;
  capacidadMaxima?: number | null;
  layoutJson?: string | null;
  activa: boolean;
}

export interface SalaRequest {
  nombre: string;
  capacidadMaxima?: number | null;
  layoutJson?: string | null;
  activa?: boolean;
}

export type ReservaEstado = 'PENDIENTE' | 'CONFIRMADA' | 'CANCELADA' | 'NO_SHOW' | 'FINALIZADA';
export type ReservaOrigen = 'ONLINE' | 'MANUAL' | 'WALKIN';

export interface Reserva {
  id: string;
  codigo: string;
  mesaId: string;
  franjaId: string;
  fecha: string;
  comensales: number;
  estado: ReservaEstado;
  origen: ReservaOrigen;
  nombreCliente: string;
  telefono: string;
  email?: string | null;
}

export interface ReservaRequest {
  mesaId: string;
  franjaId: string;
  fecha: string;
  comensales: number;
  nombreCliente: string;
  telefono: string;
  email?: string;
  notas?: string;
  force?: boolean;
}

export interface UpdateReservaRequest extends Partial<ReservaRequest> {}

export type BloqueoTipo = 'ONLINE' | 'TOTAL' | 'EVENTO' | 'MANTENIMIENTO' | 'EVENTO_AUTO';

export interface Bloqueo {
  id: string;
  mesaId: string;
  tipo: BloqueoTipo;
  fechaDesde: string;
  fechaHasta: string;
  motivo?: string;
}

export interface BloqueoRequest {
  tipo: BloqueoTipo;
  fechaDesde: string;
  fechaHasta: string;
  motivo?: string;
}

export type WaitlistEstado = 'WAITING' | 'NOTIFIED' | 'CONFIRMED' | 'CANCELLED';

export interface WaitlistEntry {
  id: string;
  fecha: string;
  franjaId: string;
  comensales: number;
  nombreCliente: string;
  telefono: string;
  prioridad: number;
  estado: WaitlistEstado;
}

export interface WaitlistRequest {
  fecha: string;
  franjaId: string;
}

export interface DisponibilidadResponse {
  fecha: string;
  franjaId: string;
  mesasDisponibles: number;
  capacidadTotal: number;
}

export interface AgendaFilters {
  fecha: string;
  franjaId?: string;
  estado?: ReservaEstado;
}

export interface ReservasMetrics {
  reservasTotales: number;
  reservasConfirmadas: number;
  reservasPendientes: number;
  reservasCanceladas: number;
  waitlistSize: number;
  mesasBloqueadas: number;
}
