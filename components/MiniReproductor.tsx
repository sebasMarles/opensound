// components/MiniReproductor.tsx
import { View, Text, Image, TouchableOpacity } from "react-native";
import { useMusicPlayer } from "../context/MusicPlayerContext";

export default function MiniReproductor() {
  const {
    isPlaying,
    currentSong,
    togglePlayPause,
    next,
    progress,
  } = useMusicPlayer();

  if (!currentSong) return null;

  const clampedProgress = Math.max(0, Math.min(1, progress));

  return (
    <View className="bg-neutral-900 border-t px-4 py-3">
      <View className="absolute left-0 right-0 top-0 h-[2px] bg-neutral-800" />
      <View
        style={{ width: `${clampedProgress * 100}%` }}
        className="absolute left-0 top-0 h-[2px] bg-purple-600"
      />

      <View className="flex-row items-center">
        <Image source={{ uri: currentSong.image }} className="w-12 h-12 rounded-lg mr-3" />
        <View className="flex-1">
          <Text className="text-white font-bold" numberOfLines={1} ellipsizeMode="tail">
            {currentSong.title}
          </Text>
          <Text className="text-gray-400 text-sm" numberOfLines={1} ellipsizeMode="tail">
            {currentSong.artist}
          </Text>
        </View>

        <View className="flex-row items-center">
          <TouchableOpacity onPress={togglePlayPause} className="mr-5">
            <Image
              source={
                isPlaying
                  ? require("../assets/reproduciendo.png")
                  : require("../assets/pausado2.png")
              }
              className="w-6 h-6"
              resizeMode="contain"
            />
          </TouchableOpacity>

          <TouchableOpacity onPress={next}>
            <Image
              source={require("../assets/siguiente.png")}
              className="w-6 h-6"
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}