import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import { AuthCredentials, RegisterCredentials, AuthResponse, User } from '../types/auth';
import { StorageService } from './storage';
import { getApiBaseUrl } from '../config/env';

const API_BASE_URL = getApiBaseUrl();

const authApi = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

interface RetriableRequestConfig extends AxiosRequestConfig {
  _retry?: boolean;
}

type FailedRequestQueueItem = {
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
};

let isRefreshing = false;
let failedQueue: FailedRequestQueueItem[] = [];

const processQueue = (error: unknown, token: string | null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else if (token) {
      resolve(token);
    } else {
      reject(new Error('Token de acceso no disponible tras renovar la sesión.'));
    }
  });

  failedQueue = [];
};

const extractErrorMessage = (error: unknown, fallback: string): string => {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string | string[] } | undefined;
    if (data?.message) {
      if (Array.isArray(data.message)) {
        return data.message.join(', ');
      }
      return data.message;
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
};

authApi.interceptors.request.use(async (config) => {
  const token = await StorageService.getToken();
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

authApi.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const status = error.response?.status;
    const originalRequest = error.config as RetriableRequestConfig;

    if (status === 401 && !originalRequest?._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token: string) => {
              originalRequest.headers = originalRequest.headers ?? {};
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(authApi(originalRequest));
            },
            reject,
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = await StorageService.getRefreshToken();
        if (!refreshToken) {
          throw error;
        }

        const refreshed = await AuthService.refreshToken(refreshToken);
        processQueue(null, refreshed.token);

        originalRequest.headers = originalRequest.headers ?? {};
        originalRequest.headers.Authorization = `Bearer ${refreshed.token}`;
        return authApi(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        await StorageService.clearAll();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export class AuthService {
  private static async persistAuthData(authData: AuthResponse): Promise<void> {
    await StorageService.setToken(authData.token);
    if (authData.refreshToken) {
      await StorageService.setRefreshToken(authData.refreshToken);
    }
    if (authData.user) {
      await StorageService.setUserData(authData.user);
    }
  }

  static async login(credentials: AuthCredentials): Promise<AuthResponse> {
    try {
      const { data } = await authApi.post<AuthResponse>('/auth/login', credentials);
      await this.persistAuthData(data);
      return data;
    } catch (error) {
      const message = extractErrorMessage(error, 'Error al iniciar sesión. Verifica tus credenciales.');
      throw new Error(message);
    }
  }

  static async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    try {
      if (credentials.password !== credentials.confirmPassword) {
        throw new Error('Las contraseñas no coinciden');
      }

      if (credentials.password.length < 6) {
        throw new Error('La contraseña debe tener al menos 6 caracteres');
      }

      if (!credentials.name || credentials.name.trim().length < 2) {
        throw new Error('El nombre debe tener al menos 2 caracteres');
      }

      if (!credentials.email || !credentials.email.includes('@')) {
        throw new Error('Email inválido');
      }

      const payload = {
        name: credentials.name.trim(),
        email: credentials.email.trim(),
        password: credentials.password,
      };

      const { data } = await authApi.post<AuthResponse>('/auth/register', payload);
      await this.persistAuthData(data);
      return data;
    } catch (error) {
      const message = extractErrorMessage(error, 'Error al registrar usuario');
      throw new Error(message);
    }
  }

  static async refreshToken(refreshToken: string): Promise<AuthResponse> {
    try {
      const { data } = await axios.post<AuthResponse>(
        `${API_BASE_URL}/auth/refresh`,
        { refreshToken },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      await this.persistAuthData(data);
      return data;
    } catch (error) {
      const message = extractErrorMessage(error, 'Error al renovar token');
      throw new Error(message);
    }
  }

  static async logout(): Promise<void> {
    try {
      const refreshToken = await StorageService.getRefreshToken();
      if (refreshToken) {
        await authApi.post('/auth/logout', { refreshToken });
      }
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      await StorageService.clearAll();
    }
  }

  static async isAuthenticated(): Promise<boolean> {
    try {
      const token = await StorageService.getToken();
      return !!token;
    } catch (error) {
      console.error('Auth check error:', error);
      return false;
    }
  }

  static async getCurrentUser(): Promise<User | null> {
    try {
      const { data } = await authApi.get<User>('/auth/me');
      await StorageService.setUserData(data);
      return data;
    } catch (error) {
      console.error('Get current user error:', error);
      return await StorageService.getUserData();
    }
  }

  static async updateProfile(userData: Partial<User>): Promise<User> {
    try {
      const { data } = await authApi.put<User>('/auth/profile', userData);
      await StorageService.setUserData(data);
      return data;
    } catch (error) {
      const message = extractErrorMessage(error, 'Error al actualizar perfil');
      throw new Error(message);
    }
  }

  static async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    try {
      await authApi.put('/auth/change-password', {
        currentPassword,
        newPassword,
      });
    } catch (error) {
      const message = extractErrorMessage(error, 'Error al cambiar contraseña');
      throw new Error(message);
    }
  }

  static async forgotPassword(email: string): Promise<void> {
    try {
      await authApi.post('/auth/forgot-password', { email });
    } catch (error) {
      const message = extractErrorMessage(error, 'Error al enviar email de recuperación');
      throw new Error(message);
    }
  }
}

export { authApi };
