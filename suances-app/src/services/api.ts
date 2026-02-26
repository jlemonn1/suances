import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { API_CONFIG } from '../config';

export const personalApi: AxiosInstance = axios.create({
  baseURL: API_CONFIG.PERSONAL_BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: { 'Content-Type': 'application/json' },
});

export const cartaApi: AxiosInstance = axios.create({
  baseURL: API_CONFIG.CARTA_BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: { 'Content-Type': 'application/json' },
});

let authToken: string | null = null;

export const setAuthToken = (token: string | null) => {
  authToken = token;
  if (token) {
    personalApi.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    cartaApi.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    console.log('API token set:', token.substring(0, 20) + '...');
  } else {
    delete personalApi.defaults.headers.common['Authorization'];
    delete cartaApi.defaults.headers.common['Authorization'];
    console.log('API token cleared');
  }
};

personalApi.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (authToken && config.headers) {
    config.headers.Authorization = `Bearer ${authToken}`;
  }
  return config;
});

cartaApi.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (authToken && config.headers) {
    config.headers.Authorization = `Bearer ${authToken}`;
  }
  return config;
});
