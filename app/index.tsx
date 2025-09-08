import React, { useEffect, useState } from "react";
import { View, FlatList, ActivityIndicator, Text } from "react-native";
import { getRecentSongs } from "../lib/jamendo";
import SongListItem from "../components/SongListItem";
import Player from "../components/Player";

export default function HomeScreen() {
  const [songs, setSongs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSong, setSelectedSong] = useState<any | null>(null);

  useEffect(() => {
    const fetchSongs = async () => {
      try {
        const data = await getRecentSongs(20);
        setSongs(data);
      } catch (err) {
        console.error("Error cargando canciones", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSongs();
  }, []);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" />
        <Text className="mt-2">Cargando canciones...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      {songs.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <Text>No se encontraron canciones</Text>
        </View>
      ) : (
        <FlatList
          data={songs}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <SongListItem song={item} onPress={() => setSelectedSong(item)} />
          )}
          contentContainerStyle={{ paddingBottom: 120 }}
        />
      )}

      {selectedSong && (
        <View className="absolute bottom-0 left-0 right-0">
          <Player song={selectedSong} />
        </View>
      )}
    </View>
  );
}
