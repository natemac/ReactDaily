import React, { useEffect, useRef, useState } from 'react';
import { useMenuContext } from '../contexts/MenuContext';

const MusicPlayer = () => {
  const { 
    state: { selectedSong },
    testMusicTrack,
    playTestMusic,
    stopTestMusic
  } = useMenuContext();
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (testMusicTrack) {
      const updatePlayingState = () => {
        setIsPlaying(!testMusicTrack.paused);
      };

      updatePlayingState();
      testMusicTrack.addEventListener('play', updatePlayingState);
      testMusicTrack.addEventListener('pause', updatePlayingState);
      testMusicTrack.addEventListener('ended', updatePlayingState);

      return () => {
        testMusicTrack.removeEventListener('play', updatePlayingState);
        testMusicTrack.removeEventListener('pause', updatePlayingState);
        testMusicTrack.removeEventListener('ended', updatePlayingState);
      };
    }
  }, [testMusicTrack]);

  const togglePlayPause = () => {
    if (testMusicTrack) {
      if (isPlaying) {
        stopTestMusic();
      } else {
        playTestMusic();
      }
    } else {
      playTestMusic();
    }
  };

  if (!selectedSong) {
    return null;
  }

  return (
    <div className="music-player" style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 1000 }}>
      <div style={{ marginTop: '10px' }}>
        <button onClick={togglePlayPause}>
          {isPlaying ? (
            <span role="img" aria-label="Stop">⏹️</span> // Stop icon
          ) : (
            <span role="img" aria-label="Play">▶️</span> // Play icon
          )}
        </button>
      </div>
    </div>
  );
};

export default MusicPlayer; 