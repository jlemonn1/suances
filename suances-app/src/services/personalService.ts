import { personalApi } from './api';
import {
  PersonnelResponse,
  CreatePersonnelRequest,
  UpdatePersonnelRequest,
  ChangeRoleRequest,
  RoleChangeResponse,
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
};
