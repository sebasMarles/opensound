import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../stores/authStore';
import { AuthCredentials } from '../../types/auth';

export default function LoginScreen() {
  const router = useRouter();
  const { login, isLoading, error, clearError } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<AuthCredentials>({
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: AuthCredentials) => {
    try {
      clearError();
      await login(data);
      router.replace('/(tabs)');
    } catch (error) {
      // El error ya se maneja en el store
      console.error('Login failed:', error);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        className="flex-1 bg-black"
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 px-6 pt-20">
          {/* Logo y título */}
          <View className="items-center mb-12">
            <Image
              source={require('../../assets/logo.png')}
              className="w-20 h-20 mb-4"
              resizeMode="contain"
            />
            <Text className="text-white text-3xl font-bold mb-2">OpenSound</Text>
            <Text className="text-gray-400 text-base text-center">
              Inicia sesión para descubrir música increíble
            </Text>
          </View>

          {/* Formulario */}
          <View className="space-y-6">
            {/* Email */}
            <View>
              <Text className="text-white text-sm font-medium mb-2">Email</Text>
              <Controller
                control={control}
                name="email"
                rules={{
                  required: 'El email es requerido',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Email inválido',
                  },
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    className="bg-neutral-900 text-white px-4 py-3 rounded-lg border border-neutral-700 focus:border-purple-600"
                    placeholder="tu@email.com"
                    placeholderTextColor="#9CA3AF"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                )}
              />
              {errors.email && (
                <Text className="text-red-500 text-sm mt-1">{errors.email.message}</Text>
              )}
            </View>

            {/* Password */}
            <View>
              <Text className="text-white text-sm font-medium mb-2">Contraseña</Text>
              <View className="relative">
                <Controller
                  control={control}
                  name="password"
                  rules={{
                    required: 'La contraseña es requerida',
                    minLength: {
                      value: 6,
                      message: 'La contraseña debe tener al menos 6 caracteres',
                    },
                  }}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      className="bg-neutral-900 text-white px-4 py-3 pr-12 rounded-lg border border-neutral-700 focus:border-purple-600"
                      placeholder="Tu contraseña"
                      placeholderTextColor="#9CA3AF"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                  )}
                />
                <TouchableOpacity
                  className="absolute right-3 top-3"
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Ionicons
                    name={showPassword ? 'eye-off' : 'eye'}
                    size={20}
                    color="#9CA3AF"
                  />
                </TouchableOpacity>
              </View>
              {errors.password && (
                <Text className="text-red-500 text-sm mt-1">{errors.password.message}</Text>
              )}
            </View>

            {/* Error message */}
            {error && (
              <View className="bg-red-900/20 border border-red-500 rounded-lg p-3">
                <Text className="text-red-400 text-sm text-center">{error}</Text>
              </View>
            )}

            {/* Forgot Password */}
            <TouchableOpacity
              onPress={() => router.push('/(auth)/forgot-password')}
              className="self-end"
            >
              <Text className="text-purple-400 text-sm">¿Olvidaste tu contraseña?</Text>
            </TouchableOpacity>

            {/* Login Button */}
            <TouchableOpacity
              className={`bg-purple-600 py-4 rounded-lg ${isLoading ? 'opacity-50' : ''}`}
              onPress={handleSubmit(onSubmit)}
              disabled={isLoading}
            >
              <Text className="text-white text-center text-lg font-semibold">
                {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
              </Text>
            </TouchableOpacity>

            {/* Divider */}
            <View className="flex-row items-center my-6">
              <View className="flex-1 h-px bg-neutral-700" />
              <Text className="text-gray-400 px-4">o</Text>
              <View className="flex-1 h-px bg-neutral-700" />
            </View>

            {/* Register Link */}
            <View className="flex-row justify-center items-center">
              <Text className="text-gray-400">¿No tienes cuenta? </Text>
              <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
                <Text className="text-purple-400 font-semibold">Regístrate</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
