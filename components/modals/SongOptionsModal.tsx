import { View, Text, Image, TouchableOpacity, Modal } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useToast } from "../../context/ToastContext";
import { useLikedSongs } from "../../hooks/useLikedSongs";
import { useState, useEffect } from "react";

type SongOptionsModalProps = {
  visible: boolean;
  onClose: () => void;
  song: any;
  onAddToPlaylist: () => void;
  onGoToArtist: () => void;
};

export default function SongOptionsModal({
  visible,
  onClose,
  song,
  onAddToPlaylist,
  onGoToArtist,
}: SongOptionsModalProps) {
  const { showToast } = useToast();
  const { toggleLike, isLiked } = useLikedSongs();
  const [currentLikedState, setCurrentLikedState] = useState(false);
  const [isTogglingLike, setIsTogglingLike] = useState(false);

  useEffect(() => {
    if (song) {
      setCurrentLikedState(isLiked(song.jamendoId || song.id));
    }
  }, [song, isLiked]);

  const handleToggleLike = async () => {
    if (!song) return;
    setIsTogglingLike(true);

    const songDto = {
      jamendoId: song.jamendoId || song.id,
      name: song.name,
      artist_name: song.artist_name,
      image: song.image || song.album_image,
      audio: song.audio,
    };

    try {
      const newLikedState = await toggleLike(songDto);
      setCurrentLikedState(newLikedState);

      showToast(
        newLikedState
          ? "Canción agregada a Me Gusta"
          : "Canción eliminada de Me Gusta",
        "success"
      );
    } catch (error) {
      console.error("Error al cambiar estado de Me Gusta:", error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      showToast("No se pudo actualizar Me Gusta", "error");
    } finally {
      setIsTogglingLike(false);
    }
  };

  if (!song) return null;

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
          className="bg-neutral-900 rounded-t-3xl p-6"
          onPress={(e) => e.stopPropagation()}
        >
          <View className="flex-row items-center mb-6 pb-4 border-b border-neutral-800">
            <Image
              source={{
                uri:
                  song.album_image || song.image || "https://picsum.photos/200",
              }}
              className="w-14 h-14 rounded-lg mr-3"
            />
            <View className="flex-1">
              <Text className="text-white font-semibold" numberOfLines={1}>
                {song.name || "Sin título"}
              </Text>
              <Text className="text-gray-400 text-sm" numberOfLines={1}>
                {song.artist_name || "Artista desconocido"}
              </Text>
            </View>
          </View>

          <View className="space-y-2">
            <TouchableOpacity
              className="flex-row items-center py-4"
              onPress={handleToggleLike}
              disabled={isTogglingLike}
            >
              <Ionicons
                name={currentLikedState ? "heart" : "heart-outline"}
                size={24}
                color={currentLikedState ? "#D400FF" : "white"}
              />
              <Text className="text-white text-base ml-4">
                {currentLikedState ? "Quitar de Me Gusta" : "Me Gusta"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-row items-center py-4"
              onPress={() => {
                onAddToPlaylist();
                onClose();
              }}
            >
              <Ionicons name="add-circle-outline" size={24} color="white" />
              <Text className="text-white text-base ml-4">
                Agregar a playlist
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-row items-center py-4"
              onPress={() => {
                onClose();
                // Pequeño delay para que cierre el modal antes de navegar
                setTimeout(() => {
                  onGoToArtist();
                }, 300);
              }}
            >
              <Ionicons name="person-outline" size={24} color="white" />
              <Text className="text-white text-base ml-4">Ir al artista</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            className="mt-4 py-3 bg-neutral-800 rounded-full"
            onPress={onClose}
          >
            <Text className="text-white text-center font-semibold">Cerrar</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}
