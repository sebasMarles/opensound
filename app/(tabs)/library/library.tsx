import { View, Text, Image, ScrollView, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";

export default function Library() {
  const router = useRouter();

  const recientes = [
    { id: 1, titulo: "Cúrame", portada: "https://picsum.photos/200" },
    { id: 2, titulo: "La Llevo Al Cielo", portada: "https://picsum.photos/201" },
    { id: 3, titulo: "Otro Hit", portada: "https://picsum.photos/202" },
  ];

  return (
    <View className="flex-1 bg-black">
      <ScrollView
        style={{ flex: 1, paddingHorizontal: 16 }}
        contentContainerStyle={{ paddingTop: 8, paddingBottom: 90 }}
      >
        {/* Encabezado superior */}
        <View className="flex-row justify-between items-center mb-6">
          <View className="flex-row items-center">
            <Image
              source={require("../../../assets/logo.png")}
              className="w-8 h-8 mr-2"
              resizeMode="contain"
            />
            <Text className="text-white text-xl font-bold">OpenSound</Text>
          </View>

          <View className="flex-row space-x-4">
            <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
              <Image
                source={require("../../../assets/usuario.png")}
                className="w-8 h-8"
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Actividad reciente */}
        <Text className="text-white text-lg font-bold mb-4">Actividad reciente</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-8">
          {recientes.map((item) => (
            <View key={item.id} className="mr-4">
              <Image
                source={{ uri: item.portada }}
                className="w-32 h-32 rounded-xl mb-2"
                resizeMode="cover"
              />
              <Text className="text-white text-sm text-center w-32" numberOfLines={1}>
                {item.titulo}
              </Text>
            </View>
          ))}
          <View className="w-16 h-32 justify-center items-center opacity-40">
            <Text className="text-white">...</Text>
          </View>
        </ScrollView>

        {/* Opciones */}
        <View className="space-y-6">
          <TouchableOpacity className="flex-row items-center">
            <Ionicons name="list-outline" size={24} color="white" />
            <Text className="text-white text-lg ml-4">Listas de reproducción</Text>
          </TouchableOpacity>

          <TouchableOpacity className="flex-row items-center">
            <Ionicons name="albums-outline" size={24} color="white" />
            <Text className="text-white text-lg ml-4">Álbumes</Text>
          </TouchableOpacity>

          <TouchableOpacity className="flex-row items-center">
            <Ionicons name="musical-notes-outline" size={24} color="white" />
            <Text className="text-white text-lg ml-4">Canciones</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
