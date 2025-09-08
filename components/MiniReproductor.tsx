import { View, Text, Image, TouchableOpacity } from "react-native";
import { useMusicPlayer } from "../context/MusicPlayerContext";

export default function MiniReproductor() {
  const { isPlaying, setIsPlaying, currentSong } = useMusicPlayer();

  if (!currentSong) return null;

  return (
    <View className="absolute bottom-[70px] left-0 right-0 bg-neutral-900 border-t border-purple-600 px-4 py-3 flex-row items-center">
      <Image
        source={{ uri: currentSong.image }}
        className="w-12 h-12 rounded-lg mr-3"
      />

      <View className="flex-1">
        <Text className="text-white font-bold" numberOfLines={1}>
          {currentSong.name}
        </Text>
        <Text className="text-gray-400 text-sm" numberOfLines={1}>
          {currentSong.artist}
        </Text>
      </View>

      <View className="flex-row items-center">
        <TouchableOpacity onPress={() => setIsPlaying(!isPlaying)}>
          <Image
            source={
              isPlaying
                ? require("../assets/reproduciendo.png")
                : require("../assets/pausado2.png")
            }
            className="w-6 h-6 ml-4"
            resizeMode="contain"
          />
        </TouchableOpacity>

        <TouchableOpacity>
          <Image
            source={require("../assets/siguiente.png")}
            className="w-6 h-6 ml-4"
            resizeMode="contain"
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}
