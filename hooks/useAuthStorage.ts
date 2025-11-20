/**
 * @deprecated Este archivo se mantiene por compatibilidad
 * Usa hooks/auth/useAuthPersistence.ts en su lugar
 */
export {
  useAuthPersistence as useAuthStorage,
  AUTH_TOKEN_STORAGE_KEY,
  AUTH_USER_STORAGE_KEY,
  extractTokenFromStorageValue,
  type StoredSession,
} from "./auth/useAuthPersistence"
