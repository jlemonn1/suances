import { Platform } from 'react-native';

const MAC_IP = '172.20.10.2';

const getBaseUrl = (port: number) => {
  if (Platform.OS === 'ios' || Platform.OS === 'android') {
    return `http://${MAC_IP}:${port}`;
  }
  return `http://localhost:${port}`;
};

export const API_CONFIG = {
  PERSONAL_BASE_URL: getBaseUrl(8085),
  CARTA_BASE_URL: getBaseUrl(8081),
  RESERVAS_BASE_URL: `${getBaseUrl(8087)}/api/reservas`,
  TIMEOUT: 10000,
};
