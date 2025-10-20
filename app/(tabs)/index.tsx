import { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Image, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import Text from "@/ui/atoms/Text";
import Button from "@/ui/atoms/Button";
import { TagFilter, TrackCard, TrackListItem } from "@/features/music/components";
import {
  getRecentSongs,
  searchSongs,
  type Track,
} from "@/features/music/api/jamendoService";
import { useMusicPlayer } from "@/core/player/MusicPlayerProvider";
import { useAuth } from "@/core/auth/AuthProvider";

const TAGS = [
  { label: "Rock", query: "rock" },
  { label: "Reggaetón y vibras", query: "reggaeton" },
  { label: "Trap", query: "trap" },
  { label: "Indie", query: "indie" },
  { label: "Chill", query: "chill" },
];

export default function HomeScreen() {
  const router = useRouter();
  const { token, signOut } = useAuth();
  const { setQueueFromJamendo, playFromJamendoTrack } = useMusicPlayer();

  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTag, setCurrentTag] = useState<string | null>(null);

  // Carga inicial y cuando cambia el filtro seleccionado.
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      try {
        const data = currentTag
          ? await searchSongs(currentTag, 20)
          : await getRecentSongs(20);
        if (!cancelled) {
          setTracks(data);
          setQueueFromJamendo(data);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          const message =
            err instanceof Error ? err.message : "No se pudo cargar el contenido";
          setError(message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [currentTag, setQueueFromJamendo]);

  const handlePlay = useCallback(
    async (track: Track) => {
      try {
        await playFromJamendoTrack(track);
      } catch (err) {
        console.warn("No se pudo reproducir la canción", err);
      }
    },
    [playFromJamendoTrack],
  );

  const handleSelectTag = useCallback((tag: { label: string; query: string }) => {
    setCurrentTag(tag.query);
  }, []);

  const heroTrack = useMemo(() => tracks[0], [tracks]);

  const handleProfilePress = useCallback(() => {
    if (token) {
      router.push("/profile");
    } else {
      router.push("/(auth)/login");
    }
  }, [router, token]);

  const handleLogout = useCallback(async () => {
    if (!token) return;
    try {
      await signOut();
      router.replace("/(auth)/login");
    } catch (err) {
      console.warn("No se pudo cerrar la sesión", err);
    }
  }, [router, signOut, token]);

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-black items-center justify-center">
        <ActivityIndicator color="#A855F7" size="large" />
        <Text variant="caption" className="mt-3 text-gray-300">
          Preparando tus recomendaciones...
        </Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-black items-center justify-center px-6">
        <Text className="text-red-400 text-center mb-4">{error}</Text>
        <Button onPress={() => setCurrentTag(null)}>Intentar de nuevo</Button>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-black">
      <ScrollView
        className="flex-1 px-5"
        contentContainerStyle={{ paddingBottom: 120, paddingTop: 12 }}
      >
        <View className="flex-row justify-between items-center mb-8">
          <View className="flex-row items-center">
            <Image
              source={require("../../assets/logo.png")}
              className="w-8 h-8 mr-3"
              resizeMode="contain"
            />
            <Text variant="title">OpenSound</Text>
          </View>

          <View className="flex-row space-x-3 items-center">
            {token && (
              <Button
                size="sm"
                variant="outline"
                onPress={handleLogout}
                accessibilityLabel="Cerrar sesión"
              >
                Salir
              </Button>
            )}
            <Button
              size="sm"
              variant="ghost"
              onPress={handleProfilePress}
              accessibilityLabel="Ir al perfil"
            >
              Perfil
            </Button>
          </View>
        </View>

        {heroTrack && (
          <View
            className="rounded-3xl p-6 border border-purple-900/40 mb-8"
            style={{ backgroundColor: "rgba(38,38,38,0.85)" }}
          >
            <Text variant="subtitle" className="mb-2">
              Sigue escuchando
            </Text>
            <Text className="text-white text-2xl font-bold" numberOfLines={1}>
              {heroTrack.name}
            </Text>
            <Text variant="caption" className="mt-1">
              {heroTrack.artist_name}
            </Text>
            <Button className="mt-5" onPress={() => handlePlay(heroTrack)}>
              Reproducir
            </Button>
          </View>
        )}

        <TagFilter tags={TAGS} onSelect={handleSelectTag} />

        <View className="mb-6">
          <Text variant="subtitle" className="mb-4">
            Descubre algo nuevo
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {tracks.slice(0, 10).map((track) => (
              <TrackCard key={track.id} track={track} onPress={handlePlay} />
            ))}
          </ScrollView>
        </View>

        <View>
          <Text variant="subtitle" className="mb-4">
            Últimas canciones
          </Text>
          {tracks.slice(0, 12).map((track) => (
            <TrackListItem key={track.id} track={track} onPress={handlePlay} />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
