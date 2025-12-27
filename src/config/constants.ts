/**
 * Archivo de configuración centralizado
 * Aquí defines URLs de ambiente, constantes, etc.
 */

// URLs de la API según el ambiente
export const API_URLS = {
  development: 'http://localhost:3000/api',
  staging: 'https://api-staging.example.com/api',
  production: 'https://api.example.com/api',
};

// Obtener URL basada en el ambiente
const CURRENT_ENV = process.env.EXPO_PUBLIC_ENV || 'development';
export const API_BASE_URL = API_URLS[CURRENT_ENV as keyof typeof API_URLS] || API_URLS.development;

// Timeouts
export const API_TIMEOUT = 10000; // 10 segundos

// Claves de AsyncStorage
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  USER: 'user',
  REFRESH_TOKEN: 'refresh_token',
};

// Estados de la aplicación
export const APP_STATES = {
  LOADING: 'loading',
  AUTHENTICATED: 'authenticated',
  UNAUTHENTICATED: 'unauthenticated',
};
