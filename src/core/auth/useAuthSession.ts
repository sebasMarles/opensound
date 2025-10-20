import { useCallback, useEffect, useMemo, useState } from "react";
import { ensureAuthUser, login } from "./authService";
import { useAuthStore } from "./authStore";
import { useAuthStorage } from "./authStorage";

export type SignInPayload = {
  email: string;
  password: string;
};

// Maneja el ciclo de vida de la sesión y expone helpers de inicio/cierre de sesión.
export function useAuthSession() {
  const { user, tokens, setSession, clearSession } = useAuthStore();
  const { restoreSession, persistSession, clearSessionStorage } = useAuthStorage();
  const [loading, setLoading] = useState(false);
  const [restoring, setRestoring] = useState(true);
  const token = tokens?.token ?? null;

  useEffect(() => {
    (async () => {
      try {
        const stored = await restoreSession();
        if (stored) {
          setSession({ user: stored.user, tokens: { token: stored.token } });
        }
      } catch (error) {
        console.warn("No se pudo restaurar la sesión", error);
      } finally {
        setRestoring(false);
      }
    })();
  }, [restoreSession, setSession]);

  useEffect(() => {
    if (restoring) return;
    if (!user || !token) return;

    persistSession(user, token).catch((error) => {
      console.warn("No se pudo guardar la sesión", error);
    });
  }, [persistSession, restoring, token, user]);

  const handleSignIn = useCallback(
    async ({ email, password }: SignInPayload) => {
      setLoading(true);
      try {
        const { token: nextToken, user: incomingUser } = await login({ email, password });

        if (!nextToken) {
          throw new Error("No se recibió un token válido");
        }

        const ensuredUser = ensureAuthUser(incomingUser, email);
        setSession({ user: ensuredUser, tokens: { token: nextToken } });
        await persistSession(ensuredUser, nextToken);
      } finally {
        setLoading(false);
      }
    },
    [persistSession, setSession],
  );

  const handleSignOut = useCallback(async () => {
    setLoading(true);
    try {
      clearSession();
      await clearSessionStorage();
    } finally {
      setLoading(false);
    }
  }, [clearSession, clearSessionStorage]);

  return useMemo(
    () => ({
      user,
      token,
      loading: loading || restoring,
      signIn: handleSignIn,
      signOut: handleSignOut,
    }),
    [handleSignIn, handleSignOut, loading, restoring, token, user],
  );
}
