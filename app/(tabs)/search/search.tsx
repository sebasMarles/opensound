import { View, Text, TextInput, ScrollView, Image, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../../../context/AuthContext";

export default function BuscarScreen() {
  const router = useRouter();
  const { token } = useAuth();

  return (
    <View className="flex-1 bg-black">
      <ScrollView
        style={{ flex: 1, paddingHorizontal: 16 }}
        contentContainerStyle={{ paddingTop: 8, paddingBottom: 90 }}
      >
        {/* Encabezado superior */}
        <View className="flex-row justify-between items-center mb-6">
          {/* Logo + Nombre */}
          <View className="flex-row items-center">
            <Image
              source={require("../../../assets/logo.png")}
              className="w-8 h-8 mr-2"
              resizeMode="contain"
            />
            <Text className="text-white text-xl font-bold">OpenSound</Text>
          </View>

          {/* Iconos de búsqueda y usuario */}
          <View className="flex-row space-x-4">
            <TouchableOpacity
              onPress={() =>
                router.push(token ? "/profile" : "/(auth)/login")
              }
            >
              <Image
                source={require("../../../assets/usuario.png")}
                className="w-8 h-8"
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Barra de búsqueda */}
        <TextInput
          placeholder="Buscar..."
          placeholderTextColor="#aaa"
          className="bg-gray-800 text-white px-4 py-3 rounded-xl mb-6 border border-purple-600"
        />


        {/* Búsquedas recientes */}
        <Text className="text-white text-lg font-bold mb-4">
          Búsquedas recientes
        </Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mb-8"
        >
          {[1, 2, 3, 4].map((i) => (
            <Image
              key={i}
              source={{ uri: "https://picsum.photos/200" }}
              className="w-28 h-28 rounded-lg mr-3"
            />
          ))}
        </ScrollView>

        {/* Lista de resultados */}
        <View className="space-y-3 mb-20">
          {[
            "Gold Feet",
            "Hooka",
            "Niggas in Paris",
            "Moon",
            "Ensalada",
            "I Wonder",
            "Heartless",
            "Save Your Tears",
          ].map((item, idx) => (
            <View key={idx} className="flex-row items-center">
              <Text className="text-white text-lg mr-3">○</Text>
              <Text className="text-white text-base">{item}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
