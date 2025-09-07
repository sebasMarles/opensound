import { View, Text, ScrollView, Image, TouchableOpacity } from "react-native";

export default function HomeScreen() {
  return (
    <ScrollView className="flex-1 bg-black px-4 pt-10">
      {/* Logo y acciones */}
      <View className="flex-row justify-between items-center mb-6">
        <Text className="text-white text-xl font-bold">OpenSound</Text>
        <View className="flex-row space-x-4">
          <Text className="text-white text-lg">🔍</Text>
          <Text className="text-white text-lg">⚙️</Text>
        </View>
      </View>

      {/* Filtros */}
      <View className="flex-row space-x-3 mb-6">
        {["Rock", "Reggaetón y vibras", "Trap"].map((tag) => (
          <TouchableOpacity
            key={tag}
            className="bg-purple-700 px-4 py-2 rounded-full"
          >
            <Text className="text-white text-sm font-semibold">{tag}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Más recientes */}
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-white text-lg font-bold">Más recientes</Text>
        <Text className="text-purple-400">Más</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6">
        {[1, 2, 3, 4].map((i) => (
          <View key={i} className="mr-4">
            <Image
              source={{ uri: "https://picsum.photos/200" }}
              className="w-32 h-32 rounded-xl"
            />
            <Text className="text-white text-sm mt-2">Item {i}</Text>
          </View>
        ))}
      </ScrollView>

      {/* Lista de canciones */}
      <View className="space-y-4">
        {["No Me Conoce (Remix)", "Travesuras (Remix)", "Piensan", "Cúrame"].map(
          (song, idx) => (
            <View
              key={idx}
              className="flex-row items-center justify-between"
            >
              <View className="flex-row items-center">
                <Image
                  source={{ uri: "https://picsum.photos/100" }}
                  className="w-12 h-12 rounded-lg mr-3"
                />
                <Text className="text-white">{song}</Text>
              </View>
              <Text className="text-white">⋮</Text>
            </View>
          )
        )}
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
