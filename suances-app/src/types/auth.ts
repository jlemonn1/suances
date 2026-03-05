export type Rol = 'OWNER' | 'MANAGER' | 'WAITER' | 'CUSTOMER';

export interface User {
  id: string;
  nombre: string;
  rol: Rol;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  userInfo: {
    id: string;
    fullName: string;
    role: Rol;
    imageUrl?: string;
  };
}
