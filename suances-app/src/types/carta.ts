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

// Tipos para carta operativa desde sala-service
export interface PlatoOperativo {
  platoId: string;
  nombre: string;
  descripcion: string | null;
  precioVenta: number;
  categoriaId: string | null;
  categoriaNombre: string | null;
  stockDisponible: number | null;
  disponible: boolean;
  stockBajo: boolean;
  imagenUrl: string | null;
  ingredientes: string[];
  ingredientesBajos?: IngredienteBajo[];
}

export interface IngredienteBajo {
  ingredienteId: string;
  nombre: string;
  stockActual: number;
  umbralAlerta: number;
  unidadMedida: string;
}

export interface TipoCartaOperativo {
  tipoCartaId: string;
  nombre: string;
  horaInicio: string;
  horaFin: string;
  activo: boolean;
  platos: PlatoOperativo[];
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
