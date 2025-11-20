# 🏗️ Arquitectura de Opensound

## Visión General

Opensound es una aplicación React Native construida con Expo que sigue una arquitectura modular y escalable.

## Capas de la Aplicación

### 1. Presentación (UI)

\`\`\`
app/                    # Rutas y pantallas
components/             # Componentes reutilizables
  ├── atoms/           # Componentes básicos (Button, Text, Icon)
  ├── molecules/       # Componentes compuestos (SongCard, SongListItem)
  └── organisms/       # Componentes complejos (MiniReproductor, PlayerModal)
\`\`\`

**Principios**:
- Atomic Design Pattern
- Componentes puros y reutilizables
- Props tipadas con TypeScript
- Separación de lógica y presentación

### 2. Lógica de Negocio

\`\`\`
hooks/                  # Hooks personalizados
  ├── auth/            # Hooks de autenticación
  │   ├── useAuthPersistence.ts    # Persistencia
  │   ├── useAuthState.ts          # Estado
  │   ├── useAuthActions.ts        # Acciones
  │   ├── useAuthRestore.ts        # Restauración
  │   └── useAuthSync.ts           # Sincronización
  ├── useAuthSession.ts            # Orquestador
  └── useConfig.ts                 # Configuración
\`\`\`

**Principios**:
- Single Responsibility Principle
- Hooks composables
- Separación de concerns
- Testeable

### 3. Servicios (API)

\`\`\`
services/
  ├── api.ts           # Cliente Jamendo API
  ├── auth.ts          # Autenticación
  ├── backend.ts       # Cliente HTTP genérico
  └── jamendo.ts       # Servicios de música
\`\`\`

**Principios**:
- Abstracción de APIs externas
- Manejo centralizado de errores
- Retry logic
- Logging

### 4. Estado Global

\`\`\`
store/
  └── authStore.ts     # Estado de autenticación (Zustand)

context/
  ├── AuthContext.tsx          # Contexto de autenticación
  └── MusicPlayerContext.tsx   # Contexto del reproductor
\`\`\`

**Principios**:
- Estado mínimo necesario
- Inmutabilidad
- Acciones tipadas

### 5. Utilidades

\`\`\`
utils/
  ├── token.ts         # Manejo de JWT
  └── url.ts           # Construcción de URLs

types/
  ├── auth.ts          # Tipos de autenticación
  └── json.ts          # Tipos JSON
\`\`\`

## Flujo de Datos

### Autenticación

\`\`\`
┌─────────────┐
│   UI        │
│  (Login)    │
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│ useAuthSession  │ ◄─── Orquestador principal
└────────┬────────┘
         │
         ├──► useAuthState ────────► Estado en memoria
         │
         ├──► useAuthActions ──────► login() / logout()
         │                            │
         │                            ▼
         │                      services/auth.ts
         │                            │
         │                            ▼
         │                      Backend API
         │
         ├──► useAuthPersistence ──► AsyncStorage
         │
         ├──► useAuthRestore ──────► Restaurar al iniciar
         │
         └──► useAuthSync ─────────► Sincronizar cambios
\`\`\`

### Reproducción de Música

\`\`\`
┌─────────────┐
│   UI        │
│ (SongCard)  │
└──────┬──────┘
       │
       ▼
┌──────────────────┐
│ MusicPlayerContext│
└────────┬─────────┘
         │
         ├──► expo-audio ──────► Reproductor nativo
         │
         ├──► Queue ───────────► Cola de reproducción
         │
         └──► State ───────────► isPlaying, currentSong, etc.
\`\`\`

### Búsqueda de Música

\`\`\`
┌─────────────┐
│   UI        │
│  (Search)   │
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│ services/jamendo│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  services/api   │ ◄─── Cliente HTTP Jamendo
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Jamendo API    │
└─────────────────┘
\`\`\`

## Patrones de Diseño

### 1. Composition over Inheritance

Los componentes se componen en lugar de heredar:

\`\`\`tsx
// ❌ Mal
class Button extends BaseButton { }

// ✅ Bien
const Button = ({ icon, children }) => (
  <Pressable>
    {icon && <Icon />}
    <Text>{children}</Text>
  </Pressable>
)
\`\`\`

### 2. Custom Hooks para Lógica Reutilizable

\`\`\`tsx
// Lógica encapsulada en hooks
function useAuthSession() {
  const { user, tokens } = useAuthState()
  const { signIn, signOut } = useAuthActions()
  // ...
  return { user, signIn, signOut }
}
\`\`\`

### 3. Service Layer

Toda la comunicación con APIs externas pasa por servicios:

\`\`\`tsx
// ❌ Mal: fetch directo en componentes
const data = await fetch('https://api.example.com/data')

// ✅ Bien: usar servicios
const data = await http.get('/data')
\`\`\`

### 4. Error Boundaries

Manejo de errores a nivel de componente:

\`\`\`tsx
<ErrorBoundary fallback={<ErrorScreen />}>
  <App />
</ErrorBoundary>
\`\`\`

## Configuración de Entorno

### Desarrollo

Variables de entorno en \`.env\`:

\`\`\`env
EXPO_PUBLIC_API_URL=http://10.0.2.2:4000  # Android emulator
EXPO_PUBLIC_JAMENDO_CLIENT_ID=c8500442
\`\`\`

### Producción

Configuración en \`app.json\`:

\`\`\`json
{
  "expo": {
    "extra": {
      "apiUrl": "https://opensound.icu",
      "jamendoClientId": "c8500442"
    }
  }
}
\`\`\`

El hook \`useConfig\` lee desde:
1. \`process.env\` (desarrollo)
2. \`app.json extra\` (producción)
3. Valores por defecto (fallback)

## Seguridad

### 1. Tokens JWT

- Almacenados en AsyncStorage (encriptado por el OS)
- Incluidos en header \`Authorization: Bearer <token>\`
- Validación de expiración en cliente

### 2. HTTPS

- Todas las peticiones usan HTTPS
- Validación de certificados SSL

### 3. Sanitización

- URLs sanitizadas antes de usar
- Validación de inputs
- Escape de caracteres especiales

## Performance

### 1. Lazy Loading

\`\`\`tsx
const PlayerModal = lazy(() => import('./PlayerModal'))
\`\`\`

### 2. Memoization

\`\`\`tsx
const memoizedValue = useMemo(() => computeExpensiveValue(a, b), [a, b])
\`\`\`

### 3. Virtualized Lists

\`\`\`tsx
<FlatList
  data={songs}
  renderItem={renderSong}
  windowSize={10}
/>
\`\`\`

## Testing

### Unit Tests

\`\`\`bash
# Hooks
npm test hooks/auth/useAuthState.test.ts

# Utilidades
npm test utils/token.test.ts
\`\`\`

### Integration Tests

\`\`\`bash
# Flujos completos
npm test integration/auth-flow.test.ts
\`\`\`

### E2E Tests

\`\`\`bash
# Detox
npm run e2e:ios
npm run e2e:android
\`\`\`

## Deployment

### Android

\`\`\`bash
# Preview (APK)
eas build --profile preview --platform android

# Production (AAB)
eas build --profile production --platform android
\`\`\`

### iOS

\`\`\`bash
# Preview
eas build --profile preview --platform ios

# Production
eas build --profile production --platform ios
\`\`\`

## Monitoreo

### Logs

Todos los logs usan el prefijo \`[v0]\`:

\`\`\`typescript
console.log('[v0] 🔐 Autenticación exitosa')
console.error('[v0] ❌ Error en API')
\`\`\`

### Analytics

- Eventos de usuario
- Errores de aplicación
- Performance metrics

## Próximos Pasos

1. ✅ Refactorizar MusicPlayerContext
2. ✅ Agregar tests unitarios
3. ✅ Implementar error boundaries
4. ✅ Agregar analytics
5. ✅ Optimizar performance
\`\`\`
