"use client";

// app/(tabs)/index.tsx
import { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { getRecentSongs, searchSongs } from "../../services/jamendo";
import { useMusicPlayer } from "../../context/MusicPlayerContext";
import { useAuth } from "../../context/AuthContext";
import SongOptionsModal from "../../components/modals/SongOptionsModal";
import AddToPlaylistModal from "../../components/modals/AddToPlaylistModal";
import CreatePlaylistModal from "../../components/modals/CreatePlaylistModal";
import type { AddSongDto } from "../../types/playlist";
import { extractJamendoId } from "../../utils/jamendo";
import * as Haptics from "expo-haptics";

type TagOption = { label: string; query: string };

const TAGS: TagOption[] = [
  { label: "Rock", query: "rock" },
  { label: "Reggaetón y vibras", query: "reggaeton" },
  { label: "Trap", query: "trap" },
];

export default function HomeScreen() {
  const router = useRouter();
  const {
    setQueueFromJamendo,
    playFromJamendoTrack,
    currentSong,
    setCurrentSong,
    setIsPlaying,
  } = useMusicPlayer();
  const { token, signOut } = useAuth();

  const [recent, setRecent] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedSong, setSelectedSong] = useState<any | null>(null);
  const [showSongOptions, setShowSongOptions] = useState(false);
  const [showAddToPlaylist, setShowAddToPlaylist] = useState(false);
  const [showCreatePlaylist, setShowCreatePlaylist] = useState(false);

  const pulse = useRef(new Animated.Value(0.3)).current;

  // Efecto de pulso para el texto "Cargando..."
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0.3,
          duration: 700,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  // Cargar canciones recientes (con protección y reintento)
  useEffect(() => {
    let ignore = false;

    const loadRecent = async (retry = 1) => {
      try {
        setError(null);
        setLoading(true);
        await new Promise((r) => setTimeout(r, 250)); // pequeño delay por estabilidad
        const data = await getRecentSongs(12);
        if (!ignore) {
          setRecent(Array.isArray(data) ? data : []);
          setQueueFromJamendo(Array.isArray(data) ? data : []);
        }
      } catch (e) {
        if (retry > 0) {
          await new Promise((r) => setTimeout(r, 600));
          loadRecent(retry - 1);
          return;
        }
        if (!ignore) setError("No se pudieron cargar las canciones recientes.");
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    loadRecent();
    return () => {
      ignore = true;
    };
  }, [setQueueFromJamendo]);

  const coverOf = (t: any) =>
    t?.album_image || t?.image || "https://picsum.photos/200";

  const playTrack = async (t: any) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      await playFromJamendoTrack(t);
    } catch {}
  };

  const handleProfilePress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (token) router.push("/profile");
    else router.push("/(auth)/login");
  }, [router, token]);

  const handleLogout = useCallback(() => {
    if (!token) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);

    setIsPlaying(false);
    setCurrentSong(null);

    signOut()
      .then(() => router.replace("/(auth)/login"))
      .catch(() => {});
  }, [router, signOut, token, setIsPlaying, setCurrentSong]);

  const handleFilter = async (tag: TagOption) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      setError(null);
      setLoading(true);
      const data = await searchSongs(tag.query, 12);
      setRecent(Array.isArray(data) ? data : []);
      setQueueFromJamendo(Array.isArray(data) ? data : []);
    } catch {
      setError("No se pudieron cargar resultados para esta categoría.");
    } finally {
      setLoading(false);
    }
  };

  const handleSongOptions = (track: any) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedSong(track);
    setShowSongOptions(true);
  };

  const handleAddToPlaylist = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowAddToPlaylist(true);
  };

  const handleGoToArtist = () => {
    // TODO: Implementar navegación al artista
    alert(`Ir al artista: ${selectedSong?.artist_name}`);
  };

  const getSongForPlaylist = (): AddSongDto | null => {
    if (!selectedSong) return null;

    const jamendoId = extractJamendoId(selectedSong);
    return {
      jamendoId,
      name: selectedSong.name || "Sin título",
      artist_name: selectedSong.artist_name || "Artista desconocido",
      image: selectedSong.album_image || selectedSong.image,
      audio: selectedSong.audio,
    };
  };

  // Mostrar estado de carga
  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-black items-center justify-center">
        <ActivityIndicator size="large" color="#A855F7" />
        <Animated.Text
          style={{ opacity: pulse }}
          className="text-white mt-4 text-base"
        >
          Cargando contenido...
        </Animated.Text>
      </SafeAreaView>
    );
  }

  // Mostrar error si existe
  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-black items-center justify-center">
        <Text className="text-red-400 text-base mb-3 text-center">{error}</Text>
        <TouchableOpacity
          onPress={() => router.reload()}
          className="border border-purple-500 px-4 py-2 rounded-lg"
        >
          <Text className="text-purple-300 font-semibold">Reintentar</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // Si no hay canciones
  if (!recent.length) {
    return (
      <SafeAreaView className="flex-1 bg-black items-center justify-center">
        <Text className="text-gray-300 text-base">
          No hay canciones para mostrar.
        </Text>
      </SafeAreaView>
    );
  }

  // Render principal
  return (
    <SafeAreaView className="flex-1 bg-black">
      <ScrollView
        style={{ flex: 1, paddingHorizontal: 16 }}
        contentContainerStyle={{ paddingTop: 8, paddingBottom: 90 }}
      >
        {/* Header */}
        <View className="flex-row justify-between items-center mb-6">
          <View className="flex-row items-center">
            <Image
              source={require("../../assets/logo.png")}
              className="w-8 h-8 mr-2"
              resizeMode="contain"
            />
            <Text className="text-white text-xl font-bold">OpenSound</Text>
          </View>
          <View className="flex-row items-center space-x-4">
            <TouchableOpacity onPress={handleProfilePress}>
              <Image
                source={require("../../assets/usuario.png")}
                className="w-8 h-8"
                resizeMode="contain"
              />
            </TouchableOpacity>
            {token && (
              <TouchableOpacity
                onPress={handleLogout}
                className="border border-purple-500 px-3 py-1 rounded-full"
              >
                <Text className="text-purple-300 text-sm font-semibold">
                  Cerrar sesión
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Filtros */}
        <View className="flex-row justify-around mb-6">
          {TAGS.map((tag) => (
            <TouchableOpacity
              key={tag.query}
              className="bg-purple-700 px-4 py-2 rounded-full"
              onPress={() => handleFilter(tag)}
            >
              <Text className="text-white text-sm font-semibold">
                {tag.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Más recientes */}
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-white text-lg font-bold">Más recientes</Text>
          <Text className="text-purple-400">Más</Text>
        </View>

        {/* Carrusel */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mb-6"
        >
          {recent.slice(0, 12).map((track: any) => {
            const source = { uri: coverOf(track) };
            const title = track?.name ?? "Sin título";
            return (
              <View key={track.id} className="mr-4 w-32">
                <TouchableOpacity onPress={() => playTrack(track)}>
                  <Image source={source} className="w-32 h-32 rounded-xl" />
                  <Text
                    className="text-white text-sm mt-2"
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {title}
                  </Text>
                </TouchableOpacity>
              </View>
            );
          })}
        </ScrollView>

        {/* Lista */}
        <View className="space-y-4">
          {recent.slice(0, 8).map((track: any, idx: number) => {
            const title = track?.name ?? "Sin título";
            const artist = track?.artist_name ?? "Artista desconocido";
            const imageSrc = { uri: coverOf(track) };

            return (
              <View
                key={track?.id ?? `row-${idx}`}
                className="flex-row items-center justify-between"
              >
                <TouchableOpacity
                  className="flex-row items-center flex-1 pr-2"
                  onPress={() => playTrack(track)}
                >
                  <Image
                    source={imageSrc}
                    className="w-12 h-12 rounded-lg mr-3"
                  />
                  <View className="flex-1">
                    <Text
                      className="text-white"
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {title}
                    </Text>
                    <Text
                      className="text-gray-400 text-xs"
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {artist}
                    </Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => handleSongOptions(track)}>
                  <Image
                    source={require("../../assets/songoptions.png")}
                    className="w-6 h-6"
                    resizeMode="contain"
                  />
                </TouchableOpacity>
              </View>
            );
          })}
        </View>
      </ScrollView>

      <SongOptionsModal
        visible={showSongOptions}
        onClose={() => setShowSongOptions(false)}
        song={selectedSong}
        onAddToPlaylist={handleAddToPlaylist}
        onGoToArtist={handleGoToArtist}
      />

      <AddToPlaylistModal
        visible={showAddToPlaylist}
        onClose={() => setShowAddToPlaylist(false)}
        song={getSongForPlaylist()}
        onCreateNew={() => setShowCreatePlaylist(true)}
      />

      <CreatePlaylistModal
        visible={showCreatePlaylist}
        onClose={() => setShowCreatePlaylist(false)}
        onSuccess={() => setShowAddToPlaylist(true)}
      />
    </SafeAreaView>
  );
}
