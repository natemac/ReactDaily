import { useEffect, useRef, useCallback, useState } from 'react';
import { useMenuContext } from '../../contexts/MenuContext';
import { getSoundPath } from '../../utils/audioUtils';

/**
 * Custom hook for audio effects
 * @param {Object} config - Audio configuration options
 * @returns {Object} Audio methods and state
 */
export const useAudioEffects = (config = {}) => {
  // Get current volume settings from MenuContext
  const { state: menuState } = useMenuContext();
  
  // Use MenuContext values if available, otherwise fall back to config
  const {
    enabled = menuState?.audioEnabled !== undefined ? menuState.audioEnabled : true,
    volume = menuState?.sfxVolume ? menuState.sfxVolume / 100 : 0.5,
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
        completion: getSoundPath('completion'),
        correct: getSoundPath('correct'),
        incorrect: getSoundPath('incorrect'),
        guess: getSoundPath('guess')
      };
      
      // Load each sound
      Object.entries(soundsToLoad).forEach(([name, url]) => {
        // Create audio element
        const audio = new Audio();
        audio.src = url;
        audio.volume = menuState?.sfxVolume ? menuState.sfxVolume / 100 : volume;
        audio.preload = 'auto';
        
        // Add an ID to help identify the audio element in the DOM
        audio.id = `audio-${name}`;
        
        // Store in our ref
        audioRef.current.sounds[name] = audio;
      });
      
      audioRef.current.initialized = true;
    } catch (error) {
      console.error('Error initializing audio:', error);
    }
  }, [menuState?.sfxVolume, volume]);

  // Update volume when configuration changes or MenuContext volume changes
  useEffect(() => {
    if (!audioRef.current.initialized) return;
    
    // Get the most up to date volume value, preferring the value from MenuContext
    const currentVolume = menuState?.sfxVolume ? menuState.sfxVolume / 100 : volume;

    // Update volume for all sounds
    Object.values(audioRef.current.sounds).forEach(audio => {
      audio.volume = currentVolume;
    });
    
    console.log(`Audio effects volume updated to ${currentVolume * 100}%`);
  }, [menuState?.sfxVolume, volume]);

  // Play a sound by name and return the audio element
  const playSound = useCallback((name) => {
    // Check both the passed enabled prop AND the global audio enabled state
    const isAudioEnabled = (enabled && menuState?.audioEnabled !== false);
    
    if (!isAudioEnabled || !audioRef.current.initialized) {
      console.log('Audio disabled or not initialized, not playing sound:', name);
      return null;
    }

    const sound = audioRef.current.sounds[name];
    if (!sound) {
      console.warn(`Sound not found: ${name}`);
      return null;
    }

    // Make sure we're using the latest volume setting
    if (menuState?.sfxVolume) {
      sound.volume = menuState.sfxVolume / 100;
    }
    
    // Reset and play the sound
    sound.currentTime = 0;
    sound.play().catch(error => {
      // Handle autoplay policy issues
      console.warn(`Error playing sound ${name}:`, error);
    });
    
    return sound;
  }, [enabled, menuState?.audioEnabled, menuState?.sfxVolume]);
  
  // Get the audio element by name without playing it
  const getAudio = useCallback((name) => {
    if (!audioRef.current.initialized) return null;
    return audioRef.current.sounds[name] || null;
  }, []);
  
  // Get the duration of a sound (in milliseconds)
  const getAudioDuration = useCallback((name) => {
    const audio = getAudio(name);
    if (!audio || !isFinite(audio.duration)) return 0;
    return audio.duration * 1000; // Convert to milliseconds
  }, [getAudio]);

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
          // Only close the context if it's not already closed or closing
          if (audioRef.current.context.state !== 'closed' && audioRef.current.context.state !== 'closing') {
            audioRef.current.context.close().catch(error => {
              console.warn('Error closing audio context:', error);
            });
          }
        }
      }
    };
  }, [stopAllSounds]);

  return {
    playSound,
    getAudio,
    getAudioDuration,
    stopAllSounds,
    isInitialized: audioRef.current.initialized,
    currentVolume: menuState?.sfxVolume ? menuState.sfxVolume / 100 : volume,
    audioEnabled: menuState?.audioEnabled !== false
  };
};

export default useAudioEffects; 