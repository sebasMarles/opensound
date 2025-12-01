import { View, Text, ScrollView, TouchableOpacity, Modal, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useToast } from "../../context/ToastContext";
import { usePlaylists } from "../../hooks/usePlaylists";
import { useLikedSongs } from "../../hooks/useLikedSongs";
import { useState, useEffect } from "react";

type AddToPlaylistModalProps = {
  visible: boolean;
  onClose: () => void;
  song: any;
  onCreateNew: () => void;
};

export default function AddToPlaylistModal({
  visible,
  onClose,
  song,
  onCreateNew,
}: AddToPlaylistModalProps) {
  const { showToast } = useToast();
  const { playlists, addSongToPlaylist, refetch } = usePlaylists();
  const { refetch: refetchLikedSongs } = useLikedSongs();
  const [adding, setAdding] = useState<string | null>(null);

  // Refetch playlists when modal becomes visible
  useEffect(() => {
    if (visible) {
      refetch();
    }
  }, [visible, refetch]);

  const handleAddToPlaylist = async (playlistId: string) => {
    if (!song) return;

    const playlist = playlists.find((p) => p._id === playlistId);
    if (playlist) {
      const songExists = playlist.songs.some(
        (s) => s.jamendoId === (song.jamendoId || song.id)
      );
      if (songExists) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        showToast("Esta canción ya está en la playlist", "info");
        return;
      }
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setAdding(playlistId);
    try {
      await addSongToPlaylist(playlistId, song);
      await refetch();
      if (playlist?.isLiked) {
        await refetchLikedSongs();
      }
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      showToast(
        `Canción agregada a "${playlist?.name || "la playlist"}"`,
        "success"
      );
      onClose();
    } catch (error) {
      console.error("Error al agregar canción:", error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      showToast("No se pudo agregar la canción a la playlist", "error");
    } finally {
      setAdding(null);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        className="flex-1 bg-black/80 justify-end"
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity
          activeOpacity={1}
          className="bg-neutral-900 rounded-t-3xl p-6 max-h-[70%]"
          onPress={(e) => e.stopPropagation()}
        >
          <Text className="text-white text-xl font-bold mb-4">
            Agregar a playlist
          </Text>

          <ScrollView className="mb-4" showsVerticalScrollIndicator={false}>
            {/* Botón crear nueva */}
            <TouchableOpacity
              className="flex-row items-center py-4 border-b border-neutral-800"
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onCreateNew();
                onClose();
              }}
            >
              <View className="w-12 h-12 bg-purple-600 rounded-lg items-center justify-center mr-3">
                <Ionicons name="add" size={24} color="white" />
              </View>
              <Text className="text-white font-semibold">Nueva Playlist</Text>
            </TouchableOpacity>

            {/* Lista de playlists */}
            {playlists.map((playlist) => (
              <TouchableOpacity
                key={playlist._id}
                className="flex-row items-center py-4 border-b border-neutral-800"
                onPress={() => handleAddToPlaylist(playlist._id)}
                disabled={adding === playlist._id}
              >
                <View className="w-12 h-12 bg-neutral-800 rounded-lg items-center justify-center mr-3">
                  <Ionicons
                    name={playlist.isLiked ? "heart" : "musical-notes"}
                    size={20}
                    color={playlist.isLiked ? "#D400FF" : "white"}
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-white font-semibold" numberOfLines={1}>
                    {playlist.name}
                  </Text>
                  <Text className="text-gray-400 text-sm">
                    {playlist.songs.length} canciones
                  </Text>
                </View>
                {adding === playlist._id && (
                  <ActivityIndicator size="small" color="#A855F7" />
                )}
              </TouchableOpacity>
            ))}

            {playlists.length === 0 && (
              <Text className="text-gray-400 text-center py-8">
                No tienes playlists aún
              </Text>
            )}
          </ScrollView>

          <TouchableOpacity
            className="py-3 bg-neutral-800 rounded-full"
            onPress={onClose}
          >
            <Text className="text-white text-center font-semibold">
              Cancelar
            </Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}
