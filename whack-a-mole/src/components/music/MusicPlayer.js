import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import backgroundMusic from "../../assets/music.mp3"; // Ensure you have a music file

// Create a Music Context
const MusicContext = createContext();

export const useMusic = () => useContext(MusicContext);

export const MusicProvider = ({ children }) => {
  const audioRef = useRef(new Audio(backgroundMusic));
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    audio.loop = true; // Loop music continuously
    audio.volume = 0.5; // Set volume level

    if (isPlaying) {
      audio.play().catch((error) => console.log("Autoplay blocked:", error));
    } else {
      audio.pause();
    }
  }, [isPlaying]);

  return (
    <MusicContext.Provider value={{ isPlaying, setIsPlaying }}>
      {children}
    </MusicContext.Provider>
  );
};

// Button to Control Music
export const MusicButton = () => {
  const { isPlaying, setIsPlaying } = useMusic();

  return (
    <button
      onClick={() => setIsPlaying((prev) => !prev)}
      className="fixed-bottom text-light btn rounded-lg shadow-md"
      style={{backgroundColor:"transparent"}}
    >
      {isPlaying ? "🔇 Pause Music" : "🎵 Play Music"}
    </button>
  );
};
