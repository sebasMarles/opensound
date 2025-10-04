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

const TOKEN_KEY = "@opensound/token";
const USER_KEY = "@opensound/user";

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

  useEffect(() => {
    (async () => {
      try {
        const [storedToken, storedUser] = await Promise.all([
          AsyncStorage.getItem(TOKEN_KEY),
          AsyncStorage.getItem(USER_KEY),
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

  const persistSession = useCallback(
    async (nextUser: AuthUser, token: string) => {
      setSession({ user: nextUser, tokens: { token } });
      await Promise.all([
        AsyncStorage.setItem(TOKEN_KEY, token),
        AsyncStorage.setItem(USER_KEY, JSON.stringify(nextUser)),
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
        AsyncStorage.removeItem(TOKEN_KEY),
        AsyncStorage.removeItem(USER_KEY),
      ]);
    } finally {
      setLoading(false);
    }
  }, [clearSession]);

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      token: tokens?.token ?? null,
      loading: loading || restoring,
      signIn,
      signOut,
    }),
    [loading, restoring, signIn, signOut, tokens?.token, user],
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
