import { useState } from "react";
import { View, Text, TextInput, ScrollView, Image, TouchableOpacity } from "react-native";

export default function BuscarScreen() {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <View className="flex-1 bg-black">
      <ScrollView
        className="flex-1 px-4 pt-16"
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* Logo + Nombre */}
        <View className="flex-row items-center mb-6">
          <Image
            source={require("../assets/logo.png")}
            className="w-8 h-8 mr-2"
            resizeMode="contain"
          />
          <Text className="text-white text-xl font-bold">OpenSound</Text>
        </View>

        {/* Barra de búsqueda */}
        <TextInput
          placeholder="Buscar..."
          placeholderTextColor="#aaa"
          className="bg-purple-700 text-white px-4 py-3 rounded-xl mb-6"
        />

        {/* Búsquedas recientes */}
        <Text className="text-white text-lg font-bold mb-4">
          Búsquedas recientes
        </Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mb-6"
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
