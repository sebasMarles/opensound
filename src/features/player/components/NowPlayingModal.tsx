import { useMemo, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Image,
  LayoutChangeEvent,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import Text from "@/ui/atoms/Text";
import { useMusicPlayer } from "@/core/player/MusicPlayerProvider";

function formatTime(ms: number) {
  if (!ms || ms <= 0) return "0:00";
  const totalSec = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSec / 60);
  const seconds = totalSec % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

// Modal a pantalla completa con controles avanzados del reproductor.
export default function NowPlayingModal() {
  const {
    isPlayerVisible,
    setPlayerVisible,
    currentSong,
    isPlaying,
    togglePlayPause,
    next,
    previous,
    progress,
    positionMillis,
    durationMillis,
    seekTo,
  } = useMusicPlayer();

  const [liked, setLiked] = useState(false);
  const scale = useRef(new Animated.Value(1)).current;

  const { width: screenWidth } = Dimensions.get("window");
  const coverSize = Math.min(screenWidth - 48, 360);

  const [barWidth, setBarWidth] = useState(0);
  const [scrubbing, setScrubbing] = useState(false);
  const [preview, setPreview] = useState<number | null>(null);

  const effectiveProgress = useMemo(() => {
    const value = preview ?? progress ?? 0;
    return Math.max(0, Math.min(1, value));
  }, [preview, progress]);

  const animateLike = () => {
    Animated.sequence([
      Animated.spring(scale, { toValue: 1.25, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, useNativeDriver: true }),
    ]).start();
  };

  const onToggleLike = () => {
    setLiked((prev) => !prev);
    animateLike();
  };

  const onBarLayout = (event: LayoutChangeEvent) => {
    setBarWidth(event.nativeEvent.layout.width);
  };

  const seekAt = (x: number) => {
    if (!durationMillis || barWidth <= 0) return;
    const ratio = Math.max(0, Math.min(1, x / barWidth));
    setPreview(ratio);
  };

  const commitSeek = async () => {
    if (preview == null || !durationMillis) {
      setScrubbing(false);
      setPreview(null);
      return;
    }
    const target = Math.floor(preview * durationMillis);
    await seekTo(target);
    setScrubbing(false);
    setPreview(null);
  };

  if (!isPlayerVisible || !currentSong) return null;

  const imageUri =
    typeof currentSong.image === "string" && currentSong.image.length > 0
      ? currentSong.image
      : "https://picsum.photos/300";

  return (
    <View
      style={[StyleSheet.absoluteFill, { backgroundColor: "rgba(0,0,0,0.95)", zIndex: 50, elevation: 100 }]}
      pointerEvents="auto"
    >
      <View className="w-full px-4 pt-12 pb-4 flex-row items-center justify-between">
        <TouchableOpacity
          onPress={() => setPlayerVisible(false)}
          className="p-2"
          accessibilityLabel="Cerrar reproductor"
        >
          <Ionicons name="chevron-down" size={28} color="white" />
        </TouchableOpacity>

        <Text className="text-white text-base font-semibold">Reproduciendo</Text>

        <TouchableOpacity onPress={onToggleLike} className="p-2" accessibilityLabel="Me gusta">
          <Animated.View style={{ transform: [{ scale }] }}>
            <Ionicons name={liked ? "heart" : "heart-outline"} size={24} color={liked ? "#D400FF" : "white"} />
          </Animated.View>
        </TouchableOpacity>
      </View>

      <View className="w-full items-center mt-4">
        <Image
          source={{ uri: imageUri }}
          style={{ width: coverSize, height: coverSize, borderRadius: 16 }}
          resizeMode="cover"
        />
        <Text className="text-white text-2xl font-bold mt-6" numberOfLines={1}>
          {currentSong.title || "Sin título"}
        </Text>
        <Text className="text-gray-400 text-base mt-1" numberOfLines={1}>
          {currentSong.artist || "Artista desconocido"}
        </Text>
      </View>

      <View className="w-full px-6 mt-8">
        <View
          onLayout={onBarLayout}
          className="w-full h-8 justify-center"
          onStartShouldSetResponder={() => true}
          onMoveShouldSetResponder={() => true}
          onResponderGrant={(event) => {
            setScrubbing(true);
            seekAt(event.nativeEvent.locationX);
          }}
          onResponderMove={(event) => {
            seekAt(event.nativeEvent.locationX);
          }}
          onResponderRelease={commitSeek}
          onResponderTerminate={commitSeek}
        >
          <View className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden">
            <View style={{ width: `${effectiveProgress * 100}%` }} className="h-2 bg-purple-600" />
          </View>
        </View>

        <View className="w-full flex-row justify-between mt-2">
          <Text className="text-gray-400 text-xs">
            {formatTime(scrubbing && preview != null ? Math.floor(preview * durationMillis) : positionMillis)}
          </Text>
          <Text className="text-gray-400 text-xs">{formatTime(durationMillis)}</Text>
        </View>
      </View>

      <View className="w-full px-10 mt-8 flex-row items-center justify-between">
        <TouchableOpacity onPress={previous} accessibilityLabel="Anterior" className="p-3">
          <Ionicons name="play-skip-back" size={32} color="white" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={togglePlayPause}
          accessibilityLabel={isPlaying ? "Pausar" : "Reproducir"}
          className="p-4 rounded-full bg-purple-600"
        >
          <Ionicons name={isPlaying ? "pause" : "play"} size={32} color="white" />
        </TouchableOpacity>

        <TouchableOpacity onPress={next} accessibilityLabel="Siguiente" className="p-3">
          <Ionicons name="play-skip-forward" size={32} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
