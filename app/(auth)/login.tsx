import { useState } from "react";
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
  const { signIn, loading } = useAuth();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
    <View className="flex-1 justify-center px-6 bg-neutral-900">
      <TouchableOpacity
        className="absolute top-10 left-4 z-10"
        onPress={() => router.back()}
        accessibilityRole="button"
        accessibilityLabel="Volver al inicio"
      >
        <Ionicons name="arrow-back" size={28} color="white" />
      </TouchableOpacity>

      <Text className="text-center text-3xl font-bold text-purple-500 mb-8">
        OpenSound
      </Text>

      <Controller
        control={control}
        name="email"
        rules={{
          required: "El correo es obligatorio",
          pattern: {
            value: /\S+@\S+\.\S+/,
            message: "Correo inválido",
          },
        }}
        render={({ field: { onChange, value } }) => (
          <TextInput
            className="bg-neutral-800 text-white px-4 py-3 rounded-lg mb-2"
            placeholder="Correo"
            placeholderTextColor="#888"
            keyboardType="email-address"
            autoCapitalize="none"
            value={value}
            onChangeText={onChange}
          />
        )}
      />
      {errors.email && (
        <Text className="text-red-500 mb-2">{errors.email.message}</Text>
      )}

      <Controller
        control={control}
        name="password"
        rules={{
          required: "La contraseña es obligatoria",
          minLength: {
            value: 6,
            message: "Mínimo 6 caracteres",
          },
        }}
        render={({ field: { onChange, value } }) => (
          <TextInput
            className="bg-neutral-800 text-white px-4 py-3 rounded-lg mb-2"
            placeholder="Contraseña"
            placeholderTextColor="#888"
            secureTextEntry
            autoCapitalize="none"
            value={value}
            onChangeText={onChange}
          />
        )}
      />
      {errors.password && (
        <Text className="text-red-500 mb-2">{errors.password.message}</Text>
      )}

      {errorMessage && (
        <Text className="text-red-400 text-center mb-2">{errorMessage}</Text>
      )}

      <TouchableOpacity
        className="bg-purple-600 py-3 rounded-lg mt-4 flex-row items-center justify-center"
        onPress={handleSubmit(onSubmit)}
        disabled={loading}
        accessibilityRole="button"
        accessibilityState={{ disabled: loading }}
      >
        {loading && (
          <ActivityIndicator style={{ marginRight: 8 }} size="small" color="#fff" />
        )}
        <Text className="text-center text-white font-bold">Iniciar Sesión</Text>
      </TouchableOpacity>

      <TouchableOpacity
        className="border border-purple-600 py-3 rounded-lg mt-2"
        onPress={() => router.push("/(auth)/register")}
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
