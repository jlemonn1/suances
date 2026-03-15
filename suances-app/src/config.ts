import { Platform } from 'react-native';
import Constants from 'expo-constants';

type ServiceKey = 'PERSONAL' | 'CARTA' | 'RESERVAS' | 'SALA';

const SERVICE_CONTEXT: Record<ServiceKey, string> = {
  PERSONAL: '/api/personal',
  CARTA: '/api/carta',
  RESERVAS: '/api/reservas',
  SALA: '/api/sala',
};

const SERVICE_PORT: Record<ServiceKey, number> = {
  PERSONAL: 8085,
  CARTA: 8081,
  RESERVAS: 8087,
  SALA: 8083,
};

const readEnvVar = (key: string): string | undefined => {
  const env = globalThis?.process?.env;
  if (!env) {
    return undefined;
  }
  const expoScoped = env[`EXPO_PUBLIC_${key}`];
  if (expoScoped) {
    return expoScoped;
  }
  return env[key];
};

const DEFAULT_LOCAL_IP = '172.20.10.7';

const getDeviceIP = (): string => {
  const envIP = readEnvVar('API_IP');
  if (envIP && envIP.trim().length > 0) {
    return envIP.trim();
  }
  
  const expoConfigIP = (Constants.manifest?.extra ?? Constants.extra)?.API_IP as string | undefined;
  if (expoConfigIP) {
    return expoConfigIP;
  }
  
  if (Platform.OS === 'web') {
    const hostname = window.location.hostname;
    if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
      return hostname;
    }
  }
  
  return DEFAULT_LOCAL_IP;
};

const isMobileRuntime = Platform.OS === 'ios' || Platform.OS === 'android';

const sanitizeUrl = (value: string): string => value.replace(/\/+$/, '');

const getBaseUrl = (port: number): string => {
  const ip = getDeviceIP();
  if (isMobileRuntime) {
    return `http://${ip}:${port}`;
  }
  return `http://${ip}:${port}`;
};

const resolveBaseUrl = (service: ServiceKey): string => {
  const envValue = readEnvVar(`${service}_API_URL`);
  if (envValue && envValue.trim().length > 0) {
    return sanitizeUrl(envValue.trim());
  }

  const fallback = `${getBaseUrl(SERVICE_PORT[service])}${SERVICE_CONTEXT[service]}`;
  return sanitizeUrl(fallback);
};

export const API_CONFIG = {
  API_IP: getDeviceIP(),
  PERSONAL_BASE_URL: resolveBaseUrl('PERSONAL'),
  CARTA_BASE_URL: resolveBaseUrl('CARTA'),
  RESERVAS_BASE_URL: resolveBaseUrl('RESERVAS'),
  SALA_BASE_URL: resolveBaseUrl('SALA'),
  TIMEOUT: 10000,
};
