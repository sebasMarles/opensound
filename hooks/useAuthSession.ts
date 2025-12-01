"use client";

import { useMemo } from "react";
import { useAuthPersistence } from "./auth/useAuthPersistence";
import { useAuthState } from "./auth/useAuthState";
import { useAuthActions } from "./auth/useAuthActions";
import { useAuthRestore } from "./auth/useAuthRestore";
import { useAuthSync } from "./auth/useAuthSync";

export type { SignInPayload } from "./auth/useAuthActions";

/**
 * Hook principal de autenticación
 * Orquesta los diferentes hooks especializados
 */
export function useAuthSession() {
  // Persistencia
  const { restoreSession, persistSession, clearSessionStorage } =
    useAuthPersistence();

  // Estado
  const {
    user,
    tokens,
    loading,
    loginError,
    setLoading,
    setSession,
    clearSession,
    setLoginError,
  } = useAuthState();

  // Restaurar sesión al iniciar
  const { restoring } = useAuthRestore({ restoreSession, setSession });

  // Sincronizar cambios con AsyncStorage
  const token = tokens?.token ?? null;
  useAuthSync({ user, token, restoring, persistSession });

  // Acciones
  const { signIn, signOut, updateUser } = useAuthActions({
    setLoading,
    setSession,
    clearSession,
    persistSession,
    clearSessionStorage,
    setLoginError,
    token,
  });

  return useMemo(
    () => ({
      user,
      token,
      loading: loading || restoring,
      loginError,
      clearLoginError: () => setLoginError(null),
      signIn,
      signOut,
      updateUser,
    }),
    [
      loading,
      restoring,
      loginError,
      signIn,
      signOut,
      updateUser,
      token,
      user,
      setLoginError,
    ]
  );
}
