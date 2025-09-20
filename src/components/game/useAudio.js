import { useEffect, useRef, useCallback } from 'react';
import { getSoundPath } from '../../utils/audioUtils';

/**
 * Custom hook for audio effects
 * @param {Object} config - Audio configuration options
 * @returns {Object} Audio methods and state
 */
export const useAudio = (config = {}) => {
  const {
    enabled = true,
    volume = 0.5,
  } = config;

  // Store audio elements in a ref to avoid re-creating on each render
  const audioRef = useRef({
    initialized: false,
    sounds: {},
    context: null
  });

  // Initialize audio context and load sounds
  useEffect(() => {
    // Only initialize once
    if (audioRef.current.initialized) return;

    // Create audio context
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) {
      console.warn('Web Audio API not supported in this browser');
      return;
    }

    try {
      audioRef.current.context = new AudioContext();
      
      // Define sound buffers (we'll load them asynchronously)
      const soundsToLoad = {
        tick: getSoundPath('tick'),
        success: getSoundPath('success'),
        wrong: getSoundPath('wrong'),
        hint: getSoundPath('hint')
      };
      
      // Load each sound
      Object.entries(soundsToLoad).forEach(([name, url]) => {
        // Create audio element
        const audio = new Audio();
        audio.src = url;
        audio.volume = volume;
        audio.preload = 'auto';
        
        // Store in our ref
        audioRef.current.sounds[name] = audio;
      });
      
      audioRef.current.initialized = true;
    } catch (error) {
      console.error('Error initializing audio:', error);
    }
  }, [volume]);

  // Update volume when configuration changes
  useEffect(() => {
    if (!audioRef.current.initialized) return;

    // Update volume for all sounds
    Object.values(audioRef.current.sounds).forEach(audio => {
      audio.volume = volume;
    });
  }, [volume]);

  // Play a sound by name
  const playSound = useCallback((name) => {
    if (!enabled || !audioRef.current.initialized) return;

    const sound = audioRef.current.sounds[name];
    if (!sound) {
      console.warn(`Sound not found: ${name}`);
      return;
    }

    // Reset and play the sound
    sound.currentTime = 0;
    sound.play().catch(error => {
      // Handle autoplay policy issues
      console.warn(`Error playing sound ${name}:`, error);
    });
  }, [enabled]);

  // Stop all sounds
  const stopAllSounds = useCallback(() => {
    if (!audioRef.current.initialized) return;

    Object.values(audioRef.current.sounds).forEach(audio => {
      audio.pause();
      audio.currentTime = 0;
    });
  }, []);

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current.initialized) {
        stopAllSounds();
        if (audioRef.current.context) {
          audioRef.current.context.close().catch(console.error);
        }
      }
    };
  }, [stopAllSounds]);

  return {
    playSound,
    stopAllSounds,
    isInitialized: audioRef.current.initialized
  };
};

export default useAudio; 