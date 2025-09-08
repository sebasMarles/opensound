import { useState } from "react";
import { View, Text, ScrollView, Image, TouchableOpacity } from "react-native";

export default function HomeScreen() {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <View className="flex-1 bg-black">
      <ScrollView
        className="flex-1 px-4 pt-16"
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* Logo y acciones */}
        <View className="flex-row justify-between items-center mb-6">
          {/* Logo + Nombre */}
          <View className="flex-row items-center">
            <Image
              source={require("../assets/logo.png")}
              className="w-8 h-8 mr-2"
              resizeMode="contain"
            />
            <Text className="text-white text-xl font-bold">OpenSound</Text>
          </View>

          {/* Acciones */}
          <View className="flex-row space-x-4">
            <TouchableOpacity>
              <Image
                source={require("../assets/lupa.png")}
                className="w-8 h-8"
                resizeMode="contain"
              />
            </TouchableOpacity>
            <TouchableOpacity>
              <Image
                source={require("../assets/usuario.png")}
                className="w-8 h-8"
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Filtros */}
        <View className="flex-row justify-around mb-6">
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

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mb-6"
        >
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
          {[
            "No Me Conoce (Remix)",
            "Travesuras (Remix)",
            "Piensan",
            "Cúrame",
            "Gold Feet",
            "Shangri La",
            "Not You Too (Ft. Chris Brown)",
            "Is There Someone Else?",
          ].map((song, idx) => (
            <View
              key={idx}
              className="flex-row items-center justify-between"
            >
              {/* Imagen + nombre */}
              <View className="flex-row items-center">
                <Image
                  source={{ uri: "https://picsum.photos/100" }}
                  className="w-12 h-12 rounded-lg mr-3"
                />
                <Text className="text-white">{song}</Text>
              </View>

              {/* Botón de opciones */}
              <TouchableOpacity onPress={() => console.log(`Opciones de ${song}`)}>
                <Image
                  source={require("../assets/songoptions.png")}
                  className="w-6 h-6"
                  resizeMode="contain"
                />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
