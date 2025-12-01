"use client";

import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";

import {
  getArtistById,
  getArtistTracks,
  type Artist,
  type Track,
} from "../../services/jamendo";
import { useMusicPlayer } from "../../context/MusicPlayerContext";
import SongOptionsModal from "../../components/modals/SongOptionsModal";
import AddToPlaylistModal from "../../components/modals/AddToPlaylistModal";
import { extractJamendoId } from "../../utils/jamendo";
import MiniReproductor from "../../components/MiniReproductor";

const { width } = Dimensions.get("window");

export default function ArtistDetailScreen() {
  const { id, name } = useLocalSearchParams<{ id: string; name: string }>();
  const router = useRouter();
  const { playFromJamendoTrack, currentSong } = useMusicPlayer();

  const [artist, setArtist] = useState<Artist | null>(null);
  const [topTracks, setTopTracks] = useState<Track[]>([]);
  const [recentTracks, setRecentTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedSong, setSelectedSong] = useState<Track | null>(null);
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [showAddToPlaylistModal, setShowAddToPlaylistModal] = useState(false);

  useEffect(() => {
    loadArtistData();
  }, [id, name]);

  const loadArtistData = async () => {
    setLoading(true);
    try {
      // 1. Info del artista
      // Si viene el nombre en los params, lo usamos para buscar tracks
      // Si solo viene ID, buscamos info del artista primero
      let currentArtistName = name;

      if (id && id !== "search") {
        const artistData = await getArtistById(id);
        if (artistData) {
          setArtist(artistData);
          currentArtistName = artistData.name;
        }
      }

      if (currentArtistName) {
        // 2. Top canciones (Carrusel)
        const top = await getArtistTracks(currentArtistName, "popularity_total", 10);
        setTopTracks(top);

        // 3. Canciones recientes (Lista)
        const recent = await getArtistTracks(currentArtistName, "releasedate", 20);
        setRecentTracks(recent);
      }
    } catch (error) {
      console.error("Error cargando artista:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlaySong = async (track: Track) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      await playFromJamendoTrack(track);
    } catch (error) {}
  };

  const handleOpenOptions = (track: Track) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedSong(track);
    setShowOptionsModal(true);
  };

  const handleAddToPlaylist = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowAddToPlaylistModal(true);
  };

  if (loading) {
    return (
      <View className="flex-1 bg-black justify-center items-center">
        <ActivityIndicator size="large" color="#A855F7" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-black">
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Header con Imagen y Gradiente */}
        <View className="relative h-72 w-full">
          <Image
            source={{
              uri: artist?.image || "https://via.placeholder.com/400",
            }}
            className="w-full h-full"
            resizeMode="cover"
          />
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.8)", "#000000"]}
            className="absolute bottom-0 w-full h-full justify-end p-6"
          >
            <Text className="text-white text-4xl font-bold mb-2">
              {artist?.name || name || "Artista"}
            </Text>
            <View className="flex-row items-center space-x-4">
              <Text className="text-gray-300 text-sm">
                {topTracks.length + recentTracks.length} canciones disponibles
              </Text>
            </View>
          </LinearGradient>

          {/* Boton Atras */}
          <TouchableOpacity
            className="absolute top-12 left-4 bg-black/50 p-2 rounded-full"
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* Carrusel Top Canciones */}
        <View className="mt-6 pl-4">
          <Text className="text-white text-xl font-bold mb-4">Más Escuchadas</Text>
          <FlatList
            data={topTracks}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                className="mr-4 w-36"
                onPress={() => handlePlaySong(item)}
              >
                <Image
                  source={{
                    uri: item.album_image || item.image || "https://via.placeholder.com/150",
                  }}
                  className="w-36 h-36 rounded-lg mb-2"
                />
                <Text className="text-white font-semibold" numberOfLines={1}>
                  {item.name}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>

        {/* Lista Canciones Recientes */}
        <View className="mt-8 px-4">
          <Text className="text-white text-xl font-bold mb-4">Lanzamientos Recientes</Text>
          <View className="space-y-4">
            {recentTracks.map((track, index) => (
              <View key={track.id} className="flex-row items-center">
                <Text className="text-gray-500 w-6 text-center mr-2 font-bold">
                  {index + 1}
                </Text>
                <TouchableOpacity
                  className="flex-1 flex-row items-center"
                  onPress={() => handlePlaySong(track)}
                >
                  <Image
                    source={{
                      uri: track.album_image || track.image || "https://via.placeholder.com/60",
                    }}
                    className="w-12 h-12 rounded mr-3"
                  />
                  <View className="flex-1">
                    <Text className="text-white font-medium" numberOfLines={1}>
                      {track.name}
                    </Text>
                    <Text className="text-gray-400 text-xs">
                      {new Date().getFullYear()} • Sencillo
                    </Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  className="p-2"
                  onPress={() => handleOpenOptions(track)}
                >
                  <Ionicons name="ellipsis-vertical" size={20} color="gray" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Modales */}
      {selectedSong && (
        <SongOptionsModal
          visible={showOptionsModal}
          onClose={() => {
            setShowOptionsModal(false);
            setSelectedSong(null);
          }}
          song={selectedSong}
          onAddToPlaylist={handleAddToPlaylist}
          onGoToArtist={() => {
            if (selectedSong) {
              router.push({
                pathname: "/(tabs)/artist-detail",
                params: {
                  id: "search",
                  name: selectedSong.artist_name || "Artista desconocido",
                },
              });
            }
          }}
        />
      )}

      {selectedSong && (
        <AddToPlaylistModal
          visible={showAddToPlaylistModal}
          onClose={() => setShowAddToPlaylistModal(false)}
          song={{
            jamendoId: extractJamendoId(selectedSong),
            name: selectedSong.name,
            artist_name: selectedSong.artist_name,
            image: selectedSong.album_image || selectedSong.image,
            album_image: selectedSong.album_image,
            audio: selectedSong.audio,
          }}
          onCreateNew={() => {
            setShowAddToPlaylistModal(false);
            // TODO: Abrir modal de crear playlist
          }}
        />
      )}

      {/* Mini Reproductor */}
      {currentSong && (
        <View className="absolute bottom-0 left-0 right-0 z-10">
          <MiniReproductor />
        </View>
      )}
    </View>
  );
}
