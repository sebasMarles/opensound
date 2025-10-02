# Prompt for opensound-api Backend Setup

Quiero que analices este repositorio (abre la carpeta raíz) y construyas un backend completo en **Node.js con TypeScript** usando **Express** y **Mongoose**. El proyecto está vacío, así que debes crear toda la estructura necesaria para exponer una API REST pública que se conecte con una base de datos **MongoDB Atlas** cuyo cluster tiene una base de datos llamada `opensound`.

## Requisitos generales
- Configura TypeScript, ts-node, nodemon para desarrollo y scripts en `package.json` (`dev`, `build`, `start`).
- Añade ESLint + Prettier con reglas básicas y scripts `lint` y `format`.
- Crea un archivo `tsconfig.json` adecuado para un backend en Node 18.
- Usa `dotenv` para cargar variables de entorno desde `.env` y publica un `.env.example` con claves:
  - `PORT`
  - `MONGODB_URI` (cadena de conexión a Mongo Atlas apuntando a la base `opensound`)
  - `JWT_SECRET`
  - `JWT_REFRESH_SECRET`
  - `ACCESS_TOKEN_TTL`
  - `REFRESH_TOKEN_TTL`
  - `CORS_ORIGINS`
- Configura Husky o al menos npm scripts para validar lint/test en CI.

## Conexión a MongoDB
- Usa Mongoose para conectarte a `process.env.MONGODB_URI` y asegúrate de manejar reconexiones y logs.
- Define modelos y esquemas para `User`, `Playlist` y `RefreshToken` alineados con los datos que consume la app móvil:
  - `User`: email único, passwordHash, name, avatar opcional, timestamps.
  - `Playlist`: name, description, isPublic, coverImage, userId (ObjectId ref a User), tracks (array de objetos `{ trackId, name, artist, imageUrl, duration }`), timestamps.
  - `RefreshToken`: token, userId, expiresAt, createdAt, userAgent/opcional.

## Estructura del proyecto
- Organiza el código en carpetas `src/config`, `src/database`, `src/modules/auth`, `src/modules/playlists`, `src/middleware`, `src/utils`.
- Implementa DTOs con Zod o class-validator para validar entradas.
- Usa controladores Express separados por módulo y rutas versionadas bajo `/api/v1`.

## Autenticación
- Implementa registro y login con hashing de contraseñas usando `bcrypt`.
- Emite JWTs de acceso (exp corta) y refresh tokens (exp larga). Firma cada uno con sus secretos respectivos.
- Guarda los refresh tokens en la colección `RefreshToken` para permitir revocación.
- Endpoints requeridos:
  - `POST /api/v1/auth/register`
  - `POST /api/v1/auth/login`
  - `POST /api/v1/auth/refresh`
  - `POST /api/v1/auth/logout`
  - `GET /api/v1/auth/me`
  - `PUT /api/v1/auth/profile`
  - `PUT /api/v1/auth/change-password`
- Las respuestas deben seguir la interfaz esperada por el cliente móvil (`AuthResponse` con `token`, `refreshToken`, `expiresIn`, `user`).

## Playlists
- Protege las rutas con middleware JWT (excepto las públicas).
- Endpoints necesarios:
  - `GET /api/v1/playlists` (filtra por usuario autenticado por defecto, permite `?userId=` opcional).
  - `POST /api/v1/playlists`
  - `GET /api/v1/playlists/:id`
  - `PUT /api/v1/playlists/:id`
  - `DELETE /api/v1/playlists/:id`
  - `POST /api/v1/playlists/:id/tracks`
  - `DELETE /api/v1/playlists/:id/tracks/:trackId`
  - `PUT /api/v1/playlists/:id/reorder`
  - `GET /api/v1/playlists/public`
  - `GET /api/v1/playlists/search`
- Asegúrate de validar propiedad (solo el dueño puede editar/borrar) y convierte `_id` a `id` en las respuestas.

## Utilidades adicionales
- Configura manejo de errores global con middlewares Express y respuestas JSON uniformes.
- Implementa logging básico (p. ej. `pino` o `morgan`).
- Añade pruebas unitarias con Jest para servicios críticos (auth y playlists) usando `mongodb-memory-server`.
- Documenta la API con Swagger (`swagger-ui-express`) en `/docs`.

## CORS y seguridad
- Configura CORS para permitir el dominio móvil `https://opensound.icu` y `exp://` durante desarrollo.
- Sanitiza entradas y usa Helmet para seguridad básica.

## README
- Redacta un README que explique cómo instalar dependencias, configurar variables de entorno, correr el servidor y ejecutar pruebas.
- Incluye instrucciones de despliegue en AWS (Elastic Beanstalk o ECS) y cómo vincular el dominio `opensound.icu`.

Al finalizar, haz un recorrido del código agregando comentarios si lo crees necesario para facilitar el onboarding. El resultado debe ser un backend funcional listo para conectarse con la app móvil `opensound` que ya consume estos endpoints.
