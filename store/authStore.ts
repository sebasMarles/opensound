import { create } from "zustand";
import type { AuthTokens, AuthUser } from "../types/auth";

type AuthState = {
  user: AuthUser | null;
  tokens: AuthTokens | null;
  setSession: (payload: { user: AuthUser; tokens: AuthTokens }) => void;
  clearSession: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  tokens: null,
  setSession: ({ user, tokens }) => set({ user, tokens }),
  clearSession: () => set({ user: null, tokens: null }),
}));
