# 📸 Verificación del Flujo de Imágenes

## Requisito: Captura y Subida de Imágenes

✅ **Implementado:**

### 1. API Nativa (expo-image-picker)
- ✅ `useImagePicker()` hook con dos métodos:
  - `takePhoto()` - Abre cámara nativa
  - `pickImage()` - Abre galería de imágenes

**Ubicación:** `src/hooks/useImagePicker.ts`

### 2. Subida de Imagen (POST /images)
- ✅ `ImageService.uploadImage(uri, fileName)`
- ✅ Usa FormData con multipart/form-data
- ✅ Extrae `imageId` y `url` de la respuesta
- ✅ Maneja ambas estructuras de respuesta del servidor

**Ubicación:** `src/services/ImageService.ts`

### 3. Asociar Imagen a Tarea
- ✅ `CreateTodoScreen` tiene botones para:
  - 📷 Tomar Foto
  - 📂 Seleccionar de Galería
- ✅ Sube imagen automáticamente antes de crear tarea
- ✅ Pasa `imageId` en `CreateTodoRequest`

**Ubicación:** `app/screens/CreateTodoScreen.tsx`

### 4. Mostrar URL de Imagen
- ✅ HomeScreen muestra imagen en cada tarea
- ✅ Campo `photoUri` en tipo `Todo`
- ✅ Imagen se renderiza con `<Image>` component

**Ubicación:** `app/screens/HomeScreen.tsx`

---

## 🧪 Flujo Completo de Testing

### Paso 1: Crear Tarea con Imagen

```
1. Presiona botón + (FAB)
2. Modal de crear tarea aparece
3. Ingresa título (requerido)
4. Ingresa descripción (opcional)
5. Presiona "📷 Tomar Foto" o "📂 Galería"
```

**Logs esperados:**
```
📂 Abriendo galería...
✅ Imagen seleccionada: file:///path/photo.jpg
```

### Paso 2: Subida de Imagen

```
6. Presiona "Crear Tarea"
7. Si hay imagen, se sube automáticamente
```

**Logs esperados:**
```
📷 Subiendo imagen antes de crear tarea...
📸 Subiendo imagen: image-1703699877000.jpg
🔍 Respuesta completa de POST /images: {
  "data": {
    "id": "abc123",
    "url": "https://ejemplo.com/image.jpg",
    "filename": "image-1703699877000.jpg"
  },
  "success": true
}
✅ Imagen subida. ID: abc123
✅ URL: https://ejemplo.com/image.jpg
```

### Paso 3: Creación de Tarea

```
8. Tarea se crea con imageId
```

**Logs esperados:**
```
📝 Creando tarea: { 
  title: "Mi Tarea",
  description: "Con imagen",
  imageId: "abc123"
}
✅ Tarea creada con ID: xyz789
```

### Paso 4: Visualizar Imagen

```
9. Vuelves a HomeScreen
10. Ves la tarea creada
11. La imagen aparece en la tarea
```

**Resultado esperado:**
- La imagen se muestra en cada tarea
- URL viene desde el servidor (campo `photoUri`)

---

## 📋 Checklist de Validación

- [ ] Botón "Tomar Foto" abre cámara
- [ ] Botón "Galería" abre galería
- [ ] Se muestra preview de imagen seleccionada
- [ ] Botón X borra la imagen del modal
- [ ] Logs muestran "📸 Subiendo imagen"
- [ ] Imagen se sube a POST /images
- [ ] Logs muestran ID y URL de imagen
- [ ] Tarea se crea con imageId
- [ ] HomeScreen muestra la imagen en la tarea
- [ ] La imagen tiene URL del servidor (no file:// local)

---

## 🔄 Flujo Técnico Completo

```
CreateTodoScreen
  ↓
  Usuario selecciona imagen con pickImage() o takePhoto()
  ↓
  Se muestra preview de imagen en modal
  ↓
  Usuario presiona "Crear Tarea"
  ↓
  handleCreate() verifica si hay imageUri
  ↓
  Llama uploadImage() → POST /images con FormData
  ↓
  ImageService extrae imageId y url de respuesta
  ↓
  addTask() es llamado con { title, description, imageId }
  ↓
  POST /todos se envía con Authorization header + imageId
  ↓
  Servidor retorna tarea con photoUri (URL de imagen)
  ↓
  HomeScreen renderiza imagen usando photoUri
```

---

## 🔍 Debugging de Imágenes

### Si la imagen no aparece en la tarea:

1. **Verifica los logs de uploadImage:**
   ```
   ✅ URL: https://... (debería haber URL)
   ```

2. **Verifica que photoUri está en la respuesta de GET /tasks:**
   ```
   console.log de getTodos() debería mostrar photoUri
   ```

3. **Si URL no aparece:**
   - El servidor probablemente no incluye `photoUri` en la respuesta
   - Verifica la estructura de respuesta en `📦 Respuesta completa de GET /todos`

### Si la subida falla:

1. Verificar permisos de cámara/galería
2. Verificar formato FormData
3. Verificar endpoint `/images` en servidor
4. Ver logs: `❌ Error al subir imagen`

---

## 📱 Requisitos del Sistema

- ✅ expo-image-picker ~17.0.10 (instalado)
- ✅ Permisos de cámara (solicitados en runtime)
- ✅ Permisos de galería (solicitados en runtime)
- ✅ API Client con interceptor Bearer token (ya implementado)
- ✅ FormData support (React Native built-in)
