import { memo } from "react";
import { Image, TouchableOpacity, View } from "react-native";
import Text from "@/ui/atoms/Text";
import Button from "@/ui/atoms/Button";
import Badge from "@/ui/atoms/Badge";
import type { Playlist } from "../types";

type Props = {
  playlist: Playlist;
  onPress?: (playlist: Playlist) => void;
  onEdit?: (playlist: Playlist) => void;
  onDelete?: (playlist: Playlist) => void;
};

const PLACEHOLDER = "https://picsum.photos/seed/opensound-playlist/300";

// Tarjeta compacta que muestra la información básica de una playlist.

function PlaylistCardComponent({ playlist, onPress, onEdit, onDelete }: Props) {
  const coverSource = { uri: playlist.coverImage || PLACEHOLDER };

  return (
    <TouchableOpacity
      className="bg-neutral-900 rounded-2xl p-4 mb-4 border border-neutral-800"
      activeOpacity={0.9}
      onPress={() => onPress?.(playlist)}
      accessibilityRole="button"
      accessibilityLabel={`Abrir playlist ${playlist.name}`}
    >
      <View className="flex-row">
        <Image
          source={coverSource}
          className="w-20 h-20 rounded-xl mr-4"
          resizeMode="cover"
        />

        <View className="flex-1">
          <Text variant="subtitle" className="text-white">
            {playlist.name}
          </Text>
          <Text variant="caption" className="text-gray-400 mt-1">
            {playlist.description || "Sin descripción"}
          </Text>

          <View className="flex-row items-center mt-3 space-x-2">
            <Badge variant={playlist.isPublic ? "primary" : "neutral"}>
              {playlist.isPublic ? "Pública" : "Privada"}
            </Badge>
            <Text variant="caption" className="text-gray-400">
              {playlist.trackCount} canciones
            </Text>
          </View>

          <View className="flex-row mt-4 space-x-3">
            <Button
              size="sm"
              variant="outline"
              onPress={() => onEdit?.(playlist)}
              accessibilityLabel={`Editar playlist ${playlist.name}`}
            >
              Editar
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="border border-red-500"
              onPress={() => onDelete?.(playlist)}
              accessibilityLabel={`Eliminar playlist ${playlist.name}`}
            >
              <Text className="text-red-400 font-semibold">Eliminar</Text>
            </Button>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export const PlaylistCard = memo(PlaylistCardComponent);
