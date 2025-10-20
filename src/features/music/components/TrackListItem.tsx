import { memo } from "react";
import { Image, TouchableOpacity, View } from "react-native";
import Text from "@/ui/atoms/Text";
import type { Track } from "../api/jamendoService";

type Props = {
  track: Track;
  onPress?: (track: Track) => void;
  trailing?: React.ReactNode;
};

const PLACEHOLDER = "https://picsum.photos/seed/opensound-track-row/200";

// Fila con portada e información del track, pensada para listas largas.

function TrackListItemComponent({ track, onPress, trailing }: Props) {
  const coverSource = { uri: track.album_image || track.image || PLACEHOLDER };

  return (
    <TouchableOpacity
      className="flex-row items-center justify-between mb-4"
      onPress={() => onPress?.(track)}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel={`Reproducir ${track.name}`}
    >
      <View className="flex-row items-center flex-1 pr-3">
        <Image source={coverSource} className="w-12 h-12 rounded-lg mr-3" />
        <View className="flex-1">
          <Text numberOfLines={1} className="text-white font-medium">
            {track.name}
          </Text>
          <Text numberOfLines={1} variant="caption">
            {track.artist_name}
          </Text>
        </View>
      </View>
      {trailing}
    </TouchableOpacity>
  );
}

export const TrackListItem = memo(TrackListItemComponent);
