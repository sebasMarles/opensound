import { useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { AuthUser } from "@/types/auth";

export const AUTH_TOKEN_STORAGE_KEY = "@opensound/token";
export const AUTH_USER_STORAGE_KEY = "@opensound/user";

export type StoredSession = {
  token: string;
  user: AuthUser;
};

export function extractTokenFromStorageValue(value: string | null): string | null {
  if (!value) return null;

  try {
    const parsed = JSON.parse(value);

    if (typeof parsed === "string") {
      return parsed;
    }

    if (parsed && typeof parsed === "object" && typeof parsed.token === "string") {
      return parsed.token;
    }
  } catch {
    // El valor no es JSON, usamos el string crudo
    return value;
  }

  return null;
}

async function readStoredUser(value: string | null): Promise<AuthUser | null> {
  if (!value) return null;

  try {
    const parsed = JSON.parse(value);
    if (parsed && typeof parsed === "object") {
      return parsed as AuthUser;
    }
  } catch {
    // No se pudo parsear el usuario almacenado
  }

  return null;
}

// Hook con utilidades para persistir/restaurar sesiones en AsyncStorage.
export function useAuthStorage() {
  const restoreSession = useCallback(async (): Promise<StoredSession | null> => {
    const [rawToken, rawUser] = await Promise.all([
      AsyncStorage.getItem(AUTH_TOKEN_STORAGE_KEY),
      AsyncStorage.getItem(AUTH_USER_STORAGE_KEY),
    ]);

    const token = extractTokenFromStorageValue(rawToken);
    const user = await readStoredUser(rawUser);

    if (token && user) {
      return { token, user };
    }

    return null;
  }, []);

  const persistSession = useCallback(async (user: AuthUser, token: string) => {
    await Promise.all([
      AsyncStorage.setItem(
        AUTH_TOKEN_STORAGE_KEY,
        JSON.stringify({ token }),
      ),
      AsyncStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(user)),
    ]);
  }, []);

  const clearSessionStorage = useCallback(async () => {
    await Promise.all([
      AsyncStorage.removeItem(AUTH_TOKEN_STORAGE_KEY),
      AsyncStorage.removeItem(AUTH_USER_STORAGE_KEY),
    ]);
  }, []);

  return {
    restoreSession,
    persistSession,
    clearSessionStorage,
  };
}
