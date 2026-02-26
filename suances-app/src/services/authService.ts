import { personalApi } from './api';
import { LoginRequest, LoginResponse } from '../types/auth';

export const authService = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    console.log('Login request to:', personalApi.defaults.baseURL);
    console.log('Login credentials:', credentials);
    const response = await personalApi.post<LoginResponse>('/auth/login', credentials);
    console.log('Login response:', response.data);
    return response.data;
  },

  logout: () => {
    return Promise.resolve();
  },
};
