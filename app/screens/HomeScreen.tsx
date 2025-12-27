import React, { useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { useTodos } from '../../src/hooks/useTodos';
import { useAuth } from '../../src/hooks/useAuth';
import { Todo } from '../../src/types';
import CreateTodoScreen from './CreateTodoScreen';

export default function HomeScreen() {
  const [showCreateModal, setShowCreateModal] = React.useState(false);
  const { todos, loading, error, refreshTodos, deleteTask, toggleTask } = useTodos();
  const { logout, user } = useAuth();

  // Cargar tareas al montar
  useEffect(() => {
    refreshTodos();
  }, []);

  const handleToggle = async (todo: Todo) => {
    try {
      await toggleTask(todo.id, !todo.completed);
    } catch (err) {
      Alert.alert('Error', 'No se pudo actualizar la tarea');
    }
  };

  const handleDelete = async (id: string) => {
    Alert.alert(
      'Eliminar tarea',
      '¿Estás seguro?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteTask(id);
            } catch (err) {
              Alert.alert('Error', 'No se pudo eliminar la tarea');
            }
          },
        },
      ]
    );
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      Alert.alert('Error', 'Error al cerrar sesión');
    }
  };

  const renderTodo = ({ item }: { item: Todo }) => {
    // Validar datos
    if (!item || !item.id) {
      console.error('⚠️ Item inválido en renderTodo:', item);
      return null;
    }

    return (
    <View style={styles.todoItem}>
      <TouchableOpacity
        style={styles.checkboxContainer}
        onPress={() => handleToggle(item)}
      >
        <View
          style={[
            styles.checkbox,
            item.completed && styles.checkboxChecked,
          ]}
        >
          {item.completed && <Text style={styles.checkmark}>✓</Text>}
        </View>
      </TouchableOpacity>

      <View style={styles.todoContent}>
        {/* Mostrar imagen si existe */}
        {item.photoUrl && (
          <>
            <Text style={styles.debugText}>🔍 URL: {item.photoUrl}</Text>
            <Image
              source={{ uri: item.photoUrl }}
              style={styles.todoImage}
              onLoad={() => console.log('✅ Imagen cargada:', item.photoUrl)}
              onError={(e) => {
                console.warn('⚠️ Error cargando imagen:', item.photoUrl);
              }}
            />
          </>
        )}
        
        <Text
          style={[
            styles.todoTitle,
            item.completed && styles.todoTitleCompleted,
          ]}
        >
          {item.title}
        </Text>
        {item.description && (
          <Text style={styles.todoDescription}>{item.description}</Text>
        )}
      </View>

      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => handleDelete(item.id)}
      >
        <Text style={styles.deleteText}>🗑️</Text>
      </TouchableOpacity>
    </View>
    );
  };

  if (loading && todos.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Hola, {user?.name}!</Text>
          <Text style={styles.taskCountText}>{todos.length} tareas</Text>
        </View>
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Text style={styles.logoutText}>Salir</Text>
        </TouchableOpacity>
      </View>

      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#007AFF" />
          <Text style={styles.loadingText}>Actualizando tareas...</Text>
        </View>
      )}

      {todos.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No hay tareas aún</Text>
          <Text style={styles.emptySubtext}>Crea una nueva tarea para comenzar</Text>
        </View>
      ) : (
        <FlatList
          data={todos}
          keyExtractor={(item, index) => {
            // Fallback a index si no hay ID (debugging)
            if (!item.id) {
              console.warn('⚠️ Tarea sin ID en índice:', index, item);
              return `task-${index}`;
            }
            return item.id.toString();
          }}
          renderItem={renderTodo}
          contentContainerStyle={styles.listContent}
        />
      )}

      <TouchableOpacity 
        style={styles.fabButton}
        onPress={() => setShowCreateModal(true)}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      <CreateTodoScreen
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => {
          // Recarga las tareas después de crear una
          refreshTodos();
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  taskCountText: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  logoutButton: {
    padding: 8,
    backgroundColor: '#FF3B30',
    borderRadius: 6,
  },
  logoutText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  errorBanner: {
    backgroundColor: '#FFE5E5',
    padding: 12,
    marginHorizontal: 10,
    marginTop: 10,
    borderRadius: 8,
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 14,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  loadingText: {
    marginLeft: 10,
    color: '#666',
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#999',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#ccc',
    marginTop: 10,
  },
  listContent: {
    padding: 10,
  },
  todoItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  checkboxContainer: {
    marginRight: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#007AFF',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#007AFF',
  },
  checkmark: {
    color: '#fff',
    fontWeight: 'bold',
  },
  todoContent: {
    flex: 1,
  },
  debugText: {
    fontSize: 10,
    color: '#999',
    marginBottom: 5,
  },
  todoImage: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: '#f0f0f0',
  },
  todoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  todoTitleCompleted: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  todoDescription: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  deleteButton: {
    padding: 8,
  },
  deleteText: {
    fontSize: 18,
  },
  fabButton: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
  },
  fabText: {
    fontSize: 32,
    color: '#fff',
  },
});
