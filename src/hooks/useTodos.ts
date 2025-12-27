import { useState, useCallback, useEffect } from 'react';
import TodoService from '../services/TodoService';
import { Todo, CreateTodoRequest, UpdateTodoRequest } from '../types';

interface UseTodosReturn {
  todos: Todo[];
  loading: boolean;
  error: string | null;
  refreshTodos: () => Promise<void>;
  addTask: (data: CreateTodoRequest) => Promise<void>;
  updateTask: (id: string, data: UpdateTodoRequest) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  toggleTask: (id: string, completed: boolean) => Promise<void>;
}

/**
 * Custom Hook: useTodos
 * 
 * Encapsula toda la lógica de tareas.
 * Las pantallas NO hacen peticiones a la API directamente.
 * Las pantallas solo llaman funciones de este hook.
 * 
 * Según requisitos:
 * - El hook maneja estado loading
 * - El hook maneja errores
 * - El hook retorna array de tareas (NUNCA guardadas localmente)
 * - Todas las peticiones son al servidor (GET /tasks, etc.)
 */
export function useTodos(): UseTodosReturn {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * GET /tasks
   * Listar todas las tareas del usuario
   * Se ejecuta al cargar la pantalla
   */
  const refreshTodos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('🔄 Obteniendo tareas del servidor...');
      const data = await TodoService.getTodos();
      setTodos(data);
      console.log('✅ Tareas obtenidas:', data.length);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar tareas';
      setError(message);
      console.error('❌ Error en refreshTodos:', message);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * POST /tasks
   * Crear una nueva tarea
   * Parámetros: title, description (opcional), imageId (opcional), photoUrl (opcional)
   */
  const addTask = useCallback(async (data: CreateTodoRequest) => {
    setLoading(true);
    setError(null);
    try {
      console.log('➕ Creando tarea:', data);
      const newTodo = await TodoService.createTodo(data);
      
      // Si se pasó photoUrl pero el servidor no la devolvió, agregarla manualmente
      if (data.photoUrl && !newTodo.photoUrl) {
        console.log('📸 Agregando photoUrl manualmente:', data.photoUrl);
        newTodo.photoUrl = data.photoUrl;
      }
      
      // Actualizar lista local con la nueva tarea
      // (Frontend optimista: mostrar inmediatamente)
      setTodos((prevTodos) => [newTodo, ...prevTodos]);
      console.log('✅ Tarea creada con ID:', newTodo.id, 'PhotoUrl:', newTodo.photoUrl);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al crear tarea';
      setError(message);
      console.error('❌ Error en addTask:', message);
      throw err; // Re-lanzar para que la pantalla maneje Alert
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * PATCH /tasks/{id}
   * Actualizar una tarea
   * Parámetros: title, description, isCompleted, imageId
   */
  const updateTask = useCallback(async (id: string, data: UpdateTodoRequest) => {
    setLoading(true);
    setError(null);
    try {
      console.log('✏️ Actualizando tarea:', id, data);
      const updatedTodo = await TodoService.updateTodo(id, data);
      
      // Actualizar lista local
      setTodos((prevTodos) =>
        prevTodos.map((todo) => (todo.id === id ? updatedTodo : todo))
      );
      console.log('✅ Tarea actualizada');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al actualizar tarea';
      setError(message);
      console.error('❌ Error en updateTask:', message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * DELETE /tasks/{id}
   * Eliminar una tarea por ID
   */
  const deleteTask = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      console.log('🗑️ Eliminando tarea:', id);
      await TodoService.deleteTodo(id);
      
      // Actualizar lista local
      setTodos((prevTodos) => prevTodos.filter((todo) => todo.id !== id));
      console.log('✅ Tarea eliminada');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al eliminar tarea';
      setError(message);
      console.error('❌ Error en deleteTask:', message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * PATCH /tasks/{id} - Helper
   * Marcar tarea como completada/no completada
   */
  const toggleTask = useCallback(async (id: string, completed: boolean) => {
    setLoading(true);
    setError(null);
    try {
      console.log('🔄 Toggle tarea:', id, 'isCompleted:', completed);
      const updatedTodo = await TodoService.toggleTodo(id, completed);
      
      // Actualizar lista local
      setTodos((prevTodos) =>
        prevTodos.map((todo) => (todo.id === id ? updatedTodo : todo))
      );
      console.log('✅ Tarea actualizada (toggle)');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al actualizar tarea';
      setError(message);
      console.error('❌ Error en toggleTask:', message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    todos,
    loading,
    error,
    refreshTodos,
    addTask,
    updateTask,
    deleteTask,
    toggleTask,
  };
}
