import { create } from "zustand";
import type { AuthTokens, AuthUser, RegisterCredentials } from "../types/auth";
import { register as apiRegister, login as apiLogin } from "../services/auth"; 

type AuthState = {
  user: AuthUser | null;
  tokens: AuthTokens | null;
  isLoading: boolean;
  error: string | null;
  register: (
    data: RegisterCredentials
  ) => Promise<{ user: AuthUser; tokens: AuthTokens }>;
  login: (
    credentials: { email: string; password: string }
  ) => Promise<{ user: AuthUser; tokens: AuthTokens }>;
  setSession: (payload: { user: AuthUser; tokens: AuthTokens }) => void;
  clearSession: () => void;
  clearError: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  tokens: null,
  isLoading: false,
  error: null,

  // 🔹 Registro real (usa el backend)
  register: async (data) => {
    set({ isLoading: true, error: null });
    try {
      console.log("📤 Registrando usuario (real):", data);
      const res = await apiRegister({
        name: data.name,
        email: data.email,
        password: data.password,
      });

      const session = {
        user: res.user!,
        tokens: { token: res.token },
      };

      set({
        ...session,
        isLoading: false,
      });

      return session;
    } catch (err: any) {
      console.error("❌ Error al registrar usuario:", err.message);
      set({
        error: err.message ?? "Error al registrar usuario",
        isLoading: false,
      });
      throw err;
    }
  },

  // 🔹 Login real (usa el backend)
  login: async (credentials) => {
    set({ isLoading: true, error: null });
    try {
      console.log("📤 Iniciando sesión (real):", credentials);
      const res = await apiLogin(credentials);

      const session = {
        user: res.user!,
        tokens: { token: res.token },
      };

      set({
        ...session,
        isLoading: false,
      });

      return session;
    } catch (err: any) {
      console.error("❌ Error al iniciar sesión:", err.message);
      set({
        error: err.message ?? "Error al iniciar sesión",
        isLoading: false,
      });
      throw err;
    }
  },

  setSession: ({ user, tokens }) => set({ user, tokens }),
  clearSession: () => set({ user: null, tokens: null }),
  clearError: () => set({ error: null }),
}));
