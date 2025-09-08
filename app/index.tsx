import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getRecentSongs } from "../services/jamendo";
import SongCard from "../components/SongCard";
import SongListItem from "../components/SongListItem";

const categories = ["Todo", "Pop", "Rock", "Electrónica", "Hip-Hop", "Indie"];

export default function HomeScreen() {
  const [songs, setSongs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("Todo");

  useEffect(() => {
    let mounted = true;

    const fetchSongs = async () => {
      try {
        const data = await getRecentSongs(20);
        console.log("✅ Canciones obtenidas:", data.results?.length || 0);

        const results: any[] = Array.isArray(data)
          ? data
          : data?.results ?? [];

        if (mounted) setSongs(results);
      } catch (err: any) {
        console.error("Error al obtener canciones:", err);
        if (mounted) setError(err.message ?? "Error al cargar canciones");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchSongs();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <View className="flex-1 bg-black justify-center items-center">
        <ActivityIndicator size="large" color="#D400FF" />
        <Text className="text-white mt-4">Cargando canciones...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 bg-black justify-center items-center p-4">
        <Text className="text-red-500 mb-2">Error</Text>
        <Text className="text-white text-center">{error}</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-black px-4 pt-10">
      {/* Navbar */}
      <View className="flex-row items-center justify-between mb-6 px-1">
        <Text className="text-white text-2xl font-extrabold">OpenSound</Text>

        <View className="flex-row items-center space-x-6">
          <TouchableOpacity>
            <Ionicons name="search" size={26} color="white" />
          </TouchableOpacity>
          <TouchableOpacity>
            <Image
              source={{ uri: "https://i.pravatar.cc/100" }}
              className="w-10 h-10 rounded-full"
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Categorias */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6" contentContainerStyle={{ paddingHorizontal: 16 }}>
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat}
            onPress={() => setSelectedCategory(cat)}
            className={`h-10 px-5 flex items-center justify-center rounded-full mr-3 ${
              selectedCategory === cat ? "bg-purple-600" : "bg-neutral-800"
            }`}
          >
            <Text className="text-white text-sm font-medium">{cat}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      
      <Text className="text-white text-lg font-bold mb-4">Recomendados</Text>
      <FlatList
        data={songs.slice(0, 10)}
        renderItem={({ item }) => <SongCard song={item} />}
        keyExtractor={(item) => String(item.id)}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 8 }}
      />

      
      <Text className="text-white text-lg font-bold mt-6 mb-4">
        Todas las canciones
      </Text>
      <FlatList
        data={songs}
        renderItem={({ item }) => <SongListItem song={item} />}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ paddingBottom: 120 }}
      />
    </View>
  );
}
