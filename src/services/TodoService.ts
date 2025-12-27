import ApiClient from '../api/client';
import {
  Todo,
  CreateTodoRequest,
  UpdateTodoRequest,
  TodoListResponse,
} from '../types';

class TodoService {
  // No usar baseImageUrl si el servidor devuelve URL completa
  // private baseImageUrl = 'https://todo-list.dobleb.cl/images/'; 

  /**
   * GET: Obtener todas las tareas del usuario
   */
  async getTodos(): Promise<Todo[]> {
    try {
      const response = await ApiClient.getInstance().get<any>(
        '/todos'
      );
      console.log('🔍 Respuesta completa de GET /todos:', JSON.stringify(response.data, null, 2));
      
      // Verificar estructura y extraer tareas
      let todos: Todo[] = [];

      if (Array.isArray(response.data)) {
        console.log('📦 Respuesta es un array');
        // Si es array de { data: {...}, success: true }, extraer .data
        if (response.data.length > 0 && response.data[0].data) {
          console.log('📦 Cada elemento tiene estructura { data: {...}, success: true }');
          todos = response.data.map((item: any) => this.enrichTodoWithPhotoUrl(item.data));
        } else {
          console.log('📦 Array directo de tareas');
          todos = response.data.map((todo: Todo) => this.enrichTodoWithPhotoUrl(todo));
        }
      } else if (response.data.todos && Array.isArray(response.data.todos)) {
        console.log('📦 Respuesta tiene .todos array');
        todos = response.data.todos.map((todo: Todo) => this.enrichTodoWithPhotoUrl(todo));
      } else if (response.data.data && Array.isArray(response.data.data)) {
        console.log('📦 Respuesta tiene .data array');
        todos = response.data.data.map((todo: Todo) => this.enrichTodoWithPhotoUrl(todo));
      } else {
        console.error('❌ Estructura de respuesta no reconocida:', response.data);
        throw new Error('Estructura de respuesta de /todos no válida');
      }

      console.log(`✅ ${todos.length} tareas extraídas correctamente`);
      
      // LOG: Mostrar estructura COMPLETA de la primera tarea - SIN FILTRAR
      if (todos.length > 0) {
        console.log('🔍 ========== RESPUESTA CRUDA DE SERVIDOR ==========');
        console.log(JSON.stringify(response.data[0] || response.data.data[0] || response.data.todos[0], null, 2));
        console.log('================================================');
        
        console.log('🔍 ========== TAREA PROCESADA EN LA APP ==========');
        const firstTodo = todos[0];
        console.log(JSON.stringify(firstTodo, null, 2));
        console.log('================================================');
      }
      
      return todos;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * GET: Obtener una tarea por ID
   */
  async getTodoById(id: string): Promise<Todo> {
    try {
      const response = await ApiClient.getInstance().get<Todo>(
        `/todos/${id}`
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * POST: Crear una nueva tarea
   */
  async createTodo(data: CreateTodoRequest): Promise<Todo> {
    try {
      console.log('📝 ENVIANDO a POST /todos:');
      console.log(JSON.stringify(data, null, 2));
      
      const response = await ApiClient.getInstance().post<any>(
        '/todos',
        data
      );
      console.log('🔍 RESPUESTA de POST /todos:');
      console.log(JSON.stringify(response.data, null, 2));
      
      // Extraer tarea de la respuesta
      let todo: Todo;
      if (response.data.data) {
        console.log('✅ Tarea creada (estructura: { data: {...}, success: true })');
        todo = response.data.data;
      } else {
        console.log('✅ Tarea creada (array directo)');
        todo = response.data;
      }
      
      // LOG: Mostrar TODOS los campos de la respuesta
      console.log('🔍 ========== TAREA CREADA - TODOS LOS CAMPOS ==========');
      for (const [key, value] of Object.entries(todo)) {
        console.log(`  ${key}: ${JSON.stringify(value)}`);
      }
      console.log('====================================================');
      
      // Enriquecer con photoUrl si es necesario
      todo = this.enrichTodoWithPhotoUrl(todo);
      
      console.log('✅ Tarea con ID:', todo.id, 'PhotoUrl:', todo.photoUrl);
      return todo;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * PATCH: Actualizar una tarea
   */
  async updateTodo(id: string, data: UpdateTodoRequest): Promise<Todo> {
    try {
      const response = await ApiClient.getInstance().patch<Todo>(
        `/todos/${id}`,
        data
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * DELETE: Eliminar una tarea
   */
  async deleteTodo(id: string): Promise<void> {
    try {
      await ApiClient.getInstance().delete(`/todos/${id}`);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * PATCH: Marcar tarea como completada/no completada
   */
  async toggleTodo(id: string, completed: boolean): Promise<Todo> {
    return this.updateTodo(id, { completed });
  }

  /**
   * Enriquecer una tarea con la URL de la imagen
   * El servidor devuelve en photoUri o photoUrl
   */
  private enrichTodoWithPhotoUrl(todo: Todo): Todo {
    console.log(`🖼️ Enriqueciendo todo ${todo.id}:`);
    
    // Si tiene photoUri (devuelto por el servidor), copiar a photoUrl
    if (todo.photoUri) {
      console.log(`  ✅ Encontrado photoUri: ${todo.photoUri}`);
      return {
        ...todo,
        photoUrl: todo.photoUri,
      };
    }
    
    // Si ya tiene photoUrl, mantenerlo
    if (todo.photoUrl) {
      console.log(`  ✅ Usando photoUrl existente: ${todo.photoUrl}`);
      return todo;
    }
    
    // Si tiene imageId pero no URL, construir URL
    if (todo.imageId) {
      const constructedUrl = `https://todo-list.dobleb.cl/images/${todo.imageId}`;
      console.log(`  📦 Construida URL a partir de imageId: ${constructedUrl}`);
      return {
        ...todo,
        photoUrl: constructedUrl,
      };
    }
    
    console.log(`  ⚠️ No se encontró campo de imagen`);
    return todo;
  }

  private handleError(error: any): Error {
    if (error.response) {
      const message = error.response.data?.message || 'Error en la operación';
      return new Error(message);
    } else if (error.request) {
      return new Error('No hay conexión con el servidor');
    } else {
      return new Error(error.message || 'Error desconocido');
    }
  }
}

export default new TodoService();
