# 🧪 Guía de Testing del Flujo de Login

## Paso 1: Verificar Arranque de la App

Cuando abras la app, deberías ver en los logs (Expo CLI):

```
🔧 API_BASE_URL: https://todo-list.dobleb.cl
⏳ Estado inicial: isLoading = true
🔍 Token encontrado: false (primera vez)
🔍 User data encontrado: false
📭 Sin datos almacenados, usuario no autenticado
✅ Pantalla de login mostrada
```

**Resultado esperado**: Ves la pantalla de login con campos de email y contraseña.

---

## Paso 2: Realizar Login

Ingresa credenciales válidas y presiona "Iniciar Sesión":

```
🔐 Iniciando login con email: tu@email.com
✅ Login exitoso, guardando token...
✅ Token guardado en AsyncStorage
👤 Usuario: Tu Nombre
✅ Token agregado (eyJhbGciOiJIUzI1NiIs...)
🔄 Obteniendo tareas del servidor...
```

**Resultado esperado**: 
- Desaparece la pantalla de login
- Ves la pantalla HOME con tus tareas
- En los logs ves "Token agregado"

---

## Paso 3: Verificar Persistencia (CRÍTICO para el examen)

1. **En la app**: Presiona el botón "Salir" (logout)
2. **Nuevamente abre la app**: 

Deberías ver:

```
🔍 Token encontrado: true ✅
🔍 User data encontrado: true ✅
✅ Usuario restaurado: Tu Nombre
✅ Token agregado (eyJhbGciOiJIUzI1NiIs...)
🔄 Obteniendo tareas del servidor...
```

**Resultado esperado**: 
- Vas directamente a HOME (sin pasar por login)
- No necesitas volver a introducir credenciales
- Las tareas cargan correctamente

---

## Paso 4: Prueba de Recarga Fría (Kill App)

### En Emulador/Simulador:
```bash
# Abre el terminal donde corre Expo
# Presiona: p (para previeww mode o r para reload)
```

### En Dispositivo Real:
1. Cierra la app completamente
2. Abre de nuevo

**Resultado esperado**: Igual al Paso 3 - deberías estar autenticado automáticamente

---

## Errores Comunes

| Problema | Causa | Solución |
|----------|-------|----------|
| Pantalla siempre cargando | Token no se guarda | Verifica AsyncStorage.setItem en AuthContext |
| Login falla (404) | URL incorrecta | Verifica `.env`: debe ser sin `/api` |
| Login falla (401) | Credenciales inválidas | Usa credenciales correctas del servidor |
| Tareas no cargan | Token no se envía | Verifica interceptor en client.ts |
| No se mantiene sesión | Token no se guarda | Verifica que `userToken` se guarde en AsyncStorage |

---

## Debugging Tips

### Ver AsyncStorage:
```typescript
// En AuthContext o cualquier componente
import AsyncStorage from '@react-native-async-storage/async-storage';

const debugStorage = async () => {
  const keys = await AsyncStorage.getAllKeys();
  const items = await AsyncStorage.multiGet(keys);
  console.log('🔍 AsyncStorage:', items);
};

debugStorage();
```

### Ver Headers de Petición:
Los logs del interceptor de request te muestran si el token se envía:
```
✅ Token agregado (eyJhbGciOiJIUzI1NiIs...)
```

### Verificar Respuesta del Servidor:
Si hay error 401 o 404, verás:
```
❌ Error en login: Unauthorized
```
o
```
❌ Error al cargar tareas: Not Found
```

---

## Flujo Esperado Completo

```
APP INICIA
    ↓
AuthContext.bootstrapAsync()
    ↓
¿Hay token en AsyncStorage? ─→ NO → Mostrar LOGIN
    ↓ SÍ
Cargar usuario
    ↓
Mostrar HOME → refreshTodos()
    ↓
GET /tasks (con header Authorization: Bearer {token})
    ↓
Mostrar lista de tareas
```

---

## Checklist para el Examen

- [ ] App inicia mostrando login (sin token)
- [ ] Login funciona con credenciales válidas
- [ ] Token se guarda en AsyncStorage con clave `userToken`
- [ ] Tareas se cargan desde `/tasks` con token en header
- [ ] Cerrar app y reabrirla → sigue autenticado
- [ ] Logs muestran "Token encontrado: true"
- [ ] Logout funciona y borra token
- [ ] Login de nuevo funciona
