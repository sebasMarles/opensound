import axios from 'axios';
import { AuthCredentials, RegisterCredentials, AuthResponse, User } from '../types/auth';
import { StorageService } from './storage';

// Configuración base de la API (cambiar por tu endpoint real)
const API_BASE_URL = 'https://api.opensound.com'; // Cambiar por tu API real

const authApi = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token automáticamente
authApi.interceptors.request.use(
  async (config) => {
    const token = await StorageService.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar refresh token automáticamente
authApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = await StorageService.getRefreshToken();
        if (refreshToken) {
          const response = await AuthService.refreshToken(refreshToken);
          await StorageService.setToken(response.token);
          
          // Reintentar la petición original
          originalRequest.headers.Authorization = `Bearer ${response.token}`;
          return authApi(originalRequest);
        }
      } catch (refreshError) {
        // Si el refresh falla, limpiar tokens y redirigir al login
        await StorageService.clearAll();
        // Aquí podrías emitir un evento para redirigir al login
      }
    }
    
    return Promise.reject(error);
  }
);

export class AuthService {
  // Login
  static async login(credentials: AuthCredentials): Promise<AuthResponse> {
    try {
      // Simulación completa sin llamadas HTTP para desarrollo
      console.log('🔐 Simulando login para:', credentials.email);
      
      // Simular delay de red
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Validaciones básicas
      if (!credentials.email || !credentials.password) {
        throw new Error('Email y contraseña son requeridos');
      }

      // Simulamos una respuesta exitosa
      const mockResponse: AuthResponse = {
        token: 'mock_jwt_token_' + Date.now(),
        refreshToken: 'mock_refresh_token_' + Date.now(),
        user: {
          id: '1',
          email: credentials.email,
          name: 'Usuario Demo',
          createdAt: new Date(),
        },
        expiresIn: 3600,
      };

      // Guardar tokens en storage
      await StorageService.setToken(mockResponse.token);
      if (mockResponse.refreshToken) {
        await StorageService.setRefreshToken(mockResponse.refreshToken);
      }
      await StorageService.setUserData(mockResponse.user);

      console.log('✅ Login simulado exitoso');
      return mockResponse;
    } catch (error) {
      console.error('Login error:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Error al iniciar sesión. Verifica tus credenciales.');
    }
  }

  // Register
  static async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    try {
      console.log('📝 Simulando registro para:', credentials.email);
      
      // Validaciones básicas
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

      // Simular delay de red
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Simulamos una respuesta exitosa
      const mockResponse: AuthResponse = {
        token: 'mock_jwt_token_' + Date.now(),
        refreshToken: 'mock_refresh_token_' + Date.now(),
        user: {
          id: Date.now().toString(),
          email: credentials.email,
          name: credentials.name,
          createdAt: new Date(),
        },
        expiresIn: 3600,
      };

      // Guardar tokens en storage
      await StorageService.setToken(mockResponse.token);
      if (mockResponse.refreshToken) {
        await StorageService.setRefreshToken(mockResponse.refreshToken);
      }
      await StorageService.setUserData(mockResponse.user);

      console.log('✅ Registro simulado exitoso');
      return mockResponse;
    } catch (error) {
      console.error('Register error:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Error al registrar usuario');
    }
  }

  // Refresh Token
  static async refreshToken(refreshToken: string): Promise<AuthResponse> {
    try {
      console.log('🔄 Simulando refresh token');
      
      // Simular delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const mockResponse: AuthResponse = {
        token: 'new_mock_jwt_token_' + Date.now(),
        refreshToken: 'new_mock_refresh_token_' + Date.now(),
        user: await StorageService.getUserData(),
        expiresIn: 3600,
      };

      console.log('✅ Refresh token simulado exitoso');
      return mockResponse;
    } catch (error) {
      console.error('Refresh token error:', error);
      throw new Error('Error al renovar token');
    }
  }

  // Logout
  static async logout(): Promise<void> {
    try {
      console.log('👋 Simulando logout');
      
      // Simular delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      console.log('✅ Logout simulado exitoso');
    } catch (error) {
      console.error('Logout API error:', error);
      // Continuar con el logout local aunque falle el servidor
    } finally {
      // Limpiar storage local
      await StorageService.clearAll();
    }
  }

  // Verificar si el usuario está autenticado
  static async isAuthenticated(): Promise<boolean> {
    try {
      const token = await StorageService.getToken();
      return !!token;
    } catch (error) {
      console.error('Auth check error:', error);
      return false;
    }
  }

  // Obtener usuario actual
  static async getCurrentUser(): Promise<User | null> {
    try {
      return await StorageService.getUserData();
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  }

  // Actualizar perfil de usuario
  static async updateProfile(userData: Partial<User>): Promise<User> {
    try {
      const response = await authApi.put('/auth/profile', userData);
      
      // Simulación - reemplazar con respuesta real
      const currentUser = await StorageService.getUserData();
      const updatedUser = { ...currentUser, ...userData };
      
      await StorageService.setUserData(updatedUser);
      return updatedUser;
    } catch (error) {
      console.error('Update profile error:', error);
      throw new Error('Error al actualizar perfil');
    }
  }

  // Cambiar contraseña
  static async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    try {
      await authApi.put('/auth/change-password', {
        currentPassword,
        newPassword,
      });
    } catch (error) {
      console.error('Change password error:', error);
      throw new Error('Error al cambiar contraseña');
    }
  }

  // Recuperar contraseña
  static async forgotPassword(email: string): Promise<void> {
    try {
      console.log('📧 Simulando envío de email de recuperación a:', email);
      
      // Validar email
      if (!email || !email.includes('@')) {
        throw new Error('Email inválido');
      }
      
      // Simular delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('✅ Email de recuperación simulado enviado');
    } catch (error) {
      console.error('Forgot password error:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Error al enviar email de recuperación');
    }
  }
}
