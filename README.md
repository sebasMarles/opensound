# 🎵 Opensound

Aplicación de música streaming construida con React Native y Expo.

## 🚀 Características

- 🎧 Reproducción de música desde Jamendo API
- 👤 Sistema de autenticación con backend propio
- 📱 Diseño responsive para iOS y Android
- 🔍 Búsqueda de canciones
- 📚 Biblioteca personal
- 🎨 Interfaz moderna con NativeWind (Tailwind CSS)
- 📳 Respuestas hápticas para mejorar la experiencia táctil del usuario
- 🔔 Sistema de notificaciones push usando Expo Notifications y Expo Push Service

## 📋 Requisitos Previos

- Node.js 18+
- pnpm (recomendado) o npm
- Expo CLI
- Cuenta de Expo (para builds)

## 🛠️ Instalación

\`\`\`bash
# Instalar dependencias
pnpm install

# Iniciar en modo desarrollo
pnpm start

# Iniciar en Android
pnpm android

# Iniciar en iOS
pnpm ios
\`\`\`

## 🔧 Configuración

### Variables de Entorno

Crea un archivo \`.env\` en la raíz del proyecto:

\`\`\`env
EXPO_PUBLIC_API_URL=https://opensound.icu
EXPO_PUBLIC_JAMENDO_CLIENT_ID=c8500442
EXPO_PUBLIC_JAMENDO_API_URL=https://api.jamendo.com/v3.0
\`\`\`

### Configuración de Producción

Las variables de producción están configuradas en \`app.json\` bajo \`extra\`:

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

## 📦 Build de Producción

### Android APK

\`\`\`bash
# Build de preview (APK)
eas build --profile preview --platform android

# Build de producción (AAB para Play Store)
eas build --profile production --platform android
\`\`\`

### iOS

\`\`\`bash
# Build de preview
eas build --profile preview --platform ios

# Build de producción
eas build --profile production --platform ios
\`\`\`

## 🏗️ Estructura del Proyecto

\`\`\`
opensound/
├── app/                      # Rutas de Expo Router
│   ├── (auth)/              # Pantallas de autenticación
│   ├── (tabs)/              # Pantallas principales con tabs
│   └── _layout.tsx          # Layout raíz
├── components/              # Componentes reutilizables
│   ├── atoms/               # Componentes básicos
│   ├── molecules/           # Componentes compuestos
│   └── organisms/           # Componentes complejos
├── context/                 # Contextos de React
├── hooks/                   # Hooks personalizados
│   ├── auth/                # Hooks de autenticación
│   └── usePushNotifications.ts # Hook para gestionar notificaciones
├── services/                # Servicios de API
│   └── notifications.ts     # Servicio de notificaciones push
├── store/                   # Estado global (Zustand)
├── types/                   # Tipos de TypeScript
└── utils/                   # Utilidades
\`\`\`

## 🔐 Autenticación

La app usa un sistema de autenticación basado en JWT:

1. El usuario se registra o inicia sesión
2. El backend devuelve un token JWT
3. El token se guarda en AsyncStorage
4. Todas las peticiones autenticadas incluyen el token en el header \`Authorization\`

## 🎵 API de Música

La app usa la API de Jamendo para obtener música:

- Búsqueda de canciones
- Canciones populares
- Información de artistas
- Streaming de audio

## 🔔 Sistema de Notificaciones Push

Opensound incluye un sistema completo de notificaciones push usando Expo Notifications y Expo Push Service.

### Características

- **Registro automático**: Los tokens de dispositivo se registran automáticamente al abrir la app
- **Notificaciones por rol**: Los administradores pueden enviar notificaciones a usuarios específicos o por rol
- **Dispositivos físicos**: Solo funciona en dispositivos físicos (no emuladores)
- **Gestión de tokens**: Cada usuario puede tener múltiples dispositivos registrados

### Configuración

#### Frontend (ya implementado)
1. El token se registra automáticamente en `app/_layout.tsx` usando el hook `usePushNotifications`
2. Se verifican permisos del usuario antes de registrar
3. Se valida que sea un dispositivo físico

#### Backend (debe implementarse)
Consulta el prompt para el backend incluido en el código que describe:
- Modelo de PushToken con relación a usuarios y roles
- Rutas para registrar/desregistrar tokens
- Servicio de notificaciones para enviar push
- Integración con Expo Push Service

### Uso

**Registro automático**
\`\`\`typescript
// Se ejecuta automáticamente al abrir la app si hay sesión activa
usePushNotifications()
\`\`\`

**Enviar notificación (desde el backend)**
\`\`\`javascript
// Enviar a un usuario específico
await notificationService.sendToUser(userId, {
  title: "Nueva canción",
  body: "Tu artista favorito subió una nueva canción",
  data: { playlistId: "123" }
});

// Enviar a todos los admins
await notificationService.sendToRole("admin", {
  title: "Nuevo usuario registrado",
  body: "Un nuevo usuario se ha registrado en la plataforma"
});
\`\`\`

### Archivos clave

- `services/notifications.ts` - Servicio de notificaciones push
- `hooks/usePushNotifications.ts` - Hook para gestionar notificaciones
- `app/_layout.tsx` - Registro automático al iniciar la app

### Testing

Para probar las notificaciones:
1. Ejecuta la app en un dispositivo físico
2. Acepta los permisos de notificaciones
3. Desde el backend, usa la ruta `POST /notifications/test` para enviar una notificación de prueba

## 📳 Respuestas Hápticas

La app implementa feedback háptico en todas las interacciones principales usando `expo-haptics` para mejorar la experiencia táctil del usuario.

### Tipos de Feedback Implementados

#### 1. **Light Impact** (Vibración ligera)
Usado para acciones de navegación y selección:
- Abrir menú de opciones (3 puntos)
- Navegar a perfil de usuario
- Abrir playlists
- Crear nueva playlist
- Cerrar modales

**Archivos afectados:**
- `app/(tabs)/index.tsx` - Pantalla principal
- `app/(tabs)/search/search.tsx` - Búsqueda
- `app/(tabs)/library/library.tsx` - Biblioteca
- `app/playlist-detail.tsx` - Detalle de playlist

#### 2. **Medium Impact** (Vibración media)
Usado para acciones de reproducción:
- Reproducir canción
- Cambiar de canción

**Archivos afectados:**
- `app/(tabs)/index.tsx` - Reproducir desde pantalla principal
- `app/(tabs)/search/search.tsx` - Reproducir desde búsqueda
- `app/playlist-detail.tsx` - Reproducir desde playlist

#### 3. **Heavy Impact** (Vibración intensa)
Usado para controles del reproductor:
- Play/Pause
- Siguiente canción
- Canción anterior

**Archivos afectados:**
- `components/organisms/PlayerModal.tsx` - Reproductor principal

#### 4. **Success Notification** (Notificación de éxito)
Usado para confirmar acciones completadas:
- Agregar canción a playlist
- Dar like a una canción
- Crear playlist exitosamente

**Archivos afectados:**
- `components/modals/AddToPlaylistModal.tsx` - Agregar a playlist
- `components/modals/SongOptionsModal.tsx` - Opciones de canción
- `components/organisms/PlayerModal.tsx` - Like desde reproductor

#### 5. **Warning Notification** (Notificación de advertencia)
Usado para acciones destructivas:
- Eliminar canción de playlist
- Quitar like de una canción

**Archivos afectados:**
- `app/playlist-detail.tsx` - Eliminar desde playlist
- `components/modals/SongOptionsModal.tsx` - Eliminar desde opciones
- `components/organisms/PlayerModal.tsx` - Unlike desde reproductor

#### 6. **Error Notification** (Notificación de error)
Usado cuando una operación falla:
- Error al crear playlist
- Error al agregar canción

**Archivos afectados:**
- `components/modals/AddToPlaylistModal.tsx` - Errores de playlist

### Implementación

Ejemplo de uso en el código:

\`\`\`typescript
import * as Haptics from 'expo-haptics';

// Vibración ligera para navegación
const handleOpenMenu = () => {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  // ... lógica
};

// Vibración media para reproducción
const handlePlaySong = () => {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  // ... lógica
};

// Notificación de éxito
const handleSuccess = async () => {
  await someAction();
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
};
\`\`\`

### Beneficios

- **Feedback inmediato**: El usuario siente respuesta instantánea a cada acción
- **Confirmación táctil**: Refuerza visualmente las acciones completadas
- **Navegación intuitiva**: Ayuda a diferenciar tipos de interacciones
- **Accesibilidad**: Proporciona retroalimentación adicional para usuarios con discapacidad visual

## 📱 Características Técnicas

- **Framework**: React Native + Expo
- **Routing**: Expo Router (file-based routing)
- **Styling**: NativeWind (Tailwind CSS para React Native)
- **Estado Global**: Zustand
- **Almacenamiento**: AsyncStorage
- **Audio**: expo-audio
- **TypeScript**: Tipado estricto

## 🐛 Debugging

La app incluye logs de debug con el prefijo \`[v0]\`:

- \`[v0] 🔐\` - Autenticación
- \`[v0] 🌐\` - Peticiones HTTP
- \`[v0] 🎵\` - API de Jamendo
- \`[v0] ✅\` - Operación exitosa
- \`[v0] ❌\` - Error

Para ver los logs:

\`\`\`bash
# En desarrollo
npx expo start
# Presiona 'j' para abrir el debugger

# En producción (Android)
adb logcat | grep "v0"
\`\`\`

## 📚 Documentación Adicional

- [Refactorización de Hooks](./docs/REFACTORING.md)
- [Expo Router Docs](https://docs.expo.dev/router/introduction/)
- [NativeWind Docs](https://www.nativewind.dev/)

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (\`git checkout -b feature/AmazingFeature\`)
3. Commit tus cambios (\`git commit -m 'Add some AmazingFeature'\`)
4. Push a la rama (\`git push origin feature/AmazingFeature\`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto es privado y pertenece a Sebastian Marles.

## 👤 Autor

**Sebastian Marles**
- GitHub: [@sebastianmarles](https://github.com/sebastianmarles)

## 🙏 Agradecimientos

- [Jamendo](https://www.jamendo.com/) por la API de música
- [Expo](https://expo.dev/) por el framework
- [Vercel](https://vercel.com/) por el hosting del backend
