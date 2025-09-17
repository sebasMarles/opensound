// context/MusicPlayerContext.tsx
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
  audio?: string; // URL reproducible (Jamendo 'audio')
};

interface MusicPlayerContextType {
  // Estado visible en UI
  isPlaying: boolean;
  currentSong: CurrentSong | null;
  progress: number; // 0..1
  positionMillis: number;
  durationMillis: number;

  // Control "compat" con la UI existente
  setCurrentSong: React.Dispatch<React.SetStateAction<CurrentSong | null>>;
  setIsPlaying: React.Dispatch<React.SetStateAction<boolean>>;

  // Controles del reproductor
  togglePlayPause: () => Promise<void>;
  next: () => Promise<void>;

  // Cola y reproducción por índice
  setQueueFromJamendo: (tracks: Track[]) => void;
  playTrackByIndex: (index: number) => Promise<void>;

  // Reproducir directamente un track de Jamendo (atajo útil)
  playFromJamendoTrack: (t: Track) => Promise<void>;
}

const MusicPlayerContext = createContext<MusicPlayerContextType | undefined>(
  undefined
);

export const MusicPlayerProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const soundRef = useRef<Audio.Sound | null>(null);

  // Cola y posición actual en la cola
  const [queue, setQueue] = useState<CurrentSong[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(-1);

  // Estado visible
  const [currentSong, _setCurrentSong] = useState<CurrentSong | null>(null);
  const [isPlayingState, _setIsPlayingState] = useState(false);
  const [positionMillis, setPositionMillis] = useState(0);
  const [durationMillis, setDurationMillis] = useState(0);

  const progress = durationMillis > 0 ? positionMillis / durationMillis : 0;

  // Config audio (una vez)
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

  // Limpieza al desmontar
  useEffect(() => {
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync().catch(() => {});
        soundRef.current = null;
      }
    };
  }, []);

  // Se llama cada ~500ms (configurable) por expo-av
  const onStatusUpdate = (status: any) => {
    if (!status?.isLoaded) return;
    const s = status as AVPlaybackStatusSuccess;
    _setIsPlayingState(s.isPlaying);
    setPositionMillis(s.positionMillis ?? 0);
    setDurationMillis(s.durationMillis ?? 0);

    if (s.didJustFinish) {
      // En cuanto termina, ir a siguiente
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

  // Carga y reproduce una canción (reemplaza la actual)
  const loadAndPlay = async (song: CurrentSong) => {
    await unloadCurrent();

    if (!song.audio) {
      // Si no hay audio, no se puede reproducir
      _setIsPlayingState(false);
      return;
    }

    const { sound } = await Audio.Sound.createAsync(
      { uri: song.audio },
      { shouldPlay: true, progressUpdateIntervalMillis: 500 },
      onStatusUpdate
    );
    soundRef.current = sound;
  };

  // Controla reproducción/pausa a partir de un boolean
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

  // Exponer setIsPlaying que además controla el Audio.Sound
  const setIsPlaying: React.Dispatch<React.SetStateAction<boolean>> = (
    next
  ) => {
    _setIsPlayingState((prev) => {
      const desired = typeof next === "function" ? (next as any)(prev) : next;
      // Disparar efecto sobre el objeto de audio
      applyPlayback(desired).catch(() => {});
      return desired;
    });
  };

  // setCurrentSong "compat": solo cambia la info visible; NO inicia reproducción
  // Para reproducir, usa playFromJamendoTrack() o playTrackByIndex()
  const setCurrentSong: React.Dispatch<React.SetStateAction<CurrentSong | null>> =
    (value) => {
      _setCurrentSong(value);
    };

  // API pública del contexto

  // 1) Construir cola desde Jamendo
  const setQueueFromJamendo = (tracks: Track[]) => {
    const mapped: CurrentSong[] = (tracks || [])
      .map((t) => ({
        title: t.name ?? "Sin título",
        artist: t.artist_name ?? "Artista desconocido",
        image: t.album_image || t.image || "https://picsum.photos/200",
        audio: t.audio, // puede ser undefined
      }))
      // Para reproducción, nos quedamos con las que tienen audio
      .filter((t) => !!t.audio);

    setQueue(mapped);
    if (mapped.length === 0) {
      setCurrentIndex(-1);
    } else if (currentIndex >= mapped.length) {
      setCurrentIndex(0);
    }
  };

  // 2) Reproducir por índice de cola
  const playTrackByIndex = async (index: number) => {
    if (index < 0 || index >= queue.length) return;
    const song = queue[index];
    setCurrentIndex(index);
    _setCurrentSong(song);
    await loadAndPlay(song);
  };

  // 3) Reproducir directamente desde un Track de Jamendo (atajo)
  const playFromJamendoTrack = async (t: Track) => {
    const song: CurrentSong = {
      title: t.name ?? "Sin título",
      artist: t.artist_name ?? "Artista desconocido",
      image: t.album_image || t.image || "https://picsum.photos/200",
      audio: t.audio,
    };
    // Si la canción existe en la cola, actualiza índice; si no, la reproducimos fuera de cola
    const idx = queue.findIndex((q) => q.audio === song.audio);
    if (idx >= 0) {
      await playTrackByIndex(idx);
    } else {
      setCurrentIndex(-1);
      _setCurrentSong(song);
      await loadAndPlay(song);
    }
  };

  // 4) Toggle play/pause
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

  // 5) Siguiente canción (cíclico si hay cola)
  const next = async () => {
    if (queue.length === 0) return;
    const nextIndex =
      currentIndex + 1 < queue.length ? currentIndex + 1 : 0;
    await playTrackByIndex(nextIndex);
  };

  return (
    <MusicPlayerContext.Provider
      value={{
        isPlaying: isPlayingState,
        currentSong,
        progress,
        positionMillis,
        durationMillis,

        setCurrentSong,
        setIsPlaying,

        togglePlayPause,
        next,

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
    throw new Error(
      "useMusicPlayer debe usarse dentro de un MusicPlayerProvider"
    );
  }
  return ctx;
};