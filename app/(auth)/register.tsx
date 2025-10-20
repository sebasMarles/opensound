import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "../../store/authStore";
import { RegisterCredentials } from "../../types/auth";

export default function RegisterScreen() {
  const router = useRouter();
  const { register, isLoading, error, clearError } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterCredentials>({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const password = watch('password');

  const onSubmit = async (data: RegisterCredentials) => {
    clearError();
    try {
      await register(data);
      router.replace('/(tabs)');
    } catch {
      // Error ya manejado en el store
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        className="flex-1 bg-black"
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 px-6 pt-16">
          <View className="flex-row items-center mb-8">
            <TouchableOpacity
              onPress={() => router.back()}
              className="mr-4 p-2"
            >
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <Text className="text-white text-xl font-bold">Crear Cuenta</Text>
          </View>

          <View className="items-center mb-8">
            <Image
              source={require('../../assets/logo.png')}
              className="w-16 h-16 mb-3"
              resizeMode="contain"
            />
            <Text className="text-white text-2xl font-bold mb-2">Únete a OpenSound</Text>
            <Text className="text-gray-400 text-sm text-center">
              Descubre música increíble de artistas emergentes
            </Text>
          </View>

          <View className="space-y-5">
            <View>
              <Text className="text-white text-sm font-medium mb-2">Nombre completo</Text>
              <Controller
                control={control}
                name="name"
                rules={{
                  required: 'El nombre es requerido',
                  minLength: { value: 2, message: 'El nombre debe tener al menos 2 caracteres' },
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    className="bg-neutral-900 text-white px-4 py-3 rounded-lg border border-neutral-700 focus:border-purple-600"
                    placeholder="Tu nombre completo"
                    placeholderTextColor="#9CA3AF"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    autoCapitalize="words"
                    autoCorrect={false}
                  />
                )}
              />
              {errors.name && (
                <Text className="text-red-500 text-sm mt-1">{errors.name.message}</Text>
              )}
            </View>

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

            <View>
              <Text className="text-white text-sm font-medium mb-2">Contraseña</Text>
              <View className="relative">
                <Controller
                  control={control}
                  name="password"
                  rules={{
                    required: 'La contraseña es requerida',
                    minLength: { value: 6, message: 'La contraseña debe tener al menos 6 caracteres' },
                  }}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      className="bg-neutral-900 text-white px-4 py-3 pr-12 rounded-lg border border-neutral-700 focus:border-purple-600"
                      placeholder="Mínimo 6 caracteres"
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

            <View>
              <Text className="text-white text-sm font-medium mb-2">Confirmar contraseña</Text>
              <View className="relative">
                <Controller
                  control={control}
                  name="confirmPassword"
                  rules={{
                    required: 'Confirma tu contraseña',
                    validate: (value) =>
                      value === password || 'Las contraseñas no coinciden',
                  }}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      className="bg-neutral-900 text-white px-4 py-3 pr-12 rounded-lg border border-neutral-700 focus:border-purple-600"
                      placeholder="Confirma tu contraseña"
                      placeholderTextColor="#9CA3AF"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      secureTextEntry={!showConfirmPassword}
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                  )}
                />
                <TouchableOpacity
                  className="absolute right-3 top-3"
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <Ionicons
                    name={showConfirmPassword ? 'eye-off' : 'eye'}
                    size={20}
                    color="#9CA3AF"
                  />
                </TouchableOpacity>
              </View>
              {errors.confirmPassword && (
                <Text className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</Text>
              )}
            </View>

            {error && (
              <View className="bg-red-900/20 border border-red-500 rounded-lg p-3">
                <Text className="text-red-400 text-sm text-center">{error}</Text>
              </View>
            )}

            <TouchableOpacity
              className={`bg-purple-600 py-4 rounded-lg mt-6 ${isLoading ? 'opacity-50' : ''}`}
              onPress={handleSubmit(onSubmit)}
              disabled={isLoading}
            >
              <Text className="text-white text-center text-lg font-semibold">
                {isLoading ? 'Creando cuenta...' : 'Crear Cuenta'}
              </Text>
            </TouchableOpacity>

            <Text className="text-gray-400 text-xs text-center mt-4">
              Al registrarte, aceptas nuestros{' '}
              <Text className="text-purple-400">Términos de Servicio</Text> y{' '}
              <Text className="text-purple-400">Política de Privacidad</Text>
            </Text>

            <View className="flex-row justify-center items-center mt-6">
              <Text className="text-gray-400">¿Ya tienes cuenta? </Text>
              <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
                <Text className="text-purple-400 font-semibold">Inicia sesión</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}