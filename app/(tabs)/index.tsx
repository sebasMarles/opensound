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
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
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
  { label: "Reggaetón", query: "reggaeton" },
  { label: "Trap", query: "trap" },
  { label: "Pop", query: "pop" },
  { label: "Electrónica", query: "electronic" },
  { label: "Hip Hop", query: "hiphop" },
  { label: "Indie", query: "indie" },
  { label: "Jazz", query: "jazz" },
  { label: "Chill", query: "chillout" },
  { label: "Metal", query: "metal" },
];

export default function HomeScreen() {
  const router = useRouter();
  const {
    setQueueFromJamendo,
    playFromJamendoTrack,
    currentSong,
  } = useMusicPlayer();
  const { token } = useAuth();

  const [recent, setRecent] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedSong, setSelectedSong] = useState<any | null>(null);
  const [showSongOptions, setShowSongOptions] = useState(false);
  const [showAddToPlaylist, setShowAddToPlaylist] = useState(false);
  const [showCreatePlaylist, setShowCreatePlaylist] = useState(false);

  // Pagination & Filters
  const [offset, setOffset] = useState(0);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const scrollRef = useRef<ScrollView>(null);
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

  // Cargar canciones iniciales
  useEffect(() => {
    loadSongs(true);
  }, [activeFilter]);

  const loadSongs = async (reset: boolean = false) => {
    if (loading) return;
    
    const currentOffset = reset ? 0 : offset;
    const limit = 20;

    try {
      setError(null);
      if (reset) {
        setLoading(true);
        setRecent([]); // Limpiar lista si es reset
      } else {
        setLoadingMore(true);
      }

      let data = [];
      if (activeFilter) {
        data = await searchSongs(activeFilter, limit, currentOffset);
      } else {
        data = await getRecentSongs(limit, currentOffset);
      }

      const newSongs = Array.isArray(data) ? data : [];

      if (reset) {
        setRecent(newSongs);
        setQueueFromJamendo(newSongs);
        setOffset(limit);
      } else {
        setRecent((prev) => [...prev, ...newSongs]);
        setQueueFromJamendo([...recent, ...newSongs]); // Actualizar cola con todo
        setOffset((prev) => prev + limit);
      }

    } catch (e) {
      if (reset) setError("No se pudieron cargar las canciones.");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    loadSongs(false);
  };

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

  const handleFilter = (tag: TagOption) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveFilter(tag.query);
  };

  const handleReset = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setActiveFilter(null);
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    setShowScrollTop(offsetY > 500);
  };

  const scrollToTop = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    scrollRef.current?.scrollTo({ y: 0, animated: true });
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

  // Mostrar estado de carga inicial
  if (loading && recent.length === 0) {
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

  // Mostrar error si existe y no hay data
  if (error && recent.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-black items-center justify-center">
        <Text className="text-red-400 text-base mb-3 text-center">{error}</Text>
        <TouchableOpacity
          onPress={() => loadSongs(true)}
          className="border border-purple-500 px-4 py-2 rounded-lg"
        >
          <Text className="text-purple-300 font-semibold">Reintentar</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-black">
      <ScrollView
        ref={scrollRef}
        style={{ flex: 1, paddingHorizontal: 16 }}
        contentContainerStyle={{ paddingTop: 8, paddingBottom: 120 }}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {/* Header */}
        <View className="flex-row justify-between items-center mb-6">
          <TouchableOpacity 
            className="flex-row items-center" 
            onPress={handleReset}
            activeOpacity={0.7}
          >
            <Image
              source={require("../../assets/logo.png")}
              className="w-8 h-8 mr-2"
              resizeMode="contain"
            />
            <Text className="text-white text-xl font-bold">OpenSound</Text>
          </TouchableOpacity>
          
          <TouchableOpacity onPress={handleProfilePress}>
            <Image
              source={require("../../assets/usuario.png")}
              className="w-8 h-8"
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>

        {/* Filtros Carrusel */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          className="mb-6"
        >
          {TAGS.map((tag) => (
            <TouchableOpacity
              key={tag.query}
              className={`px-4 py-2 rounded-full mr-2 ${
                activeFilter === tag.query ? "bg-purple-500" : "bg-purple-800"
              }`}
              onPress={() => handleFilter(tag)}
            >
              <Text className={`text-sm font-semibold ${
                activeFilter === tag.query ? "text-white" : "text-white"
              }`}>
                {tag.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Título Sección */}
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-white text-lg font-bold">
            {activeFilter ? `Resultados: ${TAGS.find(t => t.query === activeFilter)?.label}` : "Más recientes"}
          </Text>
        </View>

        {/* Lista de Canciones */}
        <View className="space-y-4">
          {recent.map((track: any, idx: number) => {
            const title = track?.name ?? "Sin título";
            const artist = track?.artist_name ?? "Artista desconocido";
            const imageSrc = { uri: coverOf(track) };

            return (
              <View
                key={`${track?.id}-${idx}`}
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

        {/* Botón Cargar Más */}
        {recent.length > 0 && (
          <TouchableOpacity
            onPress={handleLoadMore}
            className="mt-8 bg-neutral-800 py-3 rounded-xl items-center"
            disabled={loadingMore}
          >
            {loadingMore ? (
              <ActivityIndicator color="#A855F7" />
            ) : (
              <Text className="text-white font-semibold">Cargar más canciones</Text>
            )}
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Botón Scroll Top */}
      {showScrollTop && (
        <TouchableOpacity
          onPress={scrollToTop}
          className="absolute bottom-24 right-4 bg-purple-600 p-3 rounded-full shadow-lg z-20"
          style={{ elevation: 5 }}
        >
          <Ionicons name="arrow-up" size={24} color="white" />
        </TouchableOpacity>
      )}

      <SongOptionsModal
        visible={showSongOptions}
        onClose={() => setShowSongOptions(false)}
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
