import React, { createContext, useReducer, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AuthService from '../services/AuthService';
import { AuthContextType, User } from '../types';

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthState {
  isLoading: boolean;
  isSignedIn: boolean;
  user: User | null;
  error: string | null;
}

type AuthAction =
  | { type: 'RESTORE_TOKEN' }
  | { type: 'SIGN_IN'; payload: User }
  | { type: 'SIGN_UP'; payload: User }
  | { type: 'SIGN_OUT' }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_LOADING'; payload: boolean };

const initialState: AuthState = {
  isLoading: true,
  isSignedIn: false,
  user: null,
  error: null,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'RESTORE_TOKEN':
      return {
        ...state,
        isLoading: false,
      };
    case 'SIGN_IN':
      return {
        ...state,
        isSignedIn: true,
        user: action.payload,
        error: null,
        isLoading: false,
      };
    case 'SIGN_UP':
      return {
        ...state,
        isSignedIn: true,
        user: action.payload,
        error: null,
        isLoading: false,
      };
    case 'SIGN_OUT':
      return {
        ...state,
        isSignedIn: false,
        user: null,
        error: null,
        isLoading: false,
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    default:
      return state;
  }
}

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Restaurar token al iniciar la app
  // Usa clave 'userToken' según especificación del backend
  useEffect(() => {
    let isMounted = true;

    const bootstrapAsync = async () => {
      // Añadir un timeout de seguridad: si tarda más de 3 segundos, mostrar login
      const timeoutId = setTimeout(() => {
        if (isMounted) {
          console.warn('⚠️ Timeout al restaurar token (3s)');
          dispatch({ type: 'RESTORE_TOKEN' });
        }
      }, 3000);

      try {
        // Pequeño delay para asegurar que AsyncStorage está listo
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Clave específica: 'userToken' (según requisitos)
        const token = await AsyncStorage.getItem('userToken');
        const userStr = await AsyncStorage.getItem('user');

        if (!isMounted) return; // Salir si el componente se desmontó

        clearTimeout(timeoutId);

        console.log('🔍 Token encontrado:', !!token);
        console.log('🔍 User data encontrado:', !!userStr);

        if (token && userStr) {
          try {
            const user = JSON.parse(userStr);
            console.log('✅ Usuario restaurado:', user?.name);
            dispatch({ type: 'SIGN_IN', payload: user });
          } catch (parseError) {
            console.error('❌ Error al parsear usuario:', parseError);
            await AsyncStorage.removeItem('user');
            await AsyncStorage.removeItem('userToken');
            dispatch({ type: 'RESTORE_TOKEN' });
          }
        } else {
          console.log('📭 Sin datos almacenados, usuario no autenticado');
          dispatch({ type: 'RESTORE_TOKEN' });
        }
      } catch (error) {
        if (!isMounted) return;
        console.error('❌ Error restaurando token:', error);
        dispatch({ type: 'RESTORE_TOKEN' });
      }
    };

    bootstrapAsync();

    return () => {
      isMounted = false;
    };
  }, []);

  // Login
  const login = useCallback(async (email: string, password: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      console.log('🔐 Iniciando login con email:', email);
      const response = await AuthService.login({ email, password });
      
      console.log('✅ Login exitoso, guardando token...');
      // Guardar token con clave específica 'userToken'
      await AsyncStorage.setItem('userToken', response.access_token);
      await AsyncStorage.setItem('user', JSON.stringify(response.user));

      console.log('✅ Token guardado en AsyncStorage');
      console.log('👤 Usuario:', response.user.name);
      dispatch({ type: 'SIGN_IN', payload: response.user });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error en el login';
      console.error('❌ Error en login:', message);
      dispatch({ type: 'SET_ERROR', payload: message });
      throw error;
    }
  }, []);

  // Register
  const register = useCallback(
    async (email: string, password: string, name: string) => {
      dispatch({ type: 'SET_LOADING', payload: true });
      try {
        const response = await AuthService.register({ email, password, name });
        
        // Guardar token con clave específica 'userToken'
        await AsyncStorage.setItem('userToken', response.access_token);
        await AsyncStorage.setItem('user', JSON.stringify(response.user));

        dispatch({ type: 'SIGN_UP', payload: response.user });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Error en el registro';
        dispatch({ type: 'SET_ERROR', payload: message });
        throw error;
      }
    },
    []
  );

  // Logout
  const logout = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      await AuthService.logout();
    } catch (error) {
      console.error('Error en logout:', error);
    } finally {
      // Limpiar almacenamiento con clave 'userToken'
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('user');
      dispatch({ type: 'SIGN_OUT' });
    }
  }, []);

  // Restaurar token manualmente
  const restoreToken = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const token = await AsyncStorage.getItem('userToken');
      const userStr = await AsyncStorage.getItem('user');

      if (token && userStr) {
        const user = JSON.parse(userStr);
        dispatch({ type: 'SIGN_IN', payload: user });
      } else {
        dispatch({ type: 'RESTORE_TOKEN' });
      }
    } catch (error) {
      console.error('Error restaurando token:', error);
      dispatch({ type: 'RESTORE_TOKEN' });
    }
  }, []);

  const value: AuthContextType = {
    user: state.user,
    isLoading: state.isLoading,
    isSignedIn: state.isSignedIn,
    login,
    register,
    logout,
    restoreToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
