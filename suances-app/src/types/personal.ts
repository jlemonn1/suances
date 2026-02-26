import { Rol } from './auth';

export interface PersonnelResponse {
  id: string;
  username: string;
  fullName: string;
  role: Rol;
  imageUrl?: string;
  activo: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface CreatePersonnelRequest {
  username: string;
  password: string;
  fullName: string;
  role: Rol;
  imageUrl?: string;
}

export interface UpdatePersonnelRequest {
  fullName?: string;
  password?: string;
  imageUrl?: string;
}

export interface ChangeRoleRequest {
  role: Rol;
}

export interface RoleChangeResponse {
  id: string;
  username: string;
  role: Rol;
}
