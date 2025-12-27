import ApiClient from '../api/client';
import { ImageUploadResponse } from '../types';

/**
 * ImageService
 * 
 * Maneja la subida de imágenes al servidor.
 * Flujo:
 * 1. Usar expo-image-picker para obtener URI local
 * 2. Crear FormData con el archivo
 * 3. POST /images con multipart/form-data
 * 4. Recibir imageId
 * 5. Asociar imageId a la tarea
 */
class ImageService {
  /**
   * POST /images
   * 
   * Subir una imagen al servidor usando FormData (multipart)
   * 
   * @param uri - URI local de la imagen (ej: file:///path/photo.jpg)
   * @param fileName - Nombre del archivo (ej: photo.jpg)
   * @returns ImageUploadResponse con { id, url, filename }
   */
  async uploadImage(uri: string, fileName: string): Promise<ImageUploadResponse> {
    try {
      console.log('📸 Subiendo imagen:', fileName);
      console.log('📸 URI local:', uri);
      
      // Detectar tipo MIME según extensión
      let mimeType = 'image/jpeg';
      if (fileName.endsWith('.png')) {
        mimeType = 'image/png';
      } else if (fileName.endsWith('.gif')) {
        mimeType = 'image/gif';
      } else if (fileName.endsWith('.webp')) {
        mimeType = 'image/webp';
      }
      console.log('📸 MIME Type:', mimeType);
      
      // Probar con diferentes claves posibles
      const possibleKeys = ['image', 'file', 'photo', 'attachment'];
      let response = null;
      let lastError = null;

      for (const key of possibleKeys) {
        try {
          console.log(`\n📝 Intento con clave: "${key}"`);
          
          const formData = new FormData();
          const file = {
            uri,
            name: fileName,
            type: mimeType,
          } as any;
          
          formData.append(key, file);
          console.log(`✅ FormData creado con clave: "${key}"`);

          console.log('🚀 Enviando POST /images...');
          response = await ApiClient.getInstance().post<any>(
            '/images',
            formData,
            {
              headers: {
                'Content-Type': 'multipart/form-data',
              },
            }
          );
          
          console.log(`✅ Éxito con clave "${key}"`);
          break; // Si funciona, salir del loop
        } catch (err: any) {
          console.warn(`⚠️ Falló con clave "${key}":`, err.response?.status || err.message);
          lastError = err;
          // Continuar con la siguiente clave
        }
      }

      if (!response) {
        throw lastError;
      }

      console.log('✅ Respuesta recibida del servidor');
      console.log('🔍 Status:', response.status);
      console.log('🔍 Respuesta COMPLETA POST /images:');
      console.log(JSON.stringify(response.data, null, 2));
      
      // Extraer datos según estructura del servidor
      let imageResponse: ImageUploadResponse;
      
      // El servidor devuelve: { success: true, data: { url, key, size, contentType } }
      if (response.data.data) {
        console.log('📦 Estructura correcta: { success: true, data: {...} }');
        imageResponse = {
          id: response.data.data.key || 'unknown', // Usar key como id
          url: response.data.data.url,
          filename: response.data.data.contentType || fileName,
        };
      } else if (response.data.id) {
        console.log('📦 Estructura alternativa: { id, url, filename, ... }');
        imageResponse = response.data;
      } else {
        console.error('❌ Respuesta no tiene estructura esperada. Keys:', Object.keys(response.data));
        throw new Error('Estructura inesperada: ' + JSON.stringify(response.data));
      }
      
      console.log('✅ Imagen subida. ID:', imageResponse.id);
      console.log('✅ URL:', imageResponse.url);
      return imageResponse;
    } catch (error) {
      console.error('❌ Error en uploadImage:', error);
      throw this.handleError(error);
    }
  }

  /**
   * DELETE /images/{imageId}
   * Eliminar una imagen del servidor
   */
  async deleteImage(imageId: string): Promise<void> {
    try {
      console.log('🗑️ Eliminando imagen:', imageId);
      await ApiClient.getInstance().delete(`/images/${imageId}`);
      console.log('✅ Imagen eliminada');
    } catch (error) {
      throw this.handleError(error);
    }
  }

  private handleError(error: any): Error {
    console.error('🔍 Error objeto completo:', error);
    
    if (error.response) {
      console.error('❌ HTTP Status:', error.response.status);
      console.error('❌ Response Headers:', JSON.stringify(error.response.headers, null, 2));
      console.error('❌ Response Data (string):', typeof error.response.data === 'string' ? error.response.data : JSON.stringify(error.response.data, null, 2));
      
      // Intentar extraer mensaje de diferentes posibles campos
      let message = 'Error desconocido';
      if (error.response.data?.message) {
        message = error.response.data.message;
      } else if (error.response.data?.error) {
        message = error.response.data.error;
      } else if (typeof error.response.data === 'string') {
        message = error.response.data;
      } else {
        message = `Error HTTP ${error.response.status}`;
      }
      
      console.error('❌ Mensaje extraído:', message);
      return new Error(message);
    } else if (error.request) {
      console.error('❌ Request enviado pero sin respuesta');
      console.error('❌ Request status:', error.request.status);
      return new Error('No hay conexión con el servidor');
    } else {
      console.error('❌ Error en la configuración:', error.message);
      return new Error(error.message || 'Error desconocido');
    }
  }
}

export default new ImageService();
