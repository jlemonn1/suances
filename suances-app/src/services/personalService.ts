import { personalApi } from './api';
import {
  PersonnelResponse,
  CreatePersonnelRequest,
  UpdatePersonnelRequest,
  ChangeRoleRequest,
  RoleChangeResponse,
  AnotacionPersonal,
  CreateAnotacionRequest,
  ToggleModoEspiaRequest,
} from '../types/personal';

export const personalService = {
  getAllPersonnel: async (): Promise<PersonnelResponse[]> => {
    const response = await personalApi.get<PersonnelResponse[]>('/personnel');
    return response.data;
  },

  getPersonnelById: async (id: string): Promise<PersonnelResponse> => {
    const response = await personalApi.get<PersonnelResponse>(`/personnel/${id}`);
    return response.data;
  },

  createPersonnel: async (data: CreatePersonnelRequest): Promise<PersonnelResponse> => {
    const response = await personalApi.post<PersonnelResponse>('/personnel', data);
    return response.data;
  },

  updatePersonnel: async (id: string, data: UpdatePersonnelRequest): Promise<PersonnelResponse> => {
    const response = await personalApi.put<PersonnelResponse>(`/personnel/${id}`, data);
    return response.data;
  },

  changeRole: async (id: string, data: ChangeRoleRequest): Promise<RoleChangeResponse> => {
    const response = await personalApi.patch<RoleChangeResponse>(`/personnel/${id}/role`, data);
    return response.data;
  },

  deactivatePersonnel: async (id: string): Promise<void> => {
    await personalApi.delete(`/personnel/${id}`);
  },

  toggleModoEspia: async (id: string, activo: boolean): Promise<PersonnelResponse> => {
    const response = await personalApi.patch<PersonnelResponse>(`/personnel/${id}/modo-espia`, { activo });
    return response.data;
  },

  registrarAnotacion: async (data: CreateAnotacionRequest): Promise<AnotacionPersonal> => {
    const response = await personalApi.post<AnotacionPersonal>('/personnel/anotaciones', data);
    return response.data;
  },

  getAnotacionesByUsuario: async (usuarioId: string): Promise<AnotacionPersonal[]> => {
    const response = await personalApi.get<AnotacionPersonal[]>(`/personnel/${usuarioId}/anotaciones`);
    return response.data;
  },

  getAllAnotaciones: async (): Promise<AnotacionPersonal[]> => {
    const response = await personalApi.get<AnotacionPersonal[]>('/personnel/anotaciones');
    return response.data;
  },
};
