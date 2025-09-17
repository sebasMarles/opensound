import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

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

  const onSubmit = (data: FormData) => {
    console.log("Datos enviados:", data);
  };

  return (
    <View className="flex-1 justify-center px-6 bg-neutral-900">
      {/* Botón volver al Home */}
      <TouchableOpacity
        className="absolute top-10 left-4 z-10"
        onPress={() => router.push("/")}
      >
        <Ionicons name="arrow-back" size={28} color="white" />
      </TouchableOpacity>

      {/* Logo / título */}
      <Text className="text-center text-3xl font-bold text-purple-500 mb-8">
        OpenSound
      </Text>

      {/* Correo */}
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
            value={value}
            onChangeText={onChange}
          />
        )}
      />
      {errors.email && (
        <Text className="text-red-500 mb-2">{errors.email.message}</Text>
      )}

      {/* Contraseña */}
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
            value={value}
            onChangeText={onChange}
          />
        )}
      />
      {errors.password && (
        <Text className="text-red-500 mb-2">{errors.password.message}</Text>
      )}

      {/* Botón Iniciar Sesión */}
      <TouchableOpacity
        className="bg-purple-600 py-3 rounded-lg mt-4"
        onPress={handleSubmit(onSubmit)}
      >
        <Text className="text-center text-white font-bold">Iniciar Sesión</Text>
      </TouchableOpacity>

      {/* Botón Registrarse */}
      <TouchableOpacity
        className="border border-purple-600 py-3 rounded-lg mt-2"
        onPress={() => router.push("/register")}
      >
        <Text className="text-center text-purple-400 font-bold">
          Registrarse
        </Text>
      </TouchableOpacity>

      {/* Recuperar contraseña */}
      <Text className="text-center text-gray-400 mt-4">
        Olvidé mi contraseña
      </Text>
    </View>
  );
}
