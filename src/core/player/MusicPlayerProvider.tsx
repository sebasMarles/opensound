import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  createAudioPlayer,
  setAudioModeAsync,
  type AudioPlayer,
  type AudioStatus,
} from "expo-audio";
import type { Track } from "@/features/music/api/jamendoService";

export type CurrentSong = {
  title: string;
  artist: string;
  image: string;
  audio?: string;
};

interface MusicPlayerContextType {
  // Estado visible en UI
  isPlaying: boolean;
  currentSong: CurrentSong | null;
  progress: number; // 0..1
  positionMillis: number;
  durationMillis: number;

  // Modal de detalles
  isPlayerVisible: boolean;
  setPlayerVisible: (v: boolean) => void;

  // Compat con UI actual
  setCurrentSong: React.Dispatch<React.SetStateAction<CurrentSong | null>>;
  setIsPlaying: React.Dispatch<React.SetStateAction<boolean>>;

  // Controles del reproductor
  togglePlayPause: () => Promise<void>;
  next: () => Promise<void>;
  previous: () => Promise<void>;
  seekTo: (ms: number) => Promise<void>;

  // Cola y reproducción por índice
  setQueueFromJamendo: (tracks: Track[]) => void;
  playTrackByIndex: (index: number) => Promise<void>;

  // Reproducir directamente un track de Jamendo
  playFromJamendoTrack: (t: Track) => Promise<void>;
}

// Contexto global encargado del estado del reproductor de audio.
const MusicPlayerContext = createContext<MusicPlayerContextType | undefined>(
  undefined
);

export const MusicPlayerProvider = ({ children }: { children: React.ReactNode }) => {
  const playerRef = useRef<AudioPlayer | null>(null);
  const statusSubscriptionRef = useRef<{ remove: () => void } | null>(null);
  const nextRef = useRef<(() => Promise<void>) | null>(null);

  // Cola
  const [queue, setQueue] = useState<CurrentSong[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(-1);

  // Estado visible
  const [currentSong, _setCurrentSong] = useState<CurrentSong | null>(null);
  const [isPlayingState, _setIsPlayingState] = useState(false);
  const [positionMillis, setPositionMillis] = useState(0);
  const [durationMillis, setDurationMillis] = useState(0);

  // Modal (detalles)
  const [isPlayerVisible, setPlayerVisible] = useState(false);

  const progress = durationMillis > 0 ? positionMillis / durationMillis : 0;

  // Config audio
  useEffect(() => {
    (async () => {
      try {
        await setAudioModeAsync({
          playsInSilentMode: true,
          shouldPlayInBackground: false,
          allowsRecording: false,
          interruptionMode: "duckOthers",
          interruptionModeAndroid: "duckOthers",
          shouldRouteThroughEarpiece: false,
        });
      } catch (error) {
        console.warn("No se pudo configurar el modo de audio", error);
      }
    })();
  }, []);

  // Limpieza
  useEffect(() => {
    return () => {
      statusSubscriptionRef.current?.remove?.();
      statusSubscriptionRef.current = null;
      if (playerRef.current) {
        try {
          playerRef.current.remove();
        } catch (error) {
          console.warn("No se pudo liberar el reproductor", error);
        }
        playerRef.current = null;
      }
    };
  }, []);

  const attachStatusListener = useCallback((player: AudioPlayer) => {
    statusSubscriptionRef.current?.remove?.();
    statusSubscriptionRef.current = player.addListener(
      "playbackStatusUpdate",
      (status: AudioStatus) => {
        _setIsPlayingState(Boolean(status.playing));
        const position = Math.max(0, Math.floor((status.currentTime ?? 0) * 1000));
        const duration = Math.max(0, Math.floor((status.duration ?? 0) * 1000));
        setPositionMillis(position);
        setDurationMillis(duration);

        if (status.didJustFinish && nextRef.current) {
          nextRef.current().catch(() => {});
        }
      }
    );
  }, []);

  const ensurePlayer = useCallback(() => {
    if (playerRef.current) {
      return playerRef.current;
    }

    const player = createAudioPlayer(null, { updateInterval: 400 });
    attachStatusListener(player);
    playerRef.current = player;
    return player;
  }, [attachStatusListener]);

  const loadAndPlay = useCallback(
    async (song: CurrentSong) => {
      const player = ensurePlayer();
      setPositionMillis(0);
      setDurationMillis(0);

      if (!song.audio) {
        _setIsPlayingState(false);
        player.pause();
        player.replace(null);
        return;
      }

      try {
        player.replace({ uri: song.audio });
        player.play();
      } catch (error) {
        console.warn("No se pudo reproducir la canción", error);
        _setIsPlayingState(false);
      }
    },
    [ensurePlayer]
  );

  const applyPlayback = useCallback((shouldPlay: boolean) => {
    const player = playerRef.current;
    if (!player) return;

    if (shouldPlay) {
      player.play();
    } else {
      player.pause();
    }
  }, []);

  const setIsPlaying: React.Dispatch<React.SetStateAction<boolean>> = (next) => {
    _setIsPlayingState((prev) => {
      const desired = typeof next === "function" ? (next as any)(prev) : next;
      applyPlayback(desired);
      return desired;
    });
  };

  const setCurrentSong: React.Dispatch<React.SetStateAction<CurrentSong | null>> =
    (value) => {
      _setCurrentSong(value);
    };

  // Cola
  const setQueueFromJamendo = useCallback((tracks: Track[]) => {
    const mapped: CurrentSong[] = (tracks || [])
      .map((t) => ({
        title: t.name ?? "Sin título",
        artist: t.artist_name ?? "Artista desconocido",
        image: t.album_image || t.image || "https://picsum.photos/200",
        audio: t.audio,
      }))
      .filter((t) => !!t.audio);

    setQueue(mapped);
    setCurrentIndex((prev) => {
      if (mapped.length === 0) return -1;
      return prev >= mapped.length ? 0 : prev;
    });
  }, []);

  const playTrackByIndex = useCallback(
    async (index: number) => {
      if (index < 0 || index >= queue.length) return;
      const song = queue[index];
      setCurrentIndex(index);
      _setCurrentSong(song);
      await loadAndPlay(song);
    },
    [loadAndPlay, queue]
  );

  const playFromJamendoTrack = useCallback(
    async (t: Track) => {
      const song: CurrentSong = {
        title: t.name ?? "Sin título",
        artist: t.artist_name ?? "Artista desconocido",
        image: t.album_image || t.image || "https://picsum.photos/200",
        audio: t.audio,
      };
      const idx = queue.findIndex((q) => q.audio === song.audio);
      if (idx >= 0) {
        await playTrackByIndex(idx);
      } else {
        setCurrentIndex(-1);
        _setCurrentSong(song);
        await loadAndPlay(song);
      }
    },
    [loadAndPlay, playTrackByIndex, queue]
  );

  const togglePlayPause = useCallback(async () => {
    const player = playerRef.current;
    if (!player) return;

    if (player.playing) {
      player.pause();
    } else {
      player.play();
    }
  }, []);

  const next = useCallback(async () => {
    if (queue.length === 0) return;
    const nextIndex = currentIndex + 1 < queue.length ? currentIndex + 1 : 0;
    await playTrackByIndex(nextIndex);
  }, [currentIndex, playTrackByIndex, queue.length]);

  const previous = useCallback(async () => {
    const player = playerRef.current;
    if (!player) return;

    if (positionMillis > 3000) {
      try {
        await player.seekTo(0);
      } catch {}
      setPositionMillis(0);
      return;
    }

    if (queue.length === 0) return;
    const prevIndex = currentIndex - 1 >= 0 ? currentIndex - 1 : queue.length - 1;
    await playTrackByIndex(prevIndex);
  }, [currentIndex, playTrackByIndex, positionMillis, queue.length]);

  const seekTo = useCallback(
    async (ms: number) => {
      const player = playerRef.current;
      if (!player) return;

      const target = Math.max(0, Math.min(ms, durationMillis || ms));
      try {
        await player.seekTo(target / 1000);
        setPositionMillis(target);
      } catch (error) {
        console.warn("No se pudo cambiar la posición de reproducción", error);
      }
    },
    [durationMillis]
  );

  useEffect(() => {
    nextRef.current = next;
  }, [next]);

  return (
    <MusicPlayerContext.Provider
      value={{
        isPlaying: isPlayingState,
        currentSong,
        progress,
        positionMillis,
        durationMillis,

        isPlayerVisible,
        setPlayerVisible,

        setCurrentSong,
        setIsPlaying,

        togglePlayPause,
        next,
        previous,
        seekTo,

        setQueueFromJamendo,
        playTrackByIndex,
        playFromJamendoTrack,
      }}
    >
      {children}
    </MusicPlayerContext.Provider>
  );
};

export const useMusicPlayer = () => {
  const ctx = useContext(MusicPlayerContext);
  if (!ctx) {
    throw new Error("useMusicPlayer debe usarse dentro de un MusicPlayerProvider");
  }
  return ctx;
};