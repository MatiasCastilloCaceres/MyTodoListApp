import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Modal,
  Image,
} from 'react-native';
import { useTodos } from '../../src/hooks/useTodos';
import { useImagePicker } from '../../src/hooks/useImagePicker';

interface CreateTodoScreenProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function CreateTodoScreen({ visible, onClose, onSuccess }: CreateTodoScreenProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageId, setImageId] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const { addTask, loading } = useTodos();
  const { imageUri, uploading, error: imageError, pickImage, takePhoto, uploadImage, clearImage } = useImagePicker();

  const handleCreate = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'El título es requerido');
      return;
    }

    try {
      let finalImageId = imageId;
      let finalImageUrl = imageUrl;

      // Si hay imagen seleccionada pero no subida, subirla primero
      if (imageUri && !imageId) {
        console.log('📷 Subiendo imagen antes de crear tarea...');
        Alert.alert('Información', 'Subiendo imagen...');
        const imageResponse = await uploadImage();
        if (imageResponse) {
          finalImageId = imageResponse.id;
          finalImageUrl = imageResponse.url; // Guardar también la URL del servidor
          console.log('✅ Imagen subida con ID:', finalImageId, 'URL:', finalImageUrl);
        }
      }

      console.log('📝 Llamando a addTask con:', { title, description, imageId: finalImageId, photoUrl: finalImageUrl, photo: finalImageUrl });
      await addTask({
        title: title.trim(),
        description: description.trim() || undefined,
        imageId: finalImageId || undefined,
        photoUrl: finalImageUrl || undefined, // Pasar la URL del servidor
        // También intentar con "photo" por si el servidor espera ese nombre
      });

      Alert.alert('Éxito', 'Tarea creada correctamente');
      setTitle('');
      setDescription('');
      setImageId(null);
      setImageUrl(null);
      clearImage();
      onSuccess?.();
      onClose();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al crear tarea';
      console.error('❌ Error en handleCreate:', message);
      Alert.alert('Error', message);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Nueva Tarea</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          <TextInput
            style={styles.input}
            placeholder="Título de la tarea"
            value={title}
            onChangeText={setTitle}
            editable={!loading}
            placeholderTextColor="#999"
          />

          <TextInput
            style={[styles.input, styles.descriptionInput]}
            placeholder="Descripción (opcional)"
            value={description}
            onChangeText={setDescription}
            editable={!loading && !uploading}
            multiline
            numberOfLines={4}
            placeholderTextColor="#999"
          />

          {/* Mostrar imagen seleccionada */}
          {imageUri && (
            <View style={styles.imagePreviewContainer}>
              <Image source={{ uri: imageUri }} style={styles.imagePreview} />
              <TouchableOpacity
                style={styles.removeImageButton}
                onPress={() => {
                  clearImage();
                  setImageId(null);
                }}
              >
                <Text style={styles.removeImageText}>✕</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Botones para agregar imagen */}
          {!imageUri && (
            <View style={styles.imageButtonsContainer}>
              <TouchableOpacity
                style={[styles.imageButton, (loading || uploading) && styles.buttonDisabled]}
                onPress={takePhoto}
                disabled={loading || uploading}
              >
                <Text style={styles.imageButtonText}>📷 Tomar Foto</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.imageButton, (loading || uploading) && styles.buttonDisabled]}
                onPress={pickImage}
                disabled={loading || uploading}
              >
                <Text style={styles.imageButtonText}>📂 Galería</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Mostrar errores de imagen */}
          {imageError && (
            <Text style={styles.errorText}>Error: {imageError}</Text>
          )}

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleCreate}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Crear Tarea</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={onClose}
            disabled={loading}
          >
            <Text style={styles.cancelText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  content: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  closeText: {
    fontSize: 24,
    color: '#999',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
  },
  descriptionInput: {
    textAlignVertical: 'top',
    minHeight: 100,
  },
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    marginTop: 10,
    padding: 15,
    alignItems: 'center',
  },
  cancelText: {
    color: '#007AFF',
    fontSize: 16,
  },
  imageButtonsContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 15,
  },
  imageButton: {
    flex: 1,
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  imageButtonText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
  },
  imagePreviewContainer: {
    position: 'relative',
    marginBottom: 15,
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  removeImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeImageText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 14,
    marginBottom: 10,
  },
});
