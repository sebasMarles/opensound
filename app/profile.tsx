import { useMemo } from "react";
import { TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import Text from "@/ui/atoms/Text";
import Button from "@/ui/atoms/Button";
import { useAuth } from "@/core/auth/AuthProvider";

const getInitials = (name?: string | null) => {
  if (!name) return "OS";
  const parts = name
    .split(" ")
    .filter((part) => part.trim().length > 0)
    .slice(0, 2);
  if (parts.length === 0) return "OS";
  return parts
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
};

export default function ProfileScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const initials = useMemo(() => getInitials(user?.name), [user?.name]);

  return (
    <SafeAreaView className="flex-1 bg-black px-6 pt-6">
      <View className="flex-row items-center justify-between mb-10">
        <TouchableOpacity
          onPress={() => router.back()}
          className="p-2"
          accessibilityRole="button"
          accessibilityLabel="Volver"
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text className="text-white text-lg font-semibold">Perfil</Text>
        <View style={{ width: 36 }} />
      </View>

      <View className="items-center">
        <View className="w-24 h-24 rounded-full bg-purple-600 items-center justify-center mb-4">
          <Text className="text-white text-3xl font-bold">{initials}</Text>
        </View>
        <Text className="text-white text-2xl font-bold">
          {user?.name ?? "Invitado"}
        </Text>
        <Text className="text-gray-400 mt-1">{user?.email ?? "Sin correo"}</Text>
      </View>

      <View className="mt-10 bg-neutral-900 rounded-2xl p-6 space-y-4">
        <View className="flex-row justify-between items-center">
          <Text className="text-gray-400">Rol</Text>
          <Text className="text-white font-semibold">{user?.role ?? "usuario"}</Text>
        </View>
        <View className="flex-row justify-between items-center">
          <Text className="text-gray-400">Identificador</Text>
          <Text className="text-white font-semibold">{user?.id ?? "No disponible"}</Text>
        </View>
      </View>

      <Button className="mt-12" onPress={() => router.replace("/(tabs)")}>Ir al inicio</Button>
    </SafeAreaView>
  );
}
