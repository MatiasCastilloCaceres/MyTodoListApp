# 📱 MyTodoListApp - Aplicación de Tareas Profesional

Aplicación React Native/Expo con autenticación, CRUD de tareas, y manejo de imágenes nativas.

## 📋 Tabla de Contenidos

- [Descripción](#descripción)
- [Requisitos Técnicos Cumplidos](#requisitos-técnicos-cumplidos)
- [Instalación](#instalación)
- [Configuración](#configuración)
- [Uso](#uso)
- [Estructura del Código](#estructura-del-código)
- [Uso de IA](#uso-de-ia)
- [Roles y Responsabilidades](#roles-y-responsabilidades)
- [Defensa del Proyecto](#defensa-del-proyecto)

---

## 📖 Descripción

MyTodoListApp es una aplicación móvil completa que permite a los usuarios:

1. **Autenticarse** con credenciales seguras
2. **Crear, leer, actualizar y eliminar** tareas
3. **Capturar fotos** con la cámara del dispositivo (API Nativa)
4. **Subir imágenes** al servidor
5. **Mantener sesión** mediante persistencia de token

La aplicación implementa una arquitectura profesional con separación de responsabilidades, custom hooks, e interceptores de Axios.

---

## ✅ Requisitos Técnicos Cumplidos

### 1. Gestión de Autenticación (Pilar de Seguridad)
- ✅ **Login**: POST `/auth/login` → Captura `response.data.data.token`
- ✅ **Token Persistente**: Guardado en AsyncStorage con clave `userToken`
- ✅ **AuthContext**: Proporciona estado global de autenticación
- ✅ **Validación en Inicio**: Root layout verifica token y redirige automáticamente
- ✅ **Manejo de 401**: Muestra alerta de "Credenciales inválidas"

**Código clave** (`src/context/AuthContext.tsx`):
```typescript
// Guardar token específicamente
await AsyncStorage.setItem('userToken', response.access_token);
```

### 2. Configuración del Cliente API (Axios/Fetch)
- ✅ **Interceptor de Request**: Busca token en AsyncStorage antes de peticiones
- ✅ **Header Bearer**: Agrega `Authorization: Bearer {token}` automáticamente
- ✅ **Variable de Entorno**: `EXPO_PUBLIC_API_URL=https://todo-list.dobleb.cl/api`

**Código clave** (`src/api/client.ts`):
```typescript
// Lee token dinámicamente
const token = await AsyncStorage.getItem('userToken');
if (token) {
  config.headers.Authorization = `Bearer ${token}`;
}
```

### 3. CRUD de Tareas mediante Custom Hooks
- ✅ **GET /tasks**: Listar tareas al cargar pantalla (sin guardar localmente)
- ✅ **POST /tasks**: Crear tarea con título, descripción, imageId (opcional)
- ✅ **PATCH /tasks/{id}**: Actualizar estado `isCompleted`
- ✅ **DELETE /tasks/{id}**: Eliminar tarea por ID
- ✅ **Estados de UI**: Hook retorna `loading` para mostrar indicador

**Código clave** (`src/hooks/useTodos.ts`):
```typescript
export function useTodos() {
  const [loading, setLoading] = useState(false);
  
  const refreshTodos = async () => {
    setLoading(true);
    const data = await TodoService.getTodos();
    setTodos(data); // Del servidor, no localStorage
    setLoading(false);
  };
  
  return { todos, loading, refreshTodos, addTask, ... };
}
```

### 4. Manejo de Imágenes (Pilar de API Nativa)
- ✅ **Captura**: `expo-image-picker` abre cámara/galería (API Nativa)
- ✅ **FormData**: Objeto con campo `file` (URI, nombre, mimetype)
- ✅ **POST /images**: Multipart form-data
- ✅ **Vinculación**: Recibe imageId y lo asocia a POST /tasks

**Código clave** (`src/hooks/useImagePicker.ts`):
```typescript
const takePhoto = async () => {
  const result = await ImagePickerLib.launchCameraAsync({...});
  setImageUri(result.assets[0].uri); // API Nativa
};

const uploadImage = async () => {
  const formData = new FormData();
  formData.append('file', { uri, name, type: 'image/jpeg' });
  const { id } = await ImageService.uploadImage(...);
  return id; // Para asociar a tarea
};
```

---

## 🚀 Instalación

### Prerequisitos
- Node.js 16+ y npm
- Expo CLI: `npm install -g expo-cli`
- Emulador Android o iOS, o dispositivo físico

### Pasos

1. **Clonar repositorio**
   ```bash
   git clone <repo-url>
   cd MyTodoListApp
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
   ```bash
   cp .env.example .env
   # Editar .env con tu URL de API
   ```

4. **Ejecutar aplicación**
   ```bash
   # Iniciar Expo
   npx expo start
   
   # En otra terminal:
   # Para Android
   npx expo start --android
   
   # Para iOS
   npx expo start --ios
   
   # Para Web
   npx expo start --web
   ```

---

## ⚙️ Configuración

### Archivo .env
```env
# URL del backend
EXPO_PUBLIC_API_URL=https://todo-list.dobleb.cl/api

# Cambiar para desarrollo local:
# EXPO_PUBLIC_API_URL=http://localhost:3000/api
```

### Endpoints Esperados del Backend

**Autenticación**
```
POST /auth/login
  Entrada: { email, password }
  Salida: { data: { token: "...", user: { id, email, name } } }

POST /auth/register
  Entrada: { email, password, name }
  Salida: { data: { token: "...", user: {...} } }

POST /auth/logout
  
GET /auth/me (opcional)
```

**Tareas**
```
GET /tasks
  Salida: [{ id, title, description, isCompleted, imageId, createdAt, updatedAt }]

POST /tasks
  Entrada: { title, description?, imageId? }
  Salida: { id, title, ... }

PATCH /tasks/:id
  Entrada: { title?, description?, isCompleted?, imageId? }
  Salida: { id, ... }

DELETE /tasks/:id
```

**Imágenes**
```
POST /images (multipart/form-data)
  Entrada: FormData con campo "file"
  Salida: { id, url, filename }
```

---

## 📖 Uso

### Flujo de Usuario

1. **Login**
   - Ingresa email y contraseña
   - Token se guarda automáticamente en AsyncStorage
   - Redirige a Home

2. **Ver Tareas**
   - GET /tasks se ejecuta al cargar
   - ActivityIndicator mostrado mientras carga
   - Lista muestra todas las tareas del usuario

3. **Crear Tarea**
   - Toca botón "+"
   - Ingresa título y descripción
   - Opcionalmente: toma foto con cámara
   - Sube imagen (obtiene imageId)
   - POST /tasks con título, descripción, imageId
   - Tarea aparece en lista automáticamente

4. **Actualizar Tarea**
   - Toca checkbox para marcar completada
   - PATCH /tasks/:id con { isCompleted: true }

5. **Eliminar Tarea**
   - Toca icono basura
   - DELETE /tasks/:id

6. **Logout**
   - Token se elimina de AsyncStorage
   - Redirige a Login

---

## 📁 Estructura del Código

```
src/
├── api/
│   └── client.ts              # Instancia Axios con interceptores
├── services/
│   ├── AuthService.ts         # POST /auth/login, register, logout
│   ├── TodoService.ts         # CRUD /tasks
│   └── ImageService.ts        # POST /images (FormData)
├── hooks/
│   ├── useAuth.ts             # Hook acceso AuthContext
│   ├── useTodos.ts            # Hook CRUD tareas + estados
│   └── useImagePicker.ts      # Hook cámara/galería + subida
├── context/
│   └── AuthContext.tsx        # Estado global autenticación
├── types/
│   └── index.ts               # Interfaces TypeScript
└── config/
    └── constants.ts           # URLs, claves, etc.

app/
├── (app)/                     # Rutas autenticadas
│   ├── (home)/
│   │   ├── index.tsx          # Home (lista tareas)
│   │   └── todo-detail.tsx    # Crear/editar tarea
│   └── _layout.tsx
├── (auth)/                    # Rutas sin autenticar
│   ├── login.tsx
│   ├── register.tsx
│   └── _layout.tsx
├── screens/
│   ├── LoginScreen.tsx
│   ├── RegisterScreen.tsx
│   └── HomeScreen.tsx
└── _layout.tsx                # Root layout (flujo auth)
```

### Arquitectura de Capas

```
┌─────────────────────────────────┐
│      Componentes/Pantallas      │ ← Sin lógica de API
│    (LoginScreen, HomeScreen)    │
└───────────────┬─────────────────┘
                │
┌───────────────▼─────────────────┐
│       Custom Hooks (State)      │ ← Con try/catch, loading
│  (useAuth, useTodos, usePicker) │
└───────────────┬─────────────────┘
                │
┌───────────────▼─────────────────┐
│    Services (Pure Functions)    │ ← Solo peticiones HTTP
│  (AuthService, TodoService)     │
└───────────────┬─────────────────┘
                │
┌───────────────▼─────────────────┐
│     Axios Client + Interceptor  │ ← Headers, errores 401
│         (src/api/client.ts)     │
└─────────────────────────────────┘
```

---

## 🤖 Uso de IA

Se utilizó IA para:

1. **Estructurar los servicios**
   - Crear patrón Singleton para ApiClient
   - Implementar interceptores de Axios de forma eficiente
   - Organizar servicios por responsabilidad (Auth, Todo, Image)

2. **Depurar errores de TypeScript**
   - Definir interfaces correctas para respuestas del backend
   - Usar tipos genéricos en Axios
   - Evitar uso de `any`

3. **Diseñar el flujo de imágenes**
   - Implementar FormData con expo-image-picker
   - Dos pasos: captura local → subida servidor → imageId
   - Manejo de permisos nativos

4. **Crear custom hooks reutilizables**
   - Patrones de estado con hooks
   - Encapsulación de lógica
   - Manejo centralizado de errores

---

## 👥 Roles y Responsabilidades

| Nombre/Rol | Sección del Código | Contribución |
|------------|-------------------|--------------|
| Tu Nombre | `src/context/AuthContext.tsx` | Implementar persistencia de token con clave 'userToken', manejo de 401 |
| Tu Nombre | `src/hooks/useTodos.ts` | Custom hook con CRUD completo, estados de loading |
| Tu Nombre | `src/hooks/useImagePicker.ts` | Integración expo-image-picker + FormData |
| Tu Nombre | `src/api/client.ts` | Interceptor Axios con Authorization: Bearer |
| Tu Nombre | `app/screens/HomeScreen.tsx` | UI lista tareas, llamadas a useTodos hook |
| Tu Nombre | `app/(app)/(home)/todo-detail.tsx` | Pantalla crear tarea, integración useImagePicker |

*Nota: Reemplaza "Tu Nombre" con los integrantes reales del equipo.*

---

## 🎥 Defensa del Proyecto

### Video Requerido (4.0 Puntos)

El video de defensa debe incluir:

#### 1. Demostración Funcional (Flujo Completo)
- [ ] Usuario hace login exitoso
- [ ] Se ve lista de tareas vacía o con tareas
- [ ] Crea nueva tarea con título y descripción
- [ ] Toma foto con cámara del dispositivo (API Nativa)
- [ ] Selecciona imagen de galería (API Nativa)
- [ ] Sube la imagen y obtiene imageId
- [ ] Tarea se crea con imagen
- [ ] Marca tarea como completada
- [ ] Elimina una tarea
- [ ] Cierra sesión (logout)

#### 2. Explicaciones Teóricas con Código

**Pregunta: ¿Cómo manejas el estado en tu aplicación?**
- Mostrar: `src/hooks/useTodos.ts` línea del `useState`
- Explicar: `loading` y `error` para UI
- Ejemplo: "Pongo `loading` en true antes de llamar el servicio"

**Pregunta: ¿Cómo capturas el token del backend?**
- Mostrar: `src/services/AuthService.ts` línea donde accedes `response.data.data.token`
- Explicar: "Según el Swagger, el token está dentro de `data.data`"
- Mostrar: `src/context/AuthContext.tsx` donde lo guardas en AsyncStorage con clave `userToken`

**Pregunta: ¿Cómo implementas la API Nativa para imágenes?**
- Mostrar: `src/hooks/useImagePicker.ts` función `takePhoto()`
- Explicar: "Uso `ImagePickerLib.launchCameraAsync()` que abre la cámara del teléfono"
- Mostrar: FormData con campo `file`
- Explicar: "POST /images con multipart/form-data, recibo imageId, y lo asocio a la tarea"

**Pregunta: ¿Cómo funciona el interceptor de REST/Auth?**
- Mostrar: `src/api/client.ts` interceptor.request.use()
- Explicar: "Leo el token de AsyncStorage y lo agrego al header automáticamente"
- Mostrar: Error 401 y limpieza de almacenamiento

**Pregunta: ¿Cómo es tu arquitectura de hooks?**
- Mostrar: `app/screens/HomeScreen.tsx` que usa `useTodos()`
- Explicar: "La pantalla no llama a la API directamente, solo usa el hook"
- Mostrar: `useTodos.ts` con `try/catch` interno
- Explicar: "El hook maneja todos los errores, la pantalla solo muestra UI"

---

## 🧪 Testing Manual

### Checklist de Validación

- [ ] **Login**
  ```bash
  - Email: test@example.com
  - Password: password123
  - Verificar: Token guardado en AsyncStorage
  ```

- [ ] **Persistencia**
  ```bash
  - Cerrar app completamente
  - Abrir nuevamente
  - Debe mostrar Home, no Login
  ```

- [ ] **CRUD Tareas**
  ```bash
  - Crear: POST /tasks
  - Listar: GET /tasks (sin localStorage)
  - Actualizar: PATCH /tasks/:id (toggle)
  - Eliminar: DELETE /tasks/:id
  ```

- [ ] **Imágenes**
  ```bash
  - Tomar foto: Funciona cámara
  - Subir: POST /images con FormData
  - Asociar: imageId en tarea
  ```

- [ ] **Errores**
  ```bash
  - Desconectar WiFi, intentar crear tarea
  - Debe mostrar "No hay conexión"
  - Token inválido (401)
  - Debe redirigir a Login
  ```

---

## 📚 Documentación Adicional

- [ARCHITECTURE.md](./ARCHITECTURE.md) - Decisiones de diseño
- [QUICK_START.md](./QUICK_START.md) - Referencia rápida
- [EXAMPLES.md](./EXAMPLES.md) - Ejemplos de código

---

## 📝 Licencia

Este proyecto es parte de una evaluación académica.

---

## ✉️ Soporte

Para problemas con la instalación o ejecución, verificar:

1. Versión de Node.js: `node --version` (debe ser 16+)
2. Expo CLI instalado: `expo --version`
3. Variable de entorno `.env` configurada correctamente
4. Backend en funcionamiento en `EXPO_PUBLIC_API_URL`

---

**Última actualización: 26 de diciembre de 2025**
# MyTodoListApp
