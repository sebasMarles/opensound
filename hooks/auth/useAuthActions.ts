"use client";

import { useCallback } from "react";
import { login, ensureAuthUser } from "../../services/auth";
import type { AuthUser } from "../../types/auth";

export type SignInPayload = {
  email: string;
  password: string;
};

type UseAuthActionsParams = {
  setLoading: (loading: boolean) => void;
  setSession: (session: { user: AuthUser; tokens: { token: string } }) => void;
  clearSession: () => void;
  persistSession: (user: AuthUser, token: string) => Promise<void>;
  clearSessionStorage: () => Promise<void>;
  setLoginError: (error: string | null) => void;
};

/**
 * Hook para manejar las acciones de autenticación (login, logout)
 * Separado del estado y la persistencia
 */
export function useAuthActions({
  setLoading,
  setSession,
  clearSession,
  persistSession,
  clearSessionStorage,
  setLoginError,
}: UseAuthActionsParams) {
  const handleSignIn = useCallback(
    async ({ email, password }: SignInPayload) => {
      setLoading(true);
      setLoginError(null);

      try {
        const { token: nextToken, user: incomingUser } = await login({
          email,
          password,
        });

        if (!nextToken) {
          throw new Error("No se recibió un token válido");
        }

        const ensuredUser = ensureAuthUser(incomingUser, email);
        setSession({ user: ensuredUser, tokens: { token: nextToken } });
        await persistSession(ensuredUser, nextToken);
        setLoading(false);
      } catch (error) {
        setLoading(false);
        const message =
          error instanceof Error ? error.message : "Error al iniciar sesión";
        setLoginError(message);
      }
    },
    [persistSession, setLoading, setSession, setLoginError]
  );

  const handleSignOut = useCallback(async () => {
    setLoading(true);
    try {
      clearSession();
      await clearSessionStorage();
    } finally {
      setLoading(false);
    }
  }, [clearSession, clearSessionStorage, setLoading]);

  return {
    signIn: handleSignIn,
    signOut: handleSignOut,
  };
}
