import { Rol } from './auth';

export interface PersonnelResponse {
  id: string;
  username: string;
  fullName: string;
  role: Rol;
  imageUrl?: string;
  activo: boolean;
  modoEspia?: boolean;
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

export type TipoAccionAnotacion = 'EDITAR_COMANDA' | 'CANCELAR_COMANDA' | 'ELIMINAR_ITEMS';

export interface AnotacionPersonal {
  id: string;
  usuarioId: string;
  usuarioNombre: string;
  tipoAccion: TipoAccionAnotacion;
  comandaId: string;
  mesaNumero?: number;
  reservaId?: string;
  detalle?: string;
  exitoso: boolean;
  createdAt: string;
}

export interface CreateAnotacionRequest {
  usuarioId: string;
  tipoAccion: TipoAccionAnotacion;
  comandaId: string;
  mesaNumero?: number;
  reservaId?: string;
  detalle?: string;
  exitoso?: boolean;
}

export interface ToggleModoEspiaRequest {
  activo: boolean;
}
