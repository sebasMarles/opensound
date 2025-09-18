// components/molecules/SongListItem.tsx
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { useMusicPlayer } from "../../context/MusicPlayerContext"; // <- corregido

export default function SongListItem({ song }: { song: any }) {
  const { setCurrentSong, setIsPlaying } = useMusicPlayer();

  const handlePress = () => {
    setCurrentSong({
      title: song?.name ?? "Sin título",
      artist: song?.artist_name ?? "Artista desconocido",
      image: song?.image || "https://via.placeholder.com/100",
    });
    setIsPlaying(true);
  };

  return (
    <TouchableOpacity style={styles.container} onPress={handlePress}>
      <View style={styles.info}>
        <Image
          source={{ uri: song?.image || "https://via.placeholder.com/100" }}
          style={styles.image}
        />
        <View style={{ maxWidth: 220 }}>
          <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
            {song?.name ?? "Sin título"}
          </Text>
          <Text style={styles.artist} numberOfLines={1} ellipsizeMode="tail">
            {song?.artist_name ?? "Artista desconocido"}
          </Text>
        </View>
      </View>
      <Text style={styles.menu}>⋮</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  info: {
    flexDirection: "row",
    alignItems: "center",
  },
  image: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 10,
  },
  title: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  artist: {
    color: "gray",
    fontSize: 12,
  },
  menu: {
    color: "white",
    fontSize: 18,
  },
});