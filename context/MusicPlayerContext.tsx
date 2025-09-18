import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Audio, AVPlaybackStatusSuccess } from "expo-av";
import type { Track } from "../services/jamendo";

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

const MusicPlayerContext = createContext<MusicPlayerContextType | undefined>(
  undefined
);

export const MusicPlayerProvider = ({ children }: { children: React.ReactNode }) => {
  const soundRef = useRef<Audio.Sound | null>(null);

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
      await Audio.setAudioModeAsync({
        staysActiveInBackground: false,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
    })();
  }, []);

  // Limpieza
  useEffect(() => {
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync().catch(() => {});
        soundRef.current = null;
      }
    };
  }, []);

  const onStatusUpdate = (status: any) => {
    if (!status?.isLoaded) return;
    const s = status as AVPlaybackStatusSuccess;
    _setIsPlayingState(s.isPlaying);
    setPositionMillis(s.positionMillis ?? 0);
    setDurationMillis(s.durationMillis ?? 0);

    if (s.didJustFinish) {
      next().catch(() => {});
    }
  };

  const unloadCurrent = async () => {
    if (soundRef.current) {
      try {
        await soundRef.current.unloadAsync();
      } catch {}
      soundRef.current = null;
    }
  };

  const loadAndPlay = async (song: CurrentSong) => {
    await unloadCurrent();

    if (!song.audio) {
      _setIsPlayingState(false);
      return;
    }

    const { sound } = await Audio.Sound.createAsync(
      { uri: song.audio },
      { shouldPlay: true, progressUpdateIntervalMillis: 400 },
      onStatusUpdate
    );
    soundRef.current = sound;
  };

  const applyPlayback = async (shouldPlay: boolean) => {
    const sound = soundRef.current;
    if (!sound) return;
    const status = (await sound.getStatusAsync()) as AVPlaybackStatusSuccess;
    if (!status.isLoaded) return;

    if (shouldPlay && !status.isPlaying) {
      await sound.playAsync();
    } else if (!shouldPlay && status.isPlaying) {
      await sound.pauseAsync();
    }
  };

  const setIsPlaying: React.Dispatch<React.SetStateAction<boolean>> = (next) => {
    _setIsPlayingState((prev) => {
      const desired = typeof next === "function" ? (next as any)(prev) : next;
      applyPlayback(desired).catch(() => {});
      return desired;
    });
  };

  const setCurrentSong: React.Dispatch<React.SetStateAction<CurrentSong | null>> =
    (value) => {
      _setCurrentSong(value);
    };

  // Cola
  const setQueueFromJamendo = (tracks: Track[]) => {
    const mapped: CurrentSong[] = (tracks || [])
      .map((t) => ({
        title: t.name ?? "Sin título",
        artist: t.artist_name ?? "Artista desconocido",
        image: t.album_image || t.image || "https://picsum.photos/200",
        audio: t.audio,
      }))
      .filter((t) => !!t.audio);

    setQueue(mapped);
    if (mapped.length === 0) {
      setCurrentIndex(-1);
    } else if (currentIndex >= mapped.length) {
      setCurrentIndex(0);
    }
  };

  const playTrackByIndex = async (index: number) => {
    if (index < 0 || index >= queue.length) return;
    const song = queue[index];
    setCurrentIndex(index);
    _setCurrentSong(song);
    await loadAndPlay(song);
  };

  const playFromJamendoTrack = async (t: Track) => {
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
  };

  const togglePlayPause = async () => {
    const sound = soundRef.current;
    if (!sound) return;
    const status = (await sound.getStatusAsync()) as AVPlaybackStatusSuccess;
    if (!status.isLoaded) return;
    if (status.isPlaying) {
      await sound.pauseAsync();
    } else {
      await sound.playAsync();
    }
  };

  const next = async () => {
    if (queue.length === 0) return;
    const nextIndex = currentIndex + 1 < queue.length ? currentIndex + 1 : 0;
    await playTrackByIndex(nextIndex);
  };

  const previous = async () => {
    const sound = soundRef.current;
    if (!sound) return;
    const status = (await sound.getStatusAsync()) as AVPlaybackStatusSuccess;
    if (!status.isLoaded) return;

    // Si ya pasó de 3s, volver al inicio; si no, ir a la anterior
    if ((status.positionMillis ?? 0) > 3000) {
      await sound.setPositionAsync(0);
      setPositionMillis(0);
      return;
    }

    if (queue.length === 0) return;
    const prevIndex = currentIndex - 1 >= 0 ? currentIndex - 1 : queue.length - 1;
    await playTrackByIndex(prevIndex);
  };

  const seekTo = async (ms: number) => {
    const sound = soundRef.current;
    if (!sound) return;
    const status = (await sound.getStatusAsync()) as AVPlaybackStatusSuccess;
    if (!status.isLoaded) return;
    const target = Math.max(0, Math.min(ms, status.durationMillis ?? ms));
    await sound.setPositionAsync(target);
    setPositionMillis(target);
  };

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