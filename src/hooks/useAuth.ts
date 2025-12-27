import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { AuthContextType } from '../types';

/**
 * Hook para acceder al contexto de autenticación
 * Proporciona acceso a: user, isLoading, isSignedIn, login, register, logout, restoreToken
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  
  return context;
}
