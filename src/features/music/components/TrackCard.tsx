import { memo } from "react";
import { Image, TouchableOpacity, View } from "react-native";
import Text from "@/ui/atoms/Text";
import type { Track } from "../api/jamendoService";

type Props = {
  track: Track;
  onPress?: (track: Track) => void;
};

const PLACEHOLDER = "https://picsum.photos/seed/opensound-track/400";

// Carta visual utilizada en el carrusel principal de la pantalla de inicio.

function TrackCardComponent({ track, onPress }: Props) {
  const coverSource = { uri: track.album_image || track.image || PLACEHOLDER };

  return (
    <TouchableOpacity
      className="w-36 mr-4"
      activeOpacity={0.85}
      onPress={() => onPress?.(track)}
      accessibilityRole="button"
      accessibilityLabel={`Reproducir ${track.name}`}
    >
      <Image source={coverSource} className="w-36 h-36 rounded-xl" />
      <View className="mt-2">
        <Text numberOfLines={1} className="text-white font-semibold">
          {track.name}
        </Text>
        <Text numberOfLines={1} variant="caption">
          {track.artist_name}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

export const TrackCard = memo(TrackCardComponent);
