import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Controller, useForm } from "react-hook-form";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import Text from "@/ui/atoms/Text";
import Button from "@/ui/atoms/Button";
import { Input } from "@/ui/atoms/Input";
import { useAuthStore } from "@/core/auth/authStore";
import type { RegisterCredentials } from "@/types/auth";

export default function RegisterScreen() {
  const router = useRouter();
  // Reutilizamos el store para aprovechar la lógica de registro y manejo de errores.
  const { register: registerUser, isLoading, error, clearError } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterCredentials>({
    mode: "onBlur",
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const password = watch("password");

  const onSubmit = async (values: RegisterCredentials) => {
    clearError();
    try {
      await registerUser(values);
      router.replace("/(tabs)");
    } catch {
      // El store ya expone el mensaje de error.
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-neutral-950">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="flex-1 px-6 pt-10 pb-10">
            <TouchableOpacity
              className="w-10 h-10 items-center justify-center"
              onPress={() => router.back()}
              accessibilityLabel="Volver"
            >
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>

            <Text variant="title" className="text-center text-purple-400 mt-6">
              Crear cuenta
            </Text>
            <Text className="text-gray-400 text-center mt-2 mb-10">
              Forma parte de la comunidad OpenSound y administra tus playlists
            </Text>

            <View className="space-y-6">
              <View>
                <Text className="text-gray-300 text-sm mb-2">Nombre completo</Text>
                <Controller
                  control={control}
                  name="name"
                  rules={{
                    required: "El nombre es obligatorio",
                    minLength: { value: 2, message: "Mínimo 2 caracteres" },
                    maxLength: { value: 60, message: "Máximo 60 caracteres" },
                  }}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      placeholder="Tu nombre completo"
                      autoCapitalize="words"
                      autoCorrect
                      hasError={Boolean(errors.name)}
                    />
                  )}
                />
                {errors.name && (
                  <Text variant="caption" className="text-red-400 mt-1">
                    {errors.name.message}
                  </Text>
                )}
              </View>

              <View>
                <Text className="text-gray-300 text-sm mb-2">Correo electrónico</Text>
                <Controller
                  control={control}
                  name="email"
                  rules={{
                    required: "El correo es obligatorio",
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: "Correo inválido",
                    },
                    maxLength: { value: 80, message: "Máximo 80 caracteres" },
                  }}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      placeholder="tu@email.com"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                      hasError={Boolean(errors.email)}
                    />
                  )}
                />
                {errors.email && (
                  <Text variant="caption" className="text-red-400 mt-1">
                    {errors.email.message}
                  </Text>
                )}
              </View>

              <View>
                <Text className="text-gray-300 text-sm mb-2">Contraseña</Text>
                <View className="relative">
                  <Controller
                    control={control}
                    name="password"
                    rules={{
                      required: "La contraseña es obligatoria",
                      minLength: { value: 6, message: "Mínimo 6 caracteres" },
                      maxLength: { value: 64, message: "Máximo 64 caracteres" },
                    }}
                    render={({ field: { onChange, onBlur, value } }) => (
                      <Input
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        placeholder="Crea una contraseña segura"
                        secureTextEntry={!showPassword}
                        autoCapitalize="none"
                        autoCorrect={false}
                        hasError={Boolean(errors.password)}
                      />
                    )}
                  />
                  <TouchableOpacity
                    className="absolute right-3 top-3"
                    onPress={() => setShowPassword((prev) => !prev)}
                    accessibilityLabel={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  >
                    <Ionicons name={showPassword ? "eye-off" : "eye"} size={20} color="#9CA3AF" />
                  </TouchableOpacity>
                </View>
                {errors.password && (
                  <Text variant="caption" className="text-red-400 mt-1">
                    {errors.password.message}
                  </Text>
                )}
              </View>

              <View>
                <Text className="text-gray-300 text-sm mb-2">Confirmar contraseña</Text>
                <View className="relative">
                  <Controller
                    control={control}
                    name="confirmPassword"
                    rules={{
                      required: "Confirma tu contraseña",
                      validate: (value) =>
                        value === password || "Las contraseñas no coinciden",
                    }}
                    render={({ field: { onChange, onBlur, value } }) => (
                      <Input
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        placeholder="Repite tu contraseña"
                        secureTextEntry={!showConfirmPassword}
                        autoCapitalize="none"
                        autoCorrect={false}
                        hasError={Boolean(errors.confirmPassword)}
                      />
                    )}
                  />
                  <TouchableOpacity
                    className="absolute right-3 top-3"
                    onPress={() => setShowConfirmPassword((prev) => !prev)}
                    accessibilityLabel={
                      showConfirmPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                    }
                  >
                    <Ionicons name={showConfirmPassword ? "eye-off" : "eye"} size={20} color="#9CA3AF" />
                  </TouchableOpacity>
                </View>
                {errors.confirmPassword && (
                  <Text variant="caption" className="text-red-400 mt-1">
                    {errors.confirmPassword.message}
                  </Text>
                )}
              </View>
            </View>

            {error && (
              <View className="bg-red-900/20 border border-red-500 rounded-lg p-3 mt-6">
                <Text className="text-red-400 text-sm text-center">{error}</Text>
              </View>
            )}

            <Button
              className="mt-8"
              onPress={handleSubmit(onSubmit)}
              loading={isLoading}
              accessibilityLabel="Crear cuenta"
              fullWidth
            >
              Crear cuenta
            </Button>

            <Text variant="caption" className="text-center text-gray-400 mt-4">
              Al registrarte aceptas nuestros <Text className="text-purple-400">Términos</Text> y
              <Text className="text-purple-400"> Política de Privacidad</Text>.
            </Text>

            <View className="flex-row justify-center items-center mt-6">
              <Text className="text-gray-400">¿Ya tienes cuenta?</Text>
              <TouchableOpacity onPress={() => router.push("/(auth)/login")} className="ml-2">
                <Text className="text-purple-400 font-semibold">Inicia sesión</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
