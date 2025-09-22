import AsyncStorage from '@react-native-async-storage/async-storage';

export class StorageService {
  // Auth Token Management
  static async setToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem('auth_token', token);
    } catch (error) {
      console.error('Error saving token:', error);
      throw error;
    }
  }

  static async getToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem('auth_token');
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  }

  static async removeToken(): Promise<void> {
    try {
      await AsyncStorage.removeItem('auth_token');
    } catch (error) {
      console.error('Error removing token:', error);
      throw error;
    }
  }

  // Refresh Token Management
  static async setRefreshToken(refreshToken: string): Promise<void> {
    try {
      await AsyncStorage.setItem('refresh_token', refreshToken);
    } catch (error) {
      console.error('Error saving refresh token:', error);
      throw error;
    }
  }

  static async getRefreshToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem('refresh_token');
    } catch (error) {
      console.error('Error getting refresh token:', error);
      return null;
    }
  }

  static async removeRefreshToken(): Promise<void> {
    try {
      await AsyncStorage.removeItem('refresh_token');
    } catch (error) {
      console.error('Error removing refresh token:', error);
      throw error;
    }
  }

  // User Data Management
  static async setUserData(userData: any): Promise<void> {
    try {
      await AsyncStorage.setItem('user_data', JSON.stringify(userData));
    } catch (error) {
      console.error('Error saving user data:', error);
      throw error;
    }
  }

  static async getUserData(): Promise<any | null> {
    try {
      const userData = await AsyncStorage.getItem('user_data');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error getting user data:', error);
      return null;
    }
  }

  static async removeUserData(): Promise<void> {
    try {
      await AsyncStorage.removeItem('user_data');
    } catch (error) {
      console.error('Error removing user data:', error);
      throw error;
    }
  }

  // Preferences Management
  static async setPreferences(preferences: any): Promise<void> {
    try {
      await AsyncStorage.setItem('user_preferences', JSON.stringify(preferences));
    } catch (error) {
      console.error('Error saving preferences:', error);
      throw error;
    }
  }

  static async getPreferences(): Promise<any | null> {
    try {
      const preferences = await AsyncStorage.getItem('user_preferences');
      return preferences ? JSON.parse(preferences) : null;
    } catch (error) {
      console.error('Error getting preferences:', error);
      return null;
    }
  }

  // Clear All Data
  static async clearAll(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        'auth_token',
        'refresh_token',
        'user_data',
        'user_preferences'
      ]);
    } catch (error) {
      console.error('Error clearing all data:', error);
      throw error;
    }
  }
}
