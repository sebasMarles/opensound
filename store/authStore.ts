import { create } from "zustand";
import type { AuthTokens, AuthUser, RegisterCredentials } from "../types/auth";

type AuthState = {
  user: AuthUser | null;
  tokens: AuthTokens | null;
  isLoading: boolean;
  error: string | null;
  register: (
    data: RegisterCredentials,
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

  // Simulación de registro
  register: async (data) => {
    set({ isLoading: true, error: null });
    try {
      // Aquí iría tu llamada real al backend:
      // const res = await fetch(`${API_URL}/register`, {...})
      console.log("📤 Registrando usuario:", data);

      // Simulación de éxito
      const fakeUser: AuthUser = {
        id: "1",
        email: data.email,
        name: data.name,
        role: "user",
      };
      const fakeTokens: AuthTokens = { token: "fake-token" };

      const session = {
        user: fakeUser,
        tokens: fakeTokens,
      };

      set({
        ...session,
        isLoading: false,
      });

      return session;
    } catch (err) {
      set({
        error: "Error al registrar usuario",
        isLoading: false,
      });
      if (err instanceof Error) {
        throw err;
      }
      throw new Error("Error al registrar usuario");
    }
  },

  setSession: ({ user, tokens }) => set({ user, tokens }),
  clearSession: () => set({ user: null, tokens: null }),
  clearError: () => set({ error: null }),
}));
