export interface TipoCarta {
  id: string;
  nombre: string;
  horaInicio: string;
  horaFin: string;
  activo: boolean;
  createdAt: string;
  platos: PlatoInfo[];
}

export interface PlatoInfo {
  id: string;
  nombre: string;
}

export interface TipoCartaRequest {
  nombre: string;
  horaInicio: string;
  horaFin: string;
}

export interface TipoCartaResponse {
  id: string;
  nombre: string;
  horaInicio: string;
  horaFin: string;
  activo: boolean;
  createdAt: string;
  platos: PlatoInfo[];
}

export interface Escandallo {
  platoId: string;
  nombreVersion: string;
  costeTotal: number;
  createdAt: string;
  updatedAt: string;
  ingredientes: EscandalloDetalle[];
}

export interface EscandalloDetalle {
  ingredienteId: string;
  nombre: string;
  cantidad: number;
  coste: number;
}

export interface EscandalloRequest {
  nombreVersion: string;
  ingredientes: {
    ingredienteId: string;
    cantidad: number;
  }[];
}
