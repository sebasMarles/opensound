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

interface ForgotPasswordForm {
  email: string;
}

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { forgotPassword, isLoading, error, clearError } = useAuthStore();
  const [emailSent, setEmailSent] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<ForgotPasswordForm>({
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: ForgotPasswordForm) => {
    try {
      clearError();
      await forgotPassword(data.email);
      setEmailSent(true);
    } catch (error) {
      // El error ya se maneja en el store
      console.error('Forgot password failed:', error);
    }
  };

  const handleResendEmail = async () => {
    const email = getValues('email');
    if (email) {
      try {
        clearError();
        await forgotPassword(email);
        Alert.alert('Email reenviado', 'Hemos reenviado el email de recuperación.');
      } catch (error) {
        console.error('Resend email failed:', error);
      }
    }
  };

  if (emailSent) {
    return (
      <View className="flex-1 bg-black px-6 pt-16">
        {/* Header */}
        <View className="flex-row items-center mb-8">
          <TouchableOpacity
            onPress={() => router.back()}
            className="mr-4 p-2"
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-white text-xl font-bold">Recuperar Contraseña</Text>
        </View>

        {/* Success Content */}
        <View className="flex-1 justify-center items-center px-6">
          <View className="bg-green-900/20 border border-green-500 rounded-full p-6 mb-6">
            <Ionicons name="mail-outline" size={48} color="#10B981" />
          </View>
          
          <Text className="text-white text-2xl font-bold text-center mb-4">
            Email Enviado
          </Text>
          
          <Text className="text-gray-400 text-center mb-8 leading-6">
            Hemos enviado un enlace de recuperación a tu email. 
            Revisa tu bandeja de entrada y sigue las instrucciones para restablecer tu contraseña.
          </Text>

          <View className="w-full space-y-4">
            <TouchableOpacity
              className={`bg-purple-600 py-4 rounded-lg ${isLoading ? 'opacity-50' : ''}`}
              onPress={handleResendEmail}
              disabled={isLoading}
            >
              <Text className="text-white text-center text-lg font-semibold">
                {isLoading ? 'Reenviando...' : 'Reenviar Email'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="py-4"
              onPress={() => router.push('/(auth)/login')}
            >
              <Text className="text-purple-400 text-center text-lg font-semibold">
                Volver al Login
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

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
        <View className="flex-1 px-6 pt-16">
          {/* Header */}
          <View className="flex-row items-center mb-8">
            <TouchableOpacity
              onPress={() => router.back()}
              className="mr-4 p-2"
            >
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <Text className="text-white text-xl font-bold">Recuperar Contraseña</Text>
          </View>

          {/* Content */}
          <View className="flex-1 justify-center">
            {/* Icon */}
            <View className="items-center mb-8">
              <View className="bg-purple-900/20 border border-purple-500 rounded-full p-6 mb-4">
                <Ionicons name="lock-closed-outline" size={48} color="#D400FF" />
              </View>
              <Text className="text-white text-2xl font-bold mb-2">¿Olvidaste tu contraseña?</Text>
              <Text className="text-gray-400 text-center leading-6">
                No te preocupes, ingresa tu email y te enviaremos un enlace para restablecer tu contraseña.
              </Text>
            </View>

            {/* Form */}
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

              {/* Error message */}
              {error && (
                <View className="bg-red-900/20 border border-red-500 rounded-lg p-3">
                  <Text className="text-red-400 text-sm text-center">{error}</Text>
                </View>
              )}

              {/* Submit Button */}
              <TouchableOpacity
                className={`bg-purple-600 py-4 rounded-lg ${isLoading ? 'opacity-50' : ''}`}
                onPress={handleSubmit(onSubmit)}
                disabled={isLoading}
              >
                <Text className="text-white text-center text-lg font-semibold">
                  {isLoading ? 'Enviando...' : 'Enviar Enlace de Recuperación'}
                </Text>
              </TouchableOpacity>

              {/* Back to Login */}
              <View className="flex-row justify-center items-center mt-6">
                <Text className="text-gray-400">¿Recordaste tu contraseña? </Text>
                <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
                  <Text className="text-purple-400 font-semibold">Inicia sesión</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
