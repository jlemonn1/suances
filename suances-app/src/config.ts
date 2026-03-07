import { Platform } from 'react-native';

type ServiceKey = 'PERSONAL' | 'CARTA' | 'RESERVAS';

const SERVICE_CONTEXT: Record<ServiceKey, string> = {
  PERSONAL: '/api/personal',
  CARTA: '/api/carta',
  RESERVAS: '/api/reservas',
};

const SERVICE_PORT: Record<ServiceKey, number> = {
  PERSONAL: 8085,
  CARTA: 8081,
  RESERVAS: 8087,
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

const DEFAULT_DEVICE_IP = readEnvVar('DEV_DEVICE_IP') ?? '172.20.10.3';

const isMobileRuntime = Platform.OS === 'ios' || Platform.OS === 'android';

const sanitizeUrl = (value: string): string => value.replace(/\/+$/, '');

const getLocalHost = (port: number): string => {
  if (isMobileRuntime) {
    return `http://172.20.10.3:${port}`;
  }
  return `http://172.20.10.3:${port}`;
};

const resolveBaseUrl = (service: ServiceKey): string => {
  const envValue = readEnvVar(`${service}_API_URL`);
  if (envValue && envValue.trim().length > 0) {
    return sanitizeUrl(envValue.trim());
  }

  const fallback = `${getLocalHost(SERVICE_PORT[service])}${SERVICE_CONTEXT[service]}`;
  return sanitizeUrl(fallback);
};

export const API_CONFIG = {
  PERSONAL_BASE_URL: resolveBaseUrl('PERSONAL'),
  CARTA_BASE_URL: resolveBaseUrl('CARTA'),
  RESERVAS_BASE_URL: resolveBaseUrl('RESERVAS'),
  TIMEOUT: 10000,
};
