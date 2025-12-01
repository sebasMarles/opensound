"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Animated,
  type LayoutChangeEvent,
  Dimensions,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as Haptics from "expo-haptics";
import { useMusicPlayer } from "../../context/MusicPlayerContext";
import { useLikedSongs } from "../../hooks/useLikedSongs";
import { useAuth } from "../../context/AuthContext";
import { extractJamendoId } from "../../utils/jamendo";

function formatTime(ms: number) {
  if (!ms || ms <= 0) return "0:00";
  const totalSec = Math.floor(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function PlayerModal() {
  const router = useRouter();
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

  const { token } = useAuth();
  const { isLiked, toggleLike, refetch } = useLikedSongs();
  const [isTogglingLike, setIsTogglingLike] = useState(false);

  const scale = useRef(new Animated.Value(1)).current;

  // Ancho de pantalla y tamaño del cover calculado
  const { width: screenWidth } = Dimensions.get("window");
  const horizontalPadding = 24; // px-6
  const coverMax = 360; // máximo para no exagerar en tablets
  const coverSize = Math.min(screenWidth - horizontalPadding * 2, coverMax);

  // Animación del botón "me gusta"
  const animateLike = () => {
    Animated.sequence([
      Animated.spring(scale, { toValue: 1.25, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, useNativeDriver: true }),
    ]).start();
  };

  useEffect(() => {
    if (isPlayerVisible && token) {
      refetch();
    }
  }, [isPlayerVisible, token, refetch]);

  const onToggleLike = async () => {
    if (!token || !currentSong) return;

    const jamendoId = extractJamendoId({
      id: currentSong.id,
      audio: currentSong.audio,
      name: currentSong.title,
    });

    const songData = {
      jamendoId,
      name: currentSong.title,
      artist_name: currentSong.artist,
      image: currentSong.image,
      audio: currentSong.audio,
    };

    setIsTogglingLike(true);
    animateLike();
    Haptics.notificationAsync(
      isLiked(jamendoId)
        ? Haptics.NotificationFeedbackType.Success
        : Haptics.NotificationFeedbackType.Success
    );

    try {
      await toggleLike(songData);
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsTogglingLike(false);
    }
  };

  // Barra de progreso (seek)
  const [barWidth, setBarWidth] = useState(0);
  const [scrubbing, setScrubbing] = useState(false);
  const [preview, setPreview] = useState<number | null>(null); // 0..1

  const effectiveProgress = useMemo(() => {
    const p = preview ?? progress ?? 0;
    return Math.max(0, Math.min(1, p));
  }, [preview, progress]);

  const onBarLayout = (e: LayoutChangeEvent) => {
    setBarWidth(e.nativeEvent.layout.width);
  };

  const seekAtX = (x: number) => {
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
    const ms = Math.floor(preview * durationMillis);
    await seekTo(ms);
    setScrubbing(false);
    setPreview(null);
  };

  const currentJamendoId = currentSong
    ? extractJamendoId({
        id: currentSong.id,
        audio: currentSong.audio,
        name: currentSong.title,
      })
    : "";
  const liked = isLiked(currentJamendoId);

  if (!isPlayerVisible || !currentSong) return null;

  return (
    <View
      style={[
        StyleSheet.absoluteFill,
        { backgroundColor: "rgba(0,0,0,0.95)", zIndex: 50, elevation: 100 },
      ]}
      pointerEvents="auto"
    >
      {/* Header - ancho completo */}
      <View className="w-full px-4 pt-12 pb-4 flex-row items-center justify-between">
        <TouchableOpacity
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setPlayerVisible(false);
          }}
          className="p-2"
          accessibilityLabel="Cerrar"
        >
          <Ionicons name="chevron-down" size={28} color="white" />
        </TouchableOpacity>

        <Text className="text-white text-base font-semibold">
          Reproduciendo
        </Text>

        <TouchableOpacity
          onPress={onToggleLike}
          className="p-2"
          accessibilityLabel="Me gusta"
          disabled={isTogglingLike || !token}
        >
          <Animated.View style={{ transform: [{ scale }] }}>
            <Ionicons
              name={liked ? "heart" : "heart-outline"}
              size={24}
              color={liked ? "#D400FF" : "white"}
            />
          </Animated.View>
        </TouchableOpacity>
      </View>

      {/* Cover centrado, ancho consistente */}
      <View className="w-full items-center mt-4">
        <Image
          source={{
            uri:
              typeof currentSong.image === "string" &&
              currentSong.image.length > 0
                ? currentSong.image
                : "https://picsum.photos/300",
          }}
          style={{ width: coverSize, height: coverSize, borderRadius: 16 }}
          resizeMode="cover"
        />
      </View>

      {/* Título y artista */}
      <View className="w-full px-6 mt-6 items-center">
        <Text
          className="text-white text-2xl font-bold"
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {currentSong.title}
        </Text>
        <TouchableOpacity
          onPress={() => {
            setPlayerVisible(false);
            setTimeout(() => {
              router.push({
                pathname: "/(tabs)/artist-detail",
                params: {
                  id: "search",
                  name: currentSong.artist || "Artista desconocido",
                },
              });
            }, 300);
          }}
        >
          <Text
            className="text-gray-400 text-base mt-1"
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {currentSong.artist}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Barra de progreso + tiempos (ancho completo con padding lateral) */}
      <View className="w-full px-6 mt-8">
        <View
          onLayout={onBarLayout}
          className="w-full h-8 justify-center"
          onStartShouldSetResponder={() => true}
          onMoveShouldSetResponder={() => true}
          onResponderGrant={(e) => {
            setScrubbing(true);
            seekAtX(e.nativeEvent.locationX);
          }}
          onResponderMove={(e) => {
            seekAtX(e.nativeEvent.locationX);
          }}
          onResponderRelease={commitSeek}
          onResponderTerminate={commitSeek}
        >
          {/* Track */}
          <View className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden">
            <View
              style={{ width: `${effectiveProgress * 100}%` }}
              className="h-2 bg-purple-600"
            />
          </View>
        </View>

        {/* Times */}
        <View className="w-full flex-row justify-between mt-2">
          <Text className="text-gray-400 text-xs">
            {formatTime(
              scrubbing && preview != null
                ? Math.floor(preview * durationMillis)
                : positionMillis
            )}
          </Text>
          <Text className="text-gray-400 text-xs">
            {formatTime(durationMillis)}
          </Text>
        </View>
      </View>

      {/* Controles, ancho completo */}
      <View className="w-full px-10 mt-8 flex-row items-center justify-between">
        <TouchableOpacity
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            previous();
          }}
          accessibilityLabel="Anterior"
          className="p-3"
        >
          <Ionicons name="play-skip-back" size={32} color="white" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            togglePlayPause();
          }}
          accessibilityLabel={isPlaying ? "Pausar" : "Reproducir"}
          className="p-4 rounded-full bg-purple-600"
        >
          <Ionicons
            name={isPlaying ? "pause" : "play"}
            size={32}
            color="white"
          />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            next();
          }}
          accessibilityLabel="Siguiente"
          className="p-3"
        >
          <Ionicons name="play-skip-forward" size={32} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
