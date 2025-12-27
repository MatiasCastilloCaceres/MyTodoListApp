/**
 * useImagePicker Hook
 * 
 * Implementa el requerimiento de API Nativa para imágenes.
 * Flujo:
 * 1. takePhoto() o pickImage() → Abre cámara/galería (API Nativa)
 * 2. uploadImage() → Sube a POST /images (FormData)
 * 3. Retorna imageId para asociar a tarea
 */
import { useState, useCallback } from 'react';
import * as ImagePickerLib from 'expo-image-picker';
import ImageService from '../services/ImageService';
import { ImageUploadResponse } from '../types';

interface UseImagePickerReturn {
  imageUri: string | null;
  uploading: boolean;
  error: string | null;
  pickImage: () => Promise<void>;
  takePhoto: () => Promise<void>;
  uploadImage: () => Promise<ImageUploadResponse | null>;
  clearImage: () => void;
}

export function useImagePicker(): UseImagePickerReturn {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Solicitar permisos de cámara y galería
  const requestPermissions = async () => {
    const cameraStatus = await ImagePickerLib.requestCameraPermissionsAsync();
    const libraryStatus = await ImagePickerLib.requestMediaLibraryPermissionsAsync();

    if (cameraStatus.status !== 'granted' || libraryStatus.status !== 'granted') {
      throw new Error('Se requieren permisos de cámara y galería');
    }
  };

  /**
   * Abrir galería de fotos
   * Requisito: API Nativa expo-image-picker
   */
  const pickImage = useCallback(async () => {
    setError(null);
    try {
      console.log('📂 Abriendo galería...');
      await requestPermissions();

      const result = await ImagePickerLib.launchImageLibraryAsync({
        mediaTypes: ImagePickerLib.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const uri = result.assets[0].uri;
        setImageUri(uri);
        console.log('✅ Imagen seleccionada:', uri);
      } else {
        console.log('⚠️ Selección cancelada');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al seleccionar imagen';
      setError(message);
      console.error('❌ Error en pickImage:', err);
    }
  }, []);

  /**
   * Abrir cámara para tomar foto
   * Requisito: API Nativa expo-image-picker
   */
  const takePhoto = useCallback(async () => {
    setError(null);
    try {
      console.log('📷 Abriendo cámara...');
      await requestPermissions();

      const result = await ImagePickerLib.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const uri = result.assets[0].uri;
        setImageUri(uri);
        console.log('✅ Foto capturada:', uri);
      } else {
        console.log('⚠️ Captura cancelada');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al tomar foto';
      setError(message);
      console.error('❌ Error en takePhoto:', err);
    }
  }, []);

  /**
   * Subir imagen al servidor
   * POST /images (FormData multipart)
   * Retorna imageId para asociar a tarea
   */
  const uploadImage = useCallback(async (): Promise<ImageUploadResponse | null> => {
    if (!imageUri) {
      setError('No hay imagen seleccionada');
      console.warn('⚠️ No hay imageUri');
      return null;
    }

    setUploading(true);
    setError(null);
    try {
      const fileName = `image-${Date.now()}.jpg`;
      console.log('🚀 Iniciando subida de imagen...');
      const response = await ImageService.uploadImage(imageUri, fileName);
      console.log('✅ Imagen subida exitosamente. ID:', response.id);
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al subir imagen';
      setError(message);
      console.error('❌ Error en uploadImage:', err);
      throw err;
    } finally {
      setUploading(false);
    }
  }, [imageUri]);

  /**
   * Limpiar imagen local (descartar sin subir)
   */
  const clearImage = useCallback(() => {
    setImageUri(null);
    setError(null);
    console.log('🧹 Imagen limpiada');
  }, []);

  return {
    imageUri,
    uploading,
    error,
    pickImage,
    takePhoto,
    uploadImage,
    clearImage,
  };
}
