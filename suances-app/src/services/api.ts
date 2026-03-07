import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { API_CONFIG } from '../config';

const JSON_HEADERS = { 'Content-Type': 'application/json' };

const createApiClient = (baseURL: string): AxiosInstance =>
  axios.create({
    baseURL,
    timeout: API_CONFIG.TIMEOUT,
    headers: JSON_HEADERS,
  });

export const personalApi = createApiClient(API_CONFIG.PERSONAL_BASE_URL);
export const cartaApi = createApiClient(API_CONFIG.CARTA_BASE_URL);
export const reservasApi = createApiClient(API_CONFIG.RESERVAS_BASE_URL);

const apiClients: AxiosInstance[] = [personalApi, cartaApi, reservasApi];

let authToken: string | null = null;

export const setAuthToken = (token: string | null) => {
  authToken = token;
  apiClients.forEach((client) => {
    if (token) {
      client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete client.defaults.headers.common['Authorization'];
    }
  });
};

const attachRequestInterceptor = (client: AxiosInstance) => {
  client.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    if (authToken && config.headers) {
      config.headers['Authorization'] = `Bearer ${authToken}`;
    }
    return config;
  });
};

const attachResponseInterceptor = (client: AxiosInstance) => {
  client.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
      if (error.response?.status === 401) {
        console.warn('Sesión expirada o token inválido. Por favor, inicia sesión de nuevo.');
      }
      return Promise.reject(error);
    }
  );
};

apiClients.forEach((client) => {
  attachRequestInterceptor(client);
  attachResponseInterceptor(client);
});
