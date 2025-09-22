import { create } from 'zustand';
import { AuthState, User, AuthCredentials, RegisterCredentials } from '../types/auth';
import { AuthService } from '../services/auth';
import { StorageService } from '../services/storage';

interface AuthStore extends AuthState {
  // Actions
  login: (credentials: AuthCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  updateProfile: (userData: Partial<User>) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  initializeAuth: () => Promise<void>;
  setLoading: (loading: boolean) => void;
  clearError: () => void;
  error: string | null;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  // Initial state
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  // Actions
  login: async (credentials: AuthCredentials) => {
    try {
      set({ isLoading: true, error: null });
      
      const response = await AuthService.login(credentials);
      
      set({
        user: response.user,
        token: response.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al iniciar sesión';
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: errorMessage,
      });
      throw error;
    }
  },

  register: async (credentials: RegisterCredentials) => {
    try {
      set({ isLoading: true, error: null });
      
      const response = await AuthService.register(credentials);
      
      set({
        user: response.user,
        token: response.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al registrar usuario';
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: errorMessage,
      });
      throw error;
    }
  },

  logout: async () => {
    try {
      set({ isLoading: true });
      
      await AuthService.logout();
      
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      console.error('Logout error:', error);
      // Forzar logout local aunque falle el servidor
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    }
  },

  refreshToken: async () => {
    try {
      const refreshToken = await StorageService.getRefreshToken();
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await AuthService.refreshToken(refreshToken);
      
      set({
        user: response.user,
        token: response.token,
        isAuthenticated: true,
        error: null,
      });
    } catch (error) {
      console.error('Refresh token error:', error);
      // Si falla el refresh, hacer logout
      await get().logout();
    }
  },

  updateProfile: async (userData: Partial<User>) => {
    try {
      set({ isLoading: true, error: null });
      
      const updatedUser = await AuthService.updateProfile(userData);
      
      set({
        user: updatedUser,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al actualizar perfil';
      set({
        isLoading: false,
        error: errorMessage,
      });
      throw error;
    }
  },

  changePassword: async (currentPassword: string, newPassword: string) => {
    try {
      set({ isLoading: true, error: null });
      
      await AuthService.changePassword(currentPassword, newPassword);
      
      set({
        isLoading: false,
        error: null,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al cambiar contraseña';
      set({
        isLoading: false,
        error: errorMessage,
      });
      throw error;
    }
  },

  forgotPassword: async (email: string) => {
    try {
      set({ isLoading: true, error: null });
      
      await AuthService.forgotPassword(email);
      
      set({
        isLoading: false,
        error: null,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al enviar email de recuperación';
      set({
        isLoading: false,
        error: errorMessage,
      });
      throw error;
    }
  },

  initializeAuth: async () => {
    try {
      set({ isLoading: true });
      
      const [token, userData] = await Promise.all([
        StorageService.getToken(),
        StorageService.getUserData(),
      ]);

      if (token && userData) {
        set({
          user: userData,
          token,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
      } else {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
      }
    } catch (error) {
      console.error('Initialize auth error:', error);
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    }
  },

  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },

  clearError: () => {
    set({ error: null });
  },
}));
