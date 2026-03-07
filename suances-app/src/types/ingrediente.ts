import { UnidadMedida } from './plato';

export type CategoriaTipo = 'INGREDIENTE' | 'PLATO';

export interface Categoria {
  id: string;
  nombre: string;
  tipo: CategoriaTipo;
  activo: boolean;
  createdAt: string;
}

export interface CategoriaRequest {
  nombre: string;
  tipo?: CategoriaTipo;
}

export interface CategoriaResponse {
  id: string;
  nombre: string;
  tipo: CategoriaTipo;
  activo: boolean;
  createdAt: string;
}

export interface Ingrediente {
  id: string;
  nombre: string;
  unidadMedida: UnidadMedida;
  precioPorUnidad: number;
  stockActual: number;
  umbralAlerta: number;
  activo: boolean;
  createdAt: string;
  categoria?: CategoriaResponse;
}

export interface IngredienteRequest {
  nombre: string;
  unidadMedida: UnidadMedida;
  precioPorUnidad: number;
  stockActual?: number;
  umbralAlerta: number;
  categoriaId?: string;
}

export interface IngredienteResponse {
  id: string;
  nombre: string;
  unidadMedida: UnidadMedida;
  precioPorUnidad: number;
  stockActual: number;
  umbralAlerta: number;
  alertaEnviada: boolean;
  activo: boolean;
  createdAt: string;
  categoria?: CategoriaResponse;
}

export interface Distribuidor {
  id: string;
  nombre: string;
  telefono: string | null;
  email: string | null;
  activo: boolean;
}

export interface DistribuidorRequest {
  nombre: string;
  telefono?: string;
  email?: string;
}

export interface DistribuidorResponse {
  id: string;
  nombre: string;
  telefono: string | null;
  email: string | null;
  activo: boolean;
}
