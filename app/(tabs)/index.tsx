import { useEffect, useRef, useState } from "react";
import { View, Text, ScrollView, Image, TouchableOpacity, ActivityIndicator, Animated, } from "react-native";
import { useRouter } from "expo-router";
import { getRecentSongs, searchSongs } from "../../services/jamendo";
import { useMusicPlayer } from "../../context/MusicPlayerContext";
import { useAuthStore } from "../../stores/authStore";

type TagOption = { label: string; query: string };

const TAGS: TagOption[] = [
  { label: "Rock", query: "rock" },
  { label: "Reggaetón y vibras", query: "reggaeton" },
  { label: "Trap", query: "trap" },
];

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const {
    setQueueFromJamendo,
    playFromJamendoTrack,
  } = useMusicPlayer();

  const [recent, setRecent] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  //  Animación "Cargando contenido"
  const pulse = useRef(new Animated.Value(0.3)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.3, duration: 700, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  // Carga inicial 
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const data = await getRecentSongs(15);
        if (!mounted) return;
        setRecent(data || []);
        setQueueFromJamendo(data || []);
      } catch (e) {
        console.log("Error cargando recientes:", e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const coverOf = (t: any) =>
    t?.album_image || t?.image || "https://picsum.photos/200";

  const playTrack = async (t: any) => {
    try {
      await playFromJamendoTrack(t);
    } catch (e) {
      console.log("Error al reproducir:", e);
    }
  };

  const handleFilter = async (tag: TagOption) => {
    try {
      setSelectedTag(tag.query);
      setLoading(true);
      const data = await searchSongs(tag.query, 12);
      setRecent(data || []);
      setQueueFromJamendo(data || []); 
    } catch (e) {
      console.log(`Error buscando por tag ${tag.query}:`, e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-black items-center justify-center">
        <ActivityIndicator size="large" color="#D400FF" />
        <Animated.Text
          style={{ opacity: pulse }}
          className="text-white mt-4 text-base"
        >
          Cargando contenido...
        </Animated.Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-black">
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
            <View>
              <Text className="text-white text-xl font-bold">OpenSound</Text>
              {user && (
                <Text className="text-gray-400 text-sm">
                  Hola, {user.name.split(' ')[0]}
                </Text>
              )}
            </View>
          </View>
          <View className="flex-row space-x-4">
            <TouchableOpacity onPress={() => router.push("/(tabs)/profile")}>
              <View className="w-8 h-8 rounded-full bg-purple-600 justify-center items-center">
                <Text className="text-white text-xs font-bold">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </Text>
              </View>
            </TouchableOpacity>
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
              <Text className="text-white text-sm font-semibold">{tag.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Más recientes */}
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-white text-lg font-bold">Más recientes</Text>
          <Text className="text-purple-400">Más</Text>
        </View>

        {/* Carrusel */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6">
          {recent.slice(0, 15).map((track: any) => {
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
            const artist = track?.artist_name ?? undefined;
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
                  <Image source={imageSrc} className="w-12 h-12 rounded-lg mr-3" />
                  <View className="flex-1">
                    <Text className="text-white" numberOfLines={1} ellipsizeMode="tail">
                      {title}
                    </Text>
                    {!!artist && (
                      <Text
                        className="text-gray-400 text-xs"
                        numberOfLines={1}
                        ellipsizeMode="tail"
                      >
                        {artist}
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => console.log(`Opciones de ${track?.name}`)}>
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
    </View>
  );
}