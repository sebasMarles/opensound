import { useState } from "react";
import { KeyboardAvoidingView, Platform, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Controller, useForm } from "react-hook-form";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import Text from "@/ui/atoms/Text";
import Button from "@/ui/atoms/Button";
import { Input } from "@/ui/atoms/Input";
import { useAuth } from "@/core/auth/AuthProvider";

type FormData = {
  email: string;
  password: string;
};

export default function Login() {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    mode: "onBlur",
    defaultValues: { email: "", password: "" },
  });
  // useAuth provee los métodos de sesión expuestos por el provider global.
  const { signIn, loading } = useAuth();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async (data: FormData) => {
    try {
      setErrorMessage(null);
      await signIn({ email: data.email.trim(), password: data.password });
      router.replace("/(tabs)");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "No se pudo iniciar sesión";
      setErrorMessage(message);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-neutral-950">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        <View className="flex-1 px-6 pt-10">
          <TouchableOpacity
            className="w-10 h-10 items-center justify-center"
            onPress={() => router.back()}
            accessibilityLabel="Volver"
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>

          <View className="mt-10 mb-8">
            <Text variant="title" className="text-purple-400 text-center">
              OpenSound
            </Text>
            <Text className="text-gray-400 text-center mt-2">
              Ingresa tus credenciales para continuar escuchando
            </Text>
          </View>

          <View className="space-y-5">
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
                      placeholder="Tu contraseña"
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
          </View>

          {errorMessage && (
            <Text className="text-red-400 text-center mt-6">{errorMessage}</Text>
          )}

          <Button
            className="mt-8"
            onPress={handleSubmit(onSubmit)}
            loading={loading}
            accessibilityLabel="Iniciar sesión"
          >
            Iniciar sesión
          </Button>

          <Button
            variant="outline"
            className="mt-4"
            onPress={() => router.push("/(auth)/register")}
            accessibilityLabel="Ir a registro"
          >
            Crear cuenta
          </Button>

          <TouchableOpacity className="mt-6" accessibilityLabel="Recuperar contraseña">
            <Text variant="caption" className="text-center text-gray-400">
              ¿Olvidaste tu contraseña?
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
