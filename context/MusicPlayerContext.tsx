import React, { createContext, useContext, useState } from "react";

// 1. Definimos la interfaz del contexto
interface MusicPlayerContextType {
  isPlaying: boolean;
  setIsPlaying: React.Dispatch<React.SetStateAction<boolean>>;
  currentSong: {
    title: string;
    artist: string;
    image: string;
  };
  setCurrentSong: React.Dispatch<
    React.SetStateAction<{
      title: string;
      artist: string;
      image: string;
    }>
  >;
}

// 2. Creamos el contexto con tipo
const MusicPlayerContext = createContext<MusicPlayerContextType | undefined>(
  undefined
);

// 3. Provider
export const MusicPlayerProvider = ({ children }: { children: React.ReactNode }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSong, setCurrentSong] = useState({
    title: "Don’t Cry",
    artist: "Guns N’ Roses",
    image: "https://picsum.photos/100",
  });

  return (
    <MusicPlayerContext.Provider
      value={{ isPlaying, setIsPlaying, currentSong, setCurrentSong }}
    >
      {children}
    </MusicPlayerContext.Provider>
  );
};

// 4. Hook para usar el contexto
export const useMusicPlayer = () => {
  const context = useContext(MusicPlayerContext);
  if (!context) {
    throw new Error("useMusicPlayer debe usarse dentro de un MusicPlayerProvider");
  }
  return context;
};
