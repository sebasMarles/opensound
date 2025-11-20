"use client";

import { useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useForm, Controller } from "react-hook-form";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useAuth } from "../../context/AuthContext";
import {
  getEmailRules,
  getPasswordRules,
  sanitizeInput,
} from "../../utils/validation";

type FormData = {
  email: string;
  password: string;
};

export default function Login() {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();
  const { signIn, loading, loginError, clearLoginError } = useAuth();

  useEffect(() => {
    // Si no hay error y no está cargando, verificamos si hay token
    if (!loading && !loginError) {
      const checkAndNavigate = async () => {
        // Pequeño delay para asegurar que el token se guardó
        await new Promise((resolve) => setTimeout(resolve, 100));
        // El _layout se encargará de navegar cuando detecte el token
      };
      checkAndNavigate();
    }
  }, [loading, loginError]);

  const onSubmit = async (data: FormData) => {
    await signIn({
      email: sanitizeInput(data.email),
      password: data.password,
    });
  };

  return (
    <View className="flex-1 justify-center px-6 bg-neutral-900">
      <Text className="text-center text-3xl font-bold text-purple-500 mb-8">
        OpenSound
      </Text>

      <Controller
        control={control}
        name="email"
        rules={getEmailRules()}
        render={({ field: { onChange, value } }) => (
          <TextInput
            className="bg-neutral-800 text-white px-4 py-3 rounded-lg mb-2"
            placeholder="Correo"
            placeholderTextColor="#888"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            autoCorrect={false}
            value={value}
            onChangeText={onChange}
            maxLength={100}
            accessibilityLabel="Campo de correo electrónico"
            accessibilityHint="Ingresa tu correo electrónico"
          />
        )}
      />
      {errors.email && (
        <Text className="text-red-500 mb-2">{errors.email.message}</Text>
      )}

      <Controller
        control={control}
        name="password"
        rules={getPasswordRules()}
        render={({ field: { onChange, value } }) => (
          <TextInput
            className="bg-neutral-800 text-white px-4 py-3 rounded-lg mb-2"
            placeholder="Contraseña"
            placeholderTextColor="#888"
            secureTextEntry
            autoCapitalize="none"
            autoComplete="password"
            autoCorrect={false}
            value={value}
            onChangeText={onChange}
            maxLength={128}
            accessibilityLabel="Campo de contraseña"
            accessibilityHint="Ingresa tu contraseña"
          />
        )}
      />
      {errors.password && (
        <Text className="text-red-500 mb-2">{errors.password.message}</Text>
      )}

      {loginError ? (
        <View className="bg-red-500/20 border border-red-500 rounded-lg p-3 mb-4">
          <Text className="text-red-400 text-center">{loginError}</Text>
        </View>
      ) : null}

      <TouchableOpacity
        className="bg-purple-600 py-3 rounded-lg mt-4 flex-row items-center justify-center"
        onPress={handleSubmit(onSubmit)}
        disabled={loading}
        accessibilityRole="button"
        accessibilityState={{ disabled: loading }}
      >
        {loading && (
          <ActivityIndicator
            style={{ marginRight: 8 }}
            size="small"
            color="#fff"
          />
        )}
        <Text className="text-center text-white font-bold">Iniciar Sesión</Text>
      </TouchableOpacity>

      <TouchableOpacity
        className="border border-purple-600 py-3 rounded-lg mt-2"
        onPress={() => {
          clearLoginError();
          router.push("/(auth)/register");
        }}
      >
        <Text className="text-center text-purple-400 font-bold">
          Registrarse
        </Text>
      </TouchableOpacity>

      <Text className="text-center text-gray-400 mt-4">
        Olvidé mi contraseña
      </Text>
    </View>
  );
}
