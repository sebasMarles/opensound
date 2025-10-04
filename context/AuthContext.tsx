import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { AuthUser } from "../types/auth";
import { useAuthStore } from "../store/authStore";
import { login } from "../services/auth";

export const AUTH_TOKEN_STORAGE_KEY = "@opensound/token";
export const AUTH_USER_STORAGE_KEY = "@opensound/user";

type SignInPayload = {
  email: string;
  password: string;
};

type AuthContextType = {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  signIn: (credentials: SignInPayload) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { user, tokens, setSession, clearSession } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [restoring, setRestoring] = useState(true);
  const authToken = tokens?.token ?? null;

  useEffect(() => {
    (async () => {
      try {
        const [storedToken, storedUser] = await Promise.all([
          AsyncStorage.getItem(AUTH_TOKEN_STORAGE_KEY),
          AsyncStorage.getItem(AUTH_USER_STORAGE_KEY),
        ]);

        if (storedToken && storedUser) {
          const parsedUser: AuthUser = JSON.parse(storedUser);
          setSession({ user: parsedUser, tokens: { token: storedToken } });
        }
      } catch (error) {
        console.warn("No se pudo restaurar la sesión", error);
      } finally {
        setRestoring(false);
      }
    })();
  }, [setSession]);

  useEffect(() => {
    if (restoring) return;
    if (!user || !authToken) return;

    Promise.all([
      AsyncStorage.setItem(AUTH_TOKEN_STORAGE_KEY, authToken),
      AsyncStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(user)),
    ]).catch((error) => {
      console.warn("No se pudo guardar la sesión", error);
    });
  }, [authToken, restoring, user]);

  const persistSession = useCallback(
    async (nextUser: AuthUser, token: string) => {
      setSession({ user: nextUser, tokens: { token } });
      await Promise.all([
        AsyncStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token),
        AsyncStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(nextUser)),
      ]);
    },
    [setSession],
  );

  const signIn = useCallback(
    async ({ email, password }: SignInPayload) => {
      setLoading(true);
      try {
        const { token, user: incomingUser } = await login({ email, password });
        const ensuredUser: AuthUser =
          incomingUser ?? ({
            id: email,
            email,
            name: email.split("@")[0] ?? email,
          } as AuthUser);

        if (!token) {
          throw new Error("No se recibió un token válido");
        }

        await persistSession(ensuredUser, token);
      } finally {
        setLoading(false);
      }
    },
    [persistSession],
  );

  const signOut = useCallback(async () => {
    setLoading(true);
    try {
      clearSession();
      await Promise.all([
        AsyncStorage.removeItem(AUTH_TOKEN_STORAGE_KEY),
        AsyncStorage.removeItem(AUTH_USER_STORAGE_KEY),
      ]);
    } finally {
      setLoading(false);
    }
  }, [clearSession]);

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      token: authToken,
      loading: loading || restoring,
      signIn,
      signOut,
    }),
    [authToken, loading, restoring, signIn, signOut, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe utilizarse dentro de un AuthProvider");
  }
  return context;
};
