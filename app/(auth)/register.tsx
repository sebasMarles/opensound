import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

type RegisterData = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export default function Register() {
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterData>();

  const onSubmit = (data: RegisterData) => {
    console.log("Registro enviado:", data);
  };

  const password = watch("password");

  return (
    <View className="flex-1 justify-center px-6 bg-neutral-900">
      {/* Botón volver al Login */}
      <TouchableOpacity
        className="absolute top-10 left-4 z-10"
        onPress={() => router.push("/login")}
      >
        <Ionicons name="arrow-back" size={28} color="white" />
      </TouchableOpacity>

      {/* Logo / título */}
      <Text className="text-center text-3xl font-bold text-purple-500 mb-8">
        OpenSound - Registro
      </Text>

      {/* Nombre */}
      <Controller
        control={control}
        name="name"
        rules={{ required: "El nombre es obligatorio" }}
        render={({ field: { onChange, value } }) => (
          <TextInput
            className="bg-neutral-800 text-white px-4 py-3 rounded-lg mb-2"
            placeholder="Nombre completo"
            placeholderTextColor="#888"
            value={value}
            onChangeText={onChange}
          />
        )}
      />
      {errors.name && (
        <Text className="text-red-500 mb-2">{errors.name.message}</Text>
      )}

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

      {/* Confirmar contraseña */}
      <Controller
        control={control}
        name="confirmPassword"
        rules={{
          required: "Confirma tu contraseña",
          validate: (value) =>
            value === password || "Las contraseñas no coinciden",
        }}
        render={({ field: { onChange, value } }) => (
          <TextInput
            className="bg-neutral-800 text-white px-4 py-3 rounded-lg mb-2"
            placeholder="Confirmar contraseña"
            placeholderTextColor="#888"
            secureTextEntry
            value={value}
            onChangeText={onChange}
          />
        )}
      />
      {errors.confirmPassword && (
        <Text className="text-red-500 mb-2">
          {errors.confirmPassword.message}
        </Text>
      )}

      {/* Botón Registrarse */}
      <TouchableOpacity
        className="bg-purple-600 py-3 rounded-lg mt-4"
        onPress={handleSubmit(onSubmit)}
      >
        <Text className="text-center text-white font-bold">Registrarse</Text>
      </TouchableOpacity>
    </View>
  );
}
