"use client";

import { useCallback, useState } from "react";
import type { AuthUser } from "../../types/auth";

export type AuthTokens = {
  token: string;
};

export type AuthSession = {
  user: AuthUser;
  tokens: AuthTokens;
};

/**
 * Hook para manejar el estado de autenticación en memoria
 * Separado de la lógica de persistencia y de negocio
 */
export function useAuthState() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [tokens, setTokens] = useState<AuthTokens | null>(null);
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const setSession = useCallback((session: AuthSession) => {
    setUser(session.user);
    setTokens(session.tokens);
    setLoginError(null);
  }, []);

  const clearSession = useCallback(() => {
    setUser(null);
    setTokens(null);
  }, []);

  return {
    user,
    tokens,
    loading,
    loginError,
    setLoading,
    setSession,
    clearSession,
    setLoginError,
  };
}
