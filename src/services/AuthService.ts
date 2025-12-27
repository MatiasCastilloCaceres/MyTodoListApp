import ApiClient from '../api/client';
import {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  User,
} from '../types';

/**
 * Estructura de respuesta del backend según Swagger:
 * {
 *   "data": {
 *     "token": "eyJhbGc...",
 *     "user": { "id": "...", "email": "...", "name": "..." }
 *   }
 * }
 */
interface ApiLoginResponse {
  data: {
    token: string;
    user: User;
  };
}

class AuthService {
  /**
   * Login: envía credenciales y recibe token
   * Captura específicamente response.data.data.token según Swagger
   */
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await ApiClient.getInstance().post<ApiLoginResponse>(
        '/auth/login',
        credentials
      );
      // Debug: ver estructura de respuesta completa
      console.log('🔍 Respuesta completa de /auth/login:', JSON.stringify(response.data, null, 2));
      
      // Acceso específico a la estructura: response.data.data.token
      const token = response.data.data.token;
      const user = response.data.data.user;

      console.log('🎯 Token extraído:', token.substring(0, 20) + '...');
      console.log('🎯 Usuario extraído:', JSON.stringify(user, null, 2));

      return {
        access_token: token,
        user,
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Register: crea una nueva cuenta
   */
  async register(data: RegisterRequest): Promise<AuthResponse> {
    try {
      const response = await ApiClient.getInstance().post<AuthResponse>(
        '/auth/register',
        data
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Obtener perfil del usuario autenticado
   */
  async getProfile(): Promise<User> {
    try {
      const response = await ApiClient.getInstance().get<User>(
        '/auth/me'
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Logout: invalida el token
   */
  async logout(): Promise<void> {
    try {
      await ApiClient.getInstance().post('/auth/logout');
    } catch (error) {
      // Incluso si falla, limpiamos localmente
      throw this.handleError(error);
    }
  }

  private handleError(error: any): Error {
    if (error.response) {
      // Error del servidor
      const message = error.response.data?.message || 'Error en la autenticación';
      return new Error(message);
    } else if (error.request) {
      // No hay respuesta del servidor
      return new Error('No hay conexión con el servidor');
    } else {
      return new Error(error.message || 'Error desconocido');
    }
  }
}

export default new AuthService();
