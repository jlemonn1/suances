export interface FranjaResponse {
  id: string;
  nombre: string;
  tipo: string;
  horaInicio: string;
  horaFin: string;
  activa: boolean;
}

export interface DisponibilidadResponse {
  fecha: string;
  franjaId: string;
  mesasDisponibles: number;
  capacidadTotal: number;
}

export interface ReservaPublicaRequest {
  fecha: string;
  franjaId: string;
  comensales: number;
  nombre: string;
  telefono: string;
}

export interface ReservaResponse {
  id: string;
  codigo: string;
  mesaId: string;
  franjaId: string;
  fecha: string;
  comensales: number;
  estado: string;
  origen: string;
  nombreCliente: string;
  telefono: string;
  email?: string;
}
