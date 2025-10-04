# OpenSound — Contexto del Proyecto

## Resumen general
OpenSound es una aplicación móvil construida con Expo Router que permite descubrir y reproducir música proveniente de Jamendo. La interfaz principal vive en la pestaña de inicio y consume datos remotos para poblar carruseles y listados de canciones. La navegación está organizada en grupos de rutas para autenticación (`app/(auth)`) y pestañas principales (`app/(tabs)`), además de una pantalla de perfil dedicada (`app/profile.tsx`).

## Flujo de autenticación y manejo de sesión
- `context/AuthContext.tsx` define el `AuthProvider`, encapsulando el estado global de usuario y token y exponiendo métodos `signIn` y `signOut`. El contexto persiste la sesión en `AsyncStorage` utilizando las llaves `@opensound/token` y `@opensound/user`, y restaura la sesión en el arranque de la aplicación.
- `services/auth.ts` simula el inicio de sesión cuando no existe un `EXPO_PUBLIC_API_URL`, devolviendo un token temporal y un usuario derivado del correo electrónico. En un escenario real, este módulo delega en una API REST (`/auth/login`).
- `store/authStore.ts` gestiona el estado base con Zustand. El método `register` simula la creación de cuentas y devuelve la sesión generada para que el contexto pueda detectar el alta y persistirla igual que el login.
- `app/_layout.tsx` supervisa los segmentos de ruta activos. Si no existe sesión, redirige a `/(auth)/login`. Si el usuario ya está autenticado y navega al grupo `(auth)`, se le envía a `/profile`, cumpliendo con el flujo solicitado.
- `app/(auth)/login.tsx` consume `signIn` y, tras persistir la sesión, redirige a `/(tabs)`.
- `app/(auth)/register.tsx` utiliza `useAuthStore().register` para simular el alta de usuario y, tras el éxito, redirige a `/(tabs)` mientras el `AuthProvider` se encarga de persistir la sesión en `AsyncStorage`.
- `app/(tabs)/index.tsx` expone un botón «Cerrar sesión» que invoca `signOut()`; este método limpia tanto el estado global como los valores en `AsyncStorage` y devuelve al usuario al login.

## Flujo de navegación en la aplicación
- El `Stack` principal se declara en `app/_layout.tsx` con tres entradas: `(auth)`, `(tabs)` y `profile`. Las cabeceras están ocultas para que cada pantalla gestione su propio encabezado.
- El botón de perfil dentro del header de `app/(tabs)/index.tsx` lleva a `/profile` cuando existe un token; de lo contrario redirige a `/(auth)/login`.
- Las secciones de Biblioteca y Búsqueda (`app/(tabs)/library` y `app/(tabs)/search`) reutilizan el mismo encabezado para ingresar a la pantalla de perfil.

## Flujo del reproductor de audio
- `context/MusicPlayerContext.tsx` abstrae el uso de `expo-audio` para manejar una cola de reproducción, controles de play/pause, y la carga de pistas provenientes de Jamendo.
- `services/jamendo.ts` provee helpers (`getRecentSongs`, `searchSongs`) que alimentan la lista y el carrusel de canciones recientes y filtradas.
- Componentes como `components/organisms/PlayerModal.tsx` y `MiniReproductor.tsx` consumen el contexto de audio para mostrar estado y controles.

## Datos del usuario y tokens
- El tipo `AuthUser` (`types/auth.ts`) incluye identificador, correo, nombre opcional, avatar opcional y rol.
- El tipo `AuthTokens` modela el token principal y un `refreshToken` opcional para futuros escenarios.
- Las llaves de almacenamiento compartidas (`AUTH_TOKEN_STORAGE_KEY`, `AUTH_USER_STORAGE_KEY`) se exportan desde `AuthContext` para evitar duplicar valores.

## Pasos sugeridos para conectar con un backend real
1. **Definir variables de entorno**: establecer `EXPO_PUBLIC_API_URL` en `app.config` o `.env` para apuntar al backend.
2. **Implementar endpoints reales**: sustituir la simulación de `services/auth.ts` por llamadas efectivas a `/auth/login` y `/auth/register`, manejando estados de error y mensajes desde la API.
3. **Persistencia de registro**: reemplazar la simulación de `register` en `store/authStore.ts` por peticiones HTTP. El método debería devolver tokens reales y manejar refresh tokens si el backend los provee.
4. **Proteger rutas**: si se agregan rutas adicionales, utilizar `useSegments` para protegerlas según el rol del usuario (p. ej. `admin`).
5. **Gestión del token**: incorporar lógica de expiración/renovación en `AuthContext` utilizando `refreshToken` cuando esté disponible.
6. **Sincronización del perfil**: crear un servicio (`services/user.ts`) que consulte el perfil actual desde el backend y refresque la información guardada en `AsyncStorage`.
7. **Errores globales**: centralizar el manejo de errores y notificaciones (snackbars o modals) para informar problemas de red o autenticación caducada.

## Estructura del proyecto
```text
./
├── app/
│   ├── (auth)/
│   │   ├── _layout.tsx
│   │   ├── login.tsx
│   │   └── register.tsx
│   ├── (tabs)/
│   │   ├── _layout.tsx
│   │   ├── index.tsx
│   │   ├── library/
│   │   │   ├── _layout.tsx
│   │   │   └── library.tsx
│   │   └── search/
│   │       ├── _layout.tsx
│   │       └── search.tsx
│   ├── _layout.tsx
│   └── profile.tsx
├── assets/
├── components/
│   ├── atoms/
│   ├── molecules/
│   └── organisms/
├── context/
├── services/
├── store/
├── types/
├── PROJECT_CONTEXT.md
├── README.md
├── package.json
└── tsconfig.json
```
