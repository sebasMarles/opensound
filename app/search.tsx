import { View, Text, TextInput, ScrollView, Image } from "react-native";

export default function BuscarScreen() {
  return (
    <ScrollView className="flex-1 bg-black px-4 pt-10">
      {/* Logo */}
      <View className="flex-row justify-between items-center mb-6">
        <Text className="text-white text-xl font-bold">OpenSound</Text>
        <Text className="text-white text-lg">⋮</Text>
      </View>

      {/* Barra de búsqueda */}
      <TextInput
        placeholder="Buscar..."
        placeholderTextColor="#aaa"
        className="bg-purple-700 text-white px-4 py-3 rounded-xl mb-6"
      />

      {/* Busquedas recientes */}
      <Text className="text-white text-lg font-bold mb-4">Búsquedas recientes</Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6">
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

      {/* Mini reproductor */}
      <View className="absolute bottom-0 left-0 right-0 bg-black border-t border-purple-600 px-4 py-3 flex-row items-center">
        <Image
          source={{ uri: "https://picsum.photos/100" }}
          className="w-12 h-12 rounded-lg mr-3"
        />
        <View className="flex-1">
          <Text className="text-white font-bold">Don’t Cry</Text>
          <Text className="text-gray-400 text-sm">Guns N’ Roses</Text>
        </View>
        <Text className="text-white text-lg">⏯️</Text>
      </View>
    </ScrollView>
  );
}
