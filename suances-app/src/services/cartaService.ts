import { cartaApi } from './api';
import {
  PlatoResponse,
  PlatoRequest,
  PlatoImagen,
} from '../types/plato';
import {
  IngredienteResponse,
  IngredienteRequest,
  DistribuidorResponse,
  DistribuidorRequest,
  CategoriaResponse,
  CategoriaRequest,
  CategoriaTipo,
} from '../types/ingrediente';
import {
  TipoCartaResponse,
  TipoCartaRequest,
  Escandallo,
  EscandalloRequest,
} from '../types/carta';

export const cartaService = {
  // Tipos de Carta
  getTiposCarta: async (): Promise<TipoCartaResponse[]> => {
    const response = await cartaApi.get<TipoCartaResponse[]>('/tipos-carta');
    return response.data;
  },

  getTipoCarta: async (id: string): Promise<TipoCartaResponse> => {
    const response = await cartaApi.get<TipoCartaResponse>(`/tipos-carta/${id}`);
    return response.data;
  },

  crearTipoCarta: async (data: TipoCartaRequest): Promise<TipoCartaResponse> => {
    const response = await cartaApi.post<TipoCartaResponse>('/tipos-carta', data);
    return response.data;
  },

  actualizarTipoCarta: async (id: string, data: TipoCartaRequest): Promise<TipoCartaResponse> => {
    const response = await cartaApi.put<TipoCartaResponse>(`/tipos-carta/${id}`, data);
    return response.data;
  },

  eliminarTipoCarta: async (id: string): Promise<void> => {
    await cartaApi.delete(`/tipos-carta/${id}`);
  },

  asociarPlatosATipoCarta: async (tipoCartaId: string, platoIds: string[]): Promise<TipoCartaResponse> => {
    const response = await cartaApi.post<TipoCartaResponse>(`/tipos-carta/${tipoCartaId}/platos`, { platoIds });
    return response.data;
  },

  getCartaActiva: async (): Promise<TipoCartaResponse> => {
    const response = await cartaApi.get<TipoCartaResponse>('/tipos-carta/carta/activa');
    return response.data;
  },

  // Platos
  getPlatos: async (activo: boolean = true): Promise<PlatoResponse[]> => {
    const response = await cartaApi.get<PlatoResponse[]>('/platos', {
      params: { activo },
    });
    return response.data;
  },

  getPlato: async (id: string): Promise<PlatoResponse> => {
    const response = await cartaApi.get<PlatoResponse>(`/platos/${id}`);
    return response.data;
  },

  crearPlato: async (data: PlatoRequest): Promise<PlatoResponse> => {
    const response = await cartaApi.post<PlatoResponse>('/platos', data);
    return response.data;
  },

  actualizarPlato: async (id: string, data: PlatoRequest): Promise<PlatoResponse> => {
    const response = await cartaApi.put<PlatoResponse>(`/platos/${id}`, data);
    return response.data;
  },

  eliminarPlato: async (id: string): Promise<void> => {
    await cartaApi.delete(`/platos/${id}`);
  },

  agregarImagen: async (platoId: string, url: string): Promise<PlatoResponse> => {
    const response = await cartaApi.post<PlatoResponse>(`/platos/${platoId}/imagenes`, { url });
    return response.data;
  },

  eliminarImagen: async (platoId: string, imgId: string): Promise<void> => {
    await cartaApi.delete(`/platos/${platoId}/imagenes/${imgId}`);
  },

  // Ingredientes
  getIngredientes: async (activo: boolean = true): Promise<IngredienteResponse[]> => {
    const response = await cartaApi.get<IngredienteResponse[]>('/ingredientes', {
      params: { activo },
    });
    return response.data;
  },

  getIngrediente: async (id: string): Promise<IngredienteResponse> => {
    const response = await cartaApi.get<IngredienteResponse>(`/ingredientes/${id}`);
    return response.data;
  },

  crearIngrediente: async (data: IngredienteRequest): Promise<IngredienteResponse> => {
    const response = await cartaApi.post<IngredienteResponse>('/ingredientes', data);
    return response.data;
  },

  actualizarIngrediente: async (id: string, data: IngredienteRequest): Promise<IngredienteResponse> => {
    const response = await cartaApi.put<IngredienteResponse>(`/ingredientes/${id}`, data);
    return response.data;
  },

  eliminarIngrediente: async (id: string): Promise<void> => {
    await cartaApi.delete(`/ingredientes/${id}`);
  },

  getCategorias: async (activo: boolean = true, tipo?: CategoriaTipo): Promise<CategoriaResponse[]> => {
    const response = await cartaApi.get<CategoriaResponse[]>('/categorias', {
      params: { activo, tipo },
    });
    return response.data;
  },

  getCategoria: async (id: string): Promise<CategoriaResponse> => {
    const response = await cartaApi.get<CategoriaResponse>(`/categorias/${id}`);
    return response.data;
  },

  crearCategoria: async (data: CategoriaRequest): Promise<CategoriaResponse> => {
    const response = await cartaApi.post<CategoriaResponse>('/categorias', data);
    return response.data;
  },

  actualizarCategoria: async (id: string, data: CategoriaRequest): Promise<CategoriaResponse> => {
    const response = await cartaApi.put<CategoriaResponse>(`/categorias/${id}`, data);
    return response.data;
  },

  eliminarCategoria: async (id: string): Promise<void> => {
    await cartaApi.delete(`/categorias/${id}`);
  },

  asociarDistribuidor: async (ingredienteId: string, distribuidorId: string): Promise<void> => {
    await cartaApi.post(`/ingredientes/${ingredienteId}/distribuidores/${distribuidorId}`);
  },

  desasociarDistribuidor: async (ingredienteId: string, distribuidorId: string): Promise<void> => {
    await cartaApi.delete(`/ingredientes/${ingredienteId}/distribuidores/${distribuidorId}`);
  },

  // Distribuidores
  getDistribuidores: async (activo: boolean = true): Promise<DistribuidorResponse[]> => {
    const response = await cartaApi.get<DistribuidorResponse[]>('/distribuidores', {
      params: { activo },
    });
    return response.data;
  },

  getDistribuidor: async (id: string): Promise<DistribuidorResponse> => {
    const response = await cartaApi.get<DistribuidorResponse>(`/distribuidores/${id}`);
    return response.data;
  },

  crearDistribuidor: async (data: DistribuidorRequest): Promise<DistribuidorResponse> => {
    const response = await cartaApi.post<DistribuidorResponse>('/distribuidores', data);
    return response.data;
  },

  actualizarDistribuidor: async (id: string, data: DistribuidorRequest): Promise<DistribuidorResponse> => {
    const response = await cartaApi.put<DistribuidorResponse>(`/distribuidores/${id}`, data);
    return response.data;
  },

  eliminarDistribuidor: async (id: string): Promise<void> => {
    await cartaApi.delete(`/distribuidores/${id}`);
  },

  // Escandallos
  getEscandallo: async (platoId: string): Promise<Escandallo> => {
    const response = await cartaApi.get<Escandallo>(`/platos/${platoId}/escandallo`);
    return response.data;
  },

  crearOActualizarEscandallo: async (platoId: string, data: EscandalloRequest): Promise<Escandallo> => {
    const response = await cartaApi.post<Escandallo>(`/platos/${platoId}/escandallo`, data);
    return response.data;
  },

  eliminarEscandallo: async (platoId: string): Promise<void> => {
    await cartaApi.delete(`/platos/${platoId}/escandallo`);
  },
};
