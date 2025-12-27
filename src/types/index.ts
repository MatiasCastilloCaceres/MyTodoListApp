/**
 * Tipos de Autenticación
 */
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface AuthResponse {
  access_token: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
}

export interface User {
  id: string;
  email: string;
  name: string;
}

/**
 * Tipos de Tareas
 */
export interface Todo {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  imageId?: string;
  photoUrl?: string; // URL de la imagen (nueva)
  photoUri?: string; // URL de la imagen (antigua, la que devuelve el servidor)
  createdAt: string;
  updatedAt: string;
}

export interface CreateTodoRequest {
  title: string;
  description?: string;
  imageId?: string;
  photoUrl?: string; // URL de la imagen subida por el servidor
  photo?: string; // Alternativa si el servidor espera "photo" en lugar de "photoUrl"
}

export interface UpdateTodoRequest {
  title?: string;
  description?: string;
  completed?: boolean;
  imageId?: string;
}

export interface TodoListResponse {
  todos: Todo[];
  total: number;
}

/**
 * Tipos de Imágenes
 */
export interface ImageUploadResponse {
  id: string;
  url: string;
  filename: string;
}

/**
 * Errores de API
 */
export interface ApiError {
  message: string;
  statusCode: number;
}

/**
 * Contexto de Autenticación
 */
export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isSignedIn: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  restoreToken: () => Promise<void>;
}
