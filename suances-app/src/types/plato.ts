import { CategoriaResponse } from './ingrediente';

export type UnidadMedida = 'GRAMO' | 'ML' | 'UNIDAD';

export interface Plato {
  id: string;
  nombre: string;
  descripcion: string | null;
  precioVenta: number;
  costeTotal: number | null;
  margen: number | null;
  contadorPedidos: number;
  activo: boolean;
  createdAt: string;
  imagenes: PlatoImagen[];
  categoria?: CategoriaResponse;
}

export interface PlatoImagen {
  id: string;
  url: string;
  orden: number | null;
}

export interface PlatoRequest {
  nombre: string;
  descripcion?: string;
  precioVenta: number;
  categoriaId?: string;
}

export interface PlatoResponse {
  id: string;
  nombre: string;
  descripcion: string | null;
  precioVenta: number;
  costeTotal: number | null;
  margen: number | null;
  contadorPedidos: number;
  activo: boolean;
  disponible?: boolean;
  stockDisponible?: number | null;
  stockBajo?: boolean;
  createdAt: string;
  imagenes: PlatoImagen[];
  categoria?: CategoriaResponse;
}
