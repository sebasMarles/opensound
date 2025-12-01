import { View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useToast } from "../../context/ToastContext";
import { usePlaylists } from "../../hooks/usePlaylists";
import { useLikedSongs } from "../../hooks/useLikedSongs";
import { useMusicPlayer } from "../../context/MusicPlayerContext";
import MiniReproductor from "../../components/MiniReproductor";
import { useState, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";

export default function PlaylistDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { showToast } = useToast();
  const { playlists, removeSongFromPlaylist, deletePlaylist, refetch } = usePlaylists();
  const { refetch: refetchLikedSongs } = useLikedSongs();
  const { playFromJamendoTrack, currentSong } = useMusicPlayer();
  
  const [removing, setRemoving] = useState<string | null>(null);

  const playlist = playlists.find((p) => p._id === id);

  // Refetch playlist data when screen gains focus
  useFocusEffect(
    useCallback(() => {
      refetch();
      refetchLikedSongs();
    }, [refetch, refetchLikedSongs])
  );

  const handlePlaySong = async (song: any, index: number) => {
    try {
      await playFromJamendoTrack(song);
    } catch (error) {
      console.error("Error al reproducir:", error);
      showToast("No se pudo reproducir la canción", "error");
    }
  };

  const handleDeletePlaylist = async () => {
    if (!playlist) return;
    try {
      await deletePlaylist(playlist._id);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      showToast("Playlist eliminada correctamente", "success");
      router.back();
    } catch (error) {
      console.error("Error al eliminar playlist:", error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      showToast("No se pudo eliminar la playlist", "error");
    }
  };

  const handleRemoveSong = async (song: any) => {
    if (!playlist) return;
    const jamendoId = song.jamendoId;
    setRemoving(jamendoId);
            try {
              await removeSongFromPlaylist(playlist._id, jamendoId);
              await refetch();
              await refetchLikedSongs();
              Haptics.notificationAsync(
                Haptics.NotificationFeedbackType.Success
              );
              showToast("Canción eliminada de la playlist", "success");
            } catch (error) {
              console.error("Error al eliminar canción:", error);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
              showToast("No se pudo eliminar la canción", "error");
            } finally {
              setRemoving(null);
            }
  };



  if (!playlist) {
    return (
      <SafeAreaView className="flex-1 bg-black items-center justify-center">
        <ActivityIndicator size="large" color="#A855F7" />
        <Text className="text-white mt-4">Cargando playlist...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-black">
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 160 }}
      >
        <View className="flex-row items-center justify-between px-4 py-4">
          <TouchableOpacity
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.back();
            }}
            className="p-2"
          >
            <Ionicons name="chevron-back" size={28} color="white" />
          </TouchableOpacity>

          {!playlist.isLiked && (
            <TouchableOpacity
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                handleDeletePlaylist();
              }}
              className="p-2"
            >
              <Ionicons name="trash-outline" size={24} color="#EF4444" />
            </TouchableOpacity>
          )}
        </View>

        <View className="items-center px-6 mb-6">
          <View className="w-48 h-48 bg-neutral-800 rounded-2xl items-center justify-center mb-4">
            <Ionicons
              name={playlist.isLiked ? "heart" : "musical-notes"}
              size={80}
              color={playlist.isLiked ? "#D400FF" : "#A855F7"}
            />
          </View>
          <Text className="text-white text-2xl font-bold text-center">
            {playlist.name}
          </Text>
          {playlist.description && (
            <Text className="text-gray-400 text-center mt-2">
              {playlist.description}
            </Text>
          )}
          <Text className="text-gray-400 text-sm mt-2">
            {playlist.songs.length}{" "}
            {playlist.songs.length === 1 ? "canción" : "canciones"}
          </Text>
        </View>

        <View className="px-4">
          {playlist.songs.length > 0 ? (
            playlist.songs.map((song, index) => (
              <View
                key={`${song.jamendoId}-${index}`}
                className="flex-row items-center justify-between py-3 border-b border-neutral-800"
              >
                <TouchableOpacity
                  className="flex-row items-center flex-1"
                  onPress={() => handlePlaySong(song, index)}
                >
                  <Image
                    source={{
                      uri:
                        song.image ||
                        song.album_image ||
                        "https://picsum.photos/200",
                    }}
                    className="w-12 h-12 rounded-lg mr-3"
                  />
                  <View className="flex-1">
                    <Text
                      className="text-white font-semibold"
                      numberOfLines={1}
                    >
                      {song.name}
                    </Text>
                    <Text className="text-gray-400 text-sm" numberOfLines={1}>
                      {song.artist_name}
                    </Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => handleRemoveSong(song)}
                  disabled={removing === song.jamendoId}
                  className="p-2"
                >
                  {removing === song.jamendoId ? (
                    <ActivityIndicator size="small" color="#EF4444" />
                  ) : (
                    <Ionicons
                      name={playlist.isLiked ? "heart" : "close-circle-outline"}
                      size={24}
                      color={playlist.isLiked ? "#D400FF" : "#EF4444"}
                    />
                  )}
                </TouchableOpacity>
              </View>
            ))
          ) : (
            <View className="items-center py-12">
              <Ionicons
                name="musical-notes-outline"
                size={64}
                color="#4B5563"
              />
              <Text className="text-gray-400 text-center mt-4">
                No hay canciones en esta playlist
              </Text>
              <Text className="text-gray-500 text-center mt-2 px-8">
                Agrega canciones usando el menú de opciones (tres puntos) en
                cualquier canción
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {currentSong && (
        <View
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 10,
          }}
        >
          <MiniReproductor />
        </View>
      )}
    </SafeAreaView>
  );
}
