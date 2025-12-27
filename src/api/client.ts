import axios, {
  AxiosInstance,
  AxiosError,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ApiError } from '../types';

// URL de API desde variable de entorno EXPO_PUBLIC_API_URL
// Fallback a localhost si no está definida
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

console.log('🔧 API_BASE_URL:', API_BASE_URL);

class ApiClient {
  private static instance: AxiosInstance;

  static getInstance(): AxiosInstance {
    if (!ApiClient.instance) {
      ApiClient.instance = axios.create({
        baseURL: API_BASE_URL,
        timeout: 15000,  // Aumentar timeout a 15 segundos
        headers: {
          'Content-Type': 'application/json',
        },
      });

      /**
       * INTERCEPTOR DE REQUEST
       * Lee el token de AsyncStorage con clave 'userToken'
       * Agrega header: Authorization: Bearer {token}
       */
      ApiClient.instance.interceptors.request.use(
        async (config: InternalAxiosRequestConfig) => {
          try {
            // Clave específica: 'userToken'
            const token = await AsyncStorage.getItem('userToken');
            if (token) {
              // Formato Bearer según especificación
              config.headers.Authorization = `Bearer ${token}`;
              const tokenPreview = token.substring(0, 20) + '...';
              console.log(`✅ Token agregado (${tokenPreview})`);
            } else {
              console.log('⚠️ No hay token en AsyncStorage (usuario no autenticado)');
            }
          } catch (error) {
            console.error('❌ Error al obtener token:', error);
          }
          return config;
        },
        (error) => Promise.reject(error)
      );

      /**
       * INTERCEPTOR DE RESPONSE
       * Si recibe 401 (no autorizado), limpia el almacenamiento
       */
      ApiClient.instance.interceptors.response.use(
        (response: AxiosResponse) => response,
        async (error: AxiosError<ApiError>) => {
          // Manejo específico de error 401
          if (error.response?.status === 401) {
            console.warn('🔴 Error 401: Credenciales inválidas o token expirado');
            
            try {
              // Limpiar almacenamiento con clave 'userToken'
              await AsyncStorage.removeItem('userToken');
              await AsyncStorage.removeItem('user');
              console.log('🧹 AsyncStorage limpiado');
              
              // El usuario será redirigido al login automáticamente
              // por el AuthContext que verifica isSignedIn
            } catch (storageError) {
              console.error('Error al limpiar almacenamiento:', storageError);
            }
          }
          return Promise.reject(error);
        }
      );
    }
    return ApiClient.instance;
  }
}

export default ApiClient;
