# 📚 Documentación de Refactorización

## Cambios Realizados

### 1. ✅ Solución al Problema de Conexión Backend

**Problema**: La app no se conectaba a `https://opensound.icu` al compilar el APK.

**Solución**:
- Agregado `extra` en `app.json` con las URLs del backend
- Creado `hooks/useConfig.ts` que lee desde `app.json` en producción
- Actualizado `hooks/useApiBaseUrl.ts` para usar la nueva configuración
- Agregados logs de debug con `console.log("[v0] ...")` para verificar la conexión

**Cómo verificar**:
1. Compila el APK con `eas build --profile preview --platform android`
2. Instala el APK en un dispositivo
3. Abre la consola de logs y busca: `✅ Usando API URL: https://opensound.icu`
4. Intenta hacer login y verifica los logs: `🔐 Intentando autenticación en: https://opensound.icu/auth/login`

### 2. ✅ Refactorización de Hooks de Autenticación

**Antes**: `useAuthSession.ts` tenía 85 líneas con múltiples responsabilidades.

**Después**: Dividido en 6 hooks especializados:

\`\`\`
hooks/
├── auth/
│   ├── useAuthPersistence.ts   # Manejo de AsyncStorage
│   ├── useAuthState.ts          # Estado en memoria
│   ├── useAuthActions.ts        # Acciones (login, logout)
│   ├── useAuthRestore.ts        # Restaurar sesión al iniciar
│   ├── useAuthSync.ts           # Sincronizar con AsyncStorage
├── useAuthSession.ts            # Orquestador principal
└── useAuthStorage.ts            # Deprecated, mantiene compatibilidad
\`\`\`

**Beneficios**:
- ✅ Cada hook tiene una responsabilidad única
- ✅ Más fácil de testear
- ✅ Más fácil de mantener
- ✅ Reutilizable en otros contextos

### 3. ✅ Utilidades Compartidas

Creadas carpetas de utilidades:

\`\`\`
utils/
├── token.ts    # Validación y decodificación de JWT
└── url.ts      # Construcción y validación de URLs
\`\`\`

### 4. ✅ Mejoras en Servicios

**`services/auth.ts`**:
- Usa `buildUrl` de utils
- Agregados logs de debug
- Mejor manejo de errores

**`services/backend.ts`**:
- Usa `buildUrl` de utils
- Agregados logs de debug
- Importa desde `hooks/auth/useAuthPersistence.ts`

**`services/api.ts`**:
- Usa `getConfig` para obtener configuración de Jamendo
- Agregados logs de debug

## Próximos Pasos Recomendados

### 1. Eliminar Duplicación de Estado

Actualmente tienes dos sistemas de gestión de estado para autenticación:
- `context/AuthContext.tsx` (React Context)
- `store/authStore.ts` (Zustand)

**Recomendación**: Elimina uno de los dos. Zustand es más moderno y eficiente.

### 2. Refactorizar `context/MusicPlayerContext.tsx`

Este archivo tiene 280+ líneas con múltiples responsabilidades:
- Gestión del reproductor de audio
- Gestión de la cola de reproducción
- Gestión del estado de reproducción
- Gestión de listeners

**Recomendación**: Dividir en hooks especializados similar a lo hecho con autenticación.

### 3. Testing

Agregar tests unitarios para los nuevos hooks:
\`\`\`bash
npm install --save-dev @testing-library/react-hooks jest
\`\`\`

### 4. TypeScript Strict Mode

Habilitar modo estricto en `tsconfig.json`:
\`\`\`json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true
  }
}
\`\`\`

## Cómo Usar los Nuevos Hooks

### Ejemplo: Usar solo persistencia

\`\`\`typescript
import { useAuthPersistence } from "./hooks/auth/useAuthPersistence";

function MyComponent() {
  const { restoreSession, persistSession } = useAuthPersistence();
  
  // ...
}
\`\`\`

### Ejemplo: Usar solo estado

\`\`\`typescript
import { useAuthState } from "./hooks/auth/useAuthState";

function MyComponent() {
  const { user, tokens, setSession } = useAuthState();
  
  // ...
}
\`\`\`

### Ejemplo: Usar todo (recomendado)

\`\`\`typescript
import { useAuthSession } from "./hooks/useAuthSession";

function MyComponent() {
  const { user, token, loading, signIn, signOut } = useAuthSession();
  
  // ...
}
\`\`\`

## Variables de Entorno

### Desarrollo (.env)
\`\`\`env
EXPO_PUBLIC_API_URL=https://opensound.icu
EXPO_PUBLIC_JAMENDO_CLIENT_ID=c8500442
EXPO_PUBLIC_JAMENDO_API_URL=https://api.jamendo.com/v3.0
\`\`\`

### Producción (app.json)
\`\`\`json
{
  "expo": {
    "extra": {
      "apiUrl": "https://opensound.icu",
      "jamendoClientId": "c8500442",
      "jamendoApiUrl": "https://api.jamendo.com/v3.0"
    }
  }
}
\`\`\`

## Debugging

Todos los servicios ahora tienen logs de debug con el prefijo `[v0]`:

- `[v0] 🔐` - Autenticación
- `[v0] 🌐` - Peticiones HTTP
- `[v0] 🎵` - API de Jamendo
- `[v0] ✅` - Operación exitosa
- `[v0] ❌` - Error

Para ver los logs en desarrollo:
\`\`\`bash
npx expo start
# Presiona 'j' para abrir el debugger
\`\`\`

Para ver los logs en producción (APK):
\`\`\`bash
adb logcat | grep "v0"
