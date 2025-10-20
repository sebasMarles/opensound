# Conexión del frontend con el backend de OpenSound

Este documento explica cómo enlazar el nuevo CRUD de playlists y el resto de peticiones del frontend con un backend sencillo desplegado en cualquier hosting (por ejemplo una instancia EC2 o un servicio serverless). Sigue cada paso en orden para evitar errores de configuración.

## 1. Configurar la URL base del backend

1. Asegúrate de que tu backend expone HTTPS en el dominio que se va a consumir. El código del cliente utiliza `https://opensound.icu` como valor por defecto.
2. Si necesitas apuntar a otra instancia (por ejemplo un entorno de pruebas), define la variable `EXPO_PUBLIC_API_URL` en tu entorno de Expo:
   ```bash
   # En Linux/macOS
   export EXPO_PUBLIC_API_URL="https://tu-dominio.com"

   # En Windows (PowerShell)
   $Env:EXPO_PUBLIC_API_URL="https://tu-dominio.com"
   ```
3. Puedes añadir esta variable a un archivo `.env` y cargarlo con tu gestor de procesos preferido. El helper `getApiBaseUrl` en `src/hooks/useApiBaseUrl.ts` normaliza la URL y elimina barras finales duplicadas.

## 2. Autenticación: rutas y formato esperado

Las peticiones de autenticación se encuentran en `src/core/auth/authService.ts`:

- `POST /auth/register` → debe recibir `{ name, email, password }` y responder `{ token, user }`.
- `POST /auth/login` → debe recibir `{ email, password }` y responder `{ token, user }`.

La estructura mínima de `user` es:

```json
{
  "id": "uuid-o-correo",
  "name": "Nombre visible",
  "email": "correo@dominio.com",
  "role": "usuario" // opcional
}
```

El token JWT (o similar) se persiste automáticamente en `AsyncStorage` mediante `authStorage`. Asegúrate de devolver un `token` válido y un usuario. Si tu backend necesita un refresh token puedes ampliar la interfaz `AuthTokens` en `src/types/auth.ts`.

## 3. Cabeceras de autenticación en el cliente

El cliente HTTP genérico (`src/core/api/httpClient.ts`) añade el encabezado `Authorization: Bearer <token>` a todas las peticiones cuando existe sesión activa. No necesitas modificar cada petición manualmente: basta con que el backend valide dicho encabezado.

## 4. Endpoints para el CRUD de playlists

El módulo `src/features/playlists/api/playlistApi.ts` consume las siguientes rutas REST, todas autenticadas:

| Método | Ruta                               | Cuerpo esperado                      | Respuesta |
|--------|------------------------------------|--------------------------------------|-----------|
| GET    | `/playlists`                       | —                                    | `Playlist[]`
| POST   | `/playlists`                       | `{ name, description, isPublic }`    | `Playlist`
| PUT    | `/playlists/:id`                   | `{ name, description, isPublic }`    | `Playlist`
| DELETE | `/playlists/:id`                   | —                                    | `{}` o `204`
| POST   | `/playlists/:id/tracks`            | `{ trackId }`                        | `Playlist` actualizada |
| DELETE | `/playlists/:id/tracks/:trackId`   | —                                    | `Playlist` actualizada |

La interfaz `Playlist` utilizada en el front se declara en `src/features/playlists/types.ts` y requiere los siguientes campos:

```ts
type Playlist = {
  id: string;
  name: string;
  description: string;
  isPublic: boolean;
  coverImage?: string | null; // URL opcional
  trackCount: number;         // número de canciones
  createdAt: string;          // ISO 8601
  updatedAt: string;          // ISO 8601
};
```

Si tu backend devuelve más campos, el frontend los ignorará; asegúrate solamente de respetar los existentes.

## 5. Respuestas y manejo de errores

- Todas las rutas deben devolver código de estado HTTP estándar (200/201 para éxitos, 204 para borrados sin cuerpo, 4xx/5xx para errores).
- Cuando ocurra un error, envía un JSON con `message` o `error`; el cliente lo mostrará al usuario.
- Evita respuestas vacías en solicitudes `POST`/`PUT`; el frontend actualiza su estado con el objeto `Playlist` recibido.

## 6. Habilitar CORS y certificados

- Si desarrollas localmente, habilita CORS para el origen `exp://` o `http://localhost` según el modo de Expo.
- En producción es obligatorio tener un certificado TLS válido (Let’s Encrypt es suficiente). Expo rechazará solicitudes a dominios inseguros.

## 7. Sincronización con Jamendo

Las búsquedas de canciones (`searchSongs`) y las listas recientes (`getRecentSongs`) siguen consultando la API de Jamendo (`https://api.jamendo.com/v3.0`). No es necesario configurar nada en tu backend para estas llamadas, pero puedes almacenar sus resultados si deseas crear endpoints propios.

## 8. Probar la integración

1. Inicia el backend y verifica manualmente cada ruta con `curl` o `Postman`.
2. Ejecuta `npm start` en el proyecto Expo y abre la aplicación.
3. Regístrate, inicia sesión y crea/edita/elimina playlists; confirma en los logs del backend que las peticiones llegan correctamente.
4. Si modificas el dominio o variables de entorno, reinicia Expo para que lea los valores actualizados.

Siguiendo estos pasos el frontend quedará conectado a tu backend y listo para gestionar usuarios y playlists en tiempo real.
