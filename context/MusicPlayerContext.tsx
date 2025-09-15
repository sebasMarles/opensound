import React, { createContext, useContext, useState } from "react";

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

const MusicPlayerContext = createContext<MusicPlayerContextType | undefined>(
  undefined
);

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

export const useMusicPlayer = () => {
  const context = useContext(MusicPlayerContext);
  if (!context) {
    throw new Error("useMusicPlayer debe usarse dentro de un MusicPlayerProvider");
  }
  return context;
};
