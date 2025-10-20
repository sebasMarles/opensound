import { create } from "zustand";
import type { AuthTokens, AuthUser, RegisterCredentials } from "../../types/auth";
import { ensureAuthUser, login as apiLogin, register as apiRegister } from "./authService";

type AuthState = {
  user: AuthUser | null;
  tokens: AuthTokens | null;
  isLoading: boolean;
  error: string | null;
  register: (
    data: RegisterCredentials,
  ) => Promise<{ user: AuthUser; tokens: AuthTokens }>;
  login: (
    credentials: { email: string; password: string },
  ) => Promise<{ user: AuthUser; tokens: AuthTokens }>;
  setSession: (payload: { user: AuthUser; tokens: AuthTokens }) => void;
  clearSession: () => void;
  clearError: () => void;
};

// Zustand almacena el estado global de autenticación para pantallas no envueltas por el provider.
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  tokens: null,
  isLoading: false,
  error: null,

  register: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const res = await apiRegister({
        name: data.name,
        email: data.email,
        password: data.password,
      });

      const ensuredUser = ensureAuthUser(res.user, data.email, data.name);
      const session = {
        user: ensuredUser,
        tokens: { token: res.token },
      };

      set({
        ...session,
        isLoading: false,
      });

      return session;
    } catch (err: any) {
      set({
        error: err?.message ?? "Error al registrar usuario",
        isLoading: false,
      });
      throw err;
    }
  },

  login: async (credentials) => {
    set({ isLoading: true, error: null });
    try {
      const res = await apiLogin(credentials);
      const ensuredUser = ensureAuthUser(res.user, credentials.email);

      const session = {
        user: ensuredUser,
        tokens: { token: res.token },
      };

      set({
        ...session,
        isLoading: false,
      });

      return session;
    } catch (err: any) {
      set({
        error: err?.message ?? "Error al iniciar sesión",
        isLoading: false,
      });
      throw err;
    }
  },

  setSession: ({ user, tokens }) => set({ user, tokens }),
  clearSession: () => set({ user: null, tokens: null }),
  clearError: () => set({ error: null }),
}));
