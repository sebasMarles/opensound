import { View } from "react-native";
import Text from "@/ui/atoms/Text";
import type { Playlist } from "../types";
import { PlaylistCard } from "./PlaylistCard";

type Props = {
  playlists: Playlist[];
  selectedId?: string | null;
  onSelect?: (playlist: Playlist) => void;
  onEdit?: (playlist: Playlist) => void;
  onDelete?: (playlist: Playlist) => void;
};

// Lista de tarjetas que permite seleccionar, editar o eliminar playlists.
export function PlaylistList({
  playlists,
  selectedId,
  onSelect,
  onEdit,
  onDelete,
}: Props) {
  if (!playlists.length) {
    return (
      <View className="bg-neutral-900 rounded-2xl p-8 border border-neutral-800 items-center">
        <Text className="text-gray-400 text-center">
          Crea tu primera playlist para organizar tus canciones favoritas.
        </Text>
      </View>
    );
  }

  return (
    <View>
      {playlists.map((playlist) => (
        <PlaylistCard
          key={playlist.id}
          playlist={playlist}
          onPress={onSelect}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
      {selectedId && (
        <Text variant="caption" className="text-gray-400 text-right mt-2">
          Playlist seleccionada: {playlists.find((p) => p.id === selectedId)?.name ?? ""}
        </Text>
      )}
    </View>
  );
}
