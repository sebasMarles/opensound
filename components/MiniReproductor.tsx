import { View, Text, Image, TouchableOpacity } from "react-native";
import { useMusicPlayer } from "../context/MusicPlayerContext"; 

export default function MiniReproductor() {
  const { isPlaying, setIsPlaying, currentSong } = useMusicPlayer();

  return (
    <View className="bg-neutral-900 border-t border-purple-600 px-4 py-3 flex-row items-center">
      <Image
        source={{ uri: currentSong.image }}
        className="w-12 h-12 rounded-lg mr-3"
      />
      <View className="flex-1">
        <Text className="text-white font-bold">{currentSong.title}</Text>
        <Text className="text-gray-400 text-sm">{currentSong.artist}</Text>
      </View>

      <View className="flex-row items-center space-x-5">
        <TouchableOpacity onPress={() => setIsPlaying(!isPlaying)}>
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

        <TouchableOpacity>
          <Image
            source={require("../assets/siguiente.png")}
            className="w-6 h-6"
            resizeMode="contain"
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}
