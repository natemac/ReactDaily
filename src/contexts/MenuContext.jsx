import { createContext, useContext, useReducer, useEffect, useState } from 'react';
import { getMusicPath, getSoundPath } from '../utils/audioUtils';

// Get the saved theme from localStorage or use default 'modern'
const getSavedTheme = () => {
  try {
    const savedTheme = localStorage.getItem('currentTheme');
    return savedTheme || 'modern';
  } catch (e) {
    return 'modern';
  }
};

// Initial state
const initialState = {
  // Audio settings
  audioEnabled: true,
  musicVolume: 40,
  sfxVolume: 50,
  
  // Appearance settings
  currentTheme: getSavedTheme(), // Use function to get saved theme

  // Music assignments for categories
  categoryMusic: {
    yellow: null,
    green: null,
    blue: null,
    red: null
  },
  
  // Currently selected song for testing
  selectedSong: getMusicPath(0),
  
  // Shuffle mode
  shuffleEnabled: false
};

// Action types
const ActionTypes = {
  TOGGLE_AUDIO: 'TOGGLE_AUDIO',
  SET_MUSIC_VOLUME: 'SET_MUSIC_VOLUME',
  SET_SFX_VOLUME: 'SET_SFX_VOLUME',
  SET_THEME: 'SET_THEME',
  SET_CATEGORY_MUSIC: 'SET_CATEGORY_MUSIC',
  SET_SELECTED_SONG: 'SET_SELECTED_SONG',
  TOGGLE_SHUFFLE: 'TOGGLE_SHUFFLE'
};

// Reducer function
function menuReducer(state, action) {
  switch (action.type) {
    case ActionTypes.TOGGLE_AUDIO:
      return {
        ...state,
        audioEnabled: !state.audioEnabled
      };
      
    case ActionTypes.SET_MUSIC_VOLUME:
      return {
        ...state,
        musicVolume: action.payload
      };
      
    case ActionTypes.SET_SFX_VOLUME:
      return {
        ...state,
        sfxVolume: action.payload
      };
      
    case ActionTypes.SET_THEME:
      // Save theme to localStorage when it changes
      localStorage.setItem('currentTheme', action.payload);
      return {
        ...state,
        currentTheme: action.payload
      };
      
    case ActionTypes.SET_CATEGORY_MUSIC:
      return {
        ...state,
        categoryMusic: action.payload
      };
      
    case ActionTypes.SET_SELECTED_SONG:
      return {
        ...state,
        selectedSong: action.payload
      };
      
    case ActionTypes.TOGGLE_SHUFFLE:
      return {
        ...state,
        shuffleEnabled: !state.shuffleEnabled
      };
      
    default:
      return state;
  }
}

// Create context
const MenuContext = createContext();

// Provider component
export function MenuProvider({ children }) {
  const [state, dispatch] = useReducer(menuReducer, initialState);
  const [musicTracks, setMusicTracks] = useState({});
  const [testMusicTrack, setTestMusicTrack] = useState(null);
  const [availableSongs, setAvailableSongs] = useState([]);
  
  // Load saved settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('appSettings');
    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings);
        if (parsedSettings.audioEnabled !== undefined) {
          dispatch({ type: ActionTypes.TOGGLE_AUDIO, payload: parsedSettings.audioEnabled });
        }
        if (parsedSettings.musicVolume !== undefined) {
          dispatch({ type: ActionTypes.SET_MUSIC_VOLUME, payload: parsedSettings.musicVolume });
        }
        if (parsedSettings.sfxVolume !== undefined) {
          dispatch({ type: ActionTypes.SET_SFX_VOLUME, payload: parsedSettings.sfxVolume });
        }
        if (parsedSettings.currentTheme) {
          dispatch({ type: ActionTypes.SET_THEME, payload: parsedSettings.currentTheme });
        }
        if (parsedSettings.selectedSong) {
          dispatch({ type: ActionTypes.SET_SELECTED_SONG, payload: parsedSettings.selectedSong });
        }
      } catch (error) {
        console.error('Error loading saved settings:', error);
      }
    }
  }, []);
  
  // Save settings to localStorage when they change
  useEffect(() => {
    localStorage.setItem('appSettings', JSON.stringify(state));
    
    // Apply theme to document element
    document.documentElement.setAttribute('data-theme', state.currentTheme);
    
    // Update title with theme name (to indicate theme is applied)
    const themeName = state.currentTheme === '8bit' ? '8-Bit' : 'Modern';
    document.title = `React Daily - ${themeName}`;
  }, [state]);
  
  // Add a separate effect that runs once on mount to apply theme CSS
  useEffect(() => {
    // Ensure theme CSS is loaded properly
    const ensureThemeStylesheet = (themeName) => {
      const linkId = 'theme-stylesheet';
      let styleLink = document.getElementById(linkId);
      
      if (!styleLink) {
        styleLink = document.createElement('link');
        styleLink.id = linkId;
        styleLink.rel = 'stylesheet';
        document.head.appendChild(styleLink);
      }
      
      // Use absolute path to ensure it works regardless of routing
      const baseUrl = window.location.origin;
      styleLink.href = `${baseUrl}/src/styles/themes/${themeName}.css`;
    };
    
    // Apply current theme
    ensureThemeStylesheet(state.currentTheme);
    
    // Also update when theme changes
    const handleThemeChange = () => {
      ensureThemeStylesheet(state.currentTheme);
    };
    
    // Set up listener for theme changes
    window.addEventListener('storage', (event) => {
      if (event.key === 'appSettings') {
        try {
          const settings = JSON.parse(event.newValue);
          if (settings && settings.currentTheme) {
            ensureThemeStylesheet(settings.currentTheme);
          }
        } catch (e) {
          console.error('Error parsing storage event value:', e);
        }
      }
    });
    
    return () => {
      window.removeEventListener('storage', handleThemeChange);
    };
  }, [state.currentTheme]);
  
  // Preload music tracks and assign random tracks to categories
  useEffect(() => {
    const preloadMusic = async () => {
      try {
        // Get all MP3 files from the music folder
        const musicFiles = [];
        for (let i = 0; i <= 55; i++) {
          const songPath = getMusicPath(i);
          // Check if the file exists by attempting to load it
          try {
            const response = await fetch(songPath, { method: 'HEAD' });
            if (response.ok) {
              musicFiles.push(songPath);
            }
          } catch (error) {
            console.warn(`Could not load ${songPath}:`, error);
          }
        }
        
        if (musicFiles.length === 0) {
          console.error('No music files found in the music folder');
          return;
        }
        
        setAvailableSongs(musicFiles);
        
        // Shuffle array
        const shuffledSongs = [...musicFiles];
        for (let i = shuffledSongs.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffledSongs[i], shuffledSongs[j]] = [shuffledSongs[j], shuffledSongs[i]];
        }
        
        // Select first 4 songs for categories
        const selectedSongs = shuffledSongs.slice(0, 4);
        
        // Create audio elements and start preloading
        const tracks = {};
        const categories = ['yellow', 'green', 'blue', 'red'];
        const categoryMusic = {};
        
        categories.forEach((category, index) => {
          const songPath = selectedSongs[index];
          tracks[category] = new Audio(songPath);
          tracks[category].preload = 'auto';
          tracks[category].volume = state.musicVolume / 100;
          tracks[category].loop = true;
          categoryMusic[category] = songPath;
        });
        
        // Store the preloaded tracks
        setMusicTracks(tracks);
        
        // Store category music assignments in state
        dispatch({ type: ActionTypes.SET_CATEGORY_MUSIC, payload: categoryMusic });
        
        console.log('Music preloaded and assigned to categories:', categoryMusic);
      } catch (error) {
        console.error('Error preloading music:', error);
      }
    };
    
    preloadMusic();
    
    // Add event listener to stop all music when the page unloads
    const handleBeforeUnload = () => {
      stopAllMusic();
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  // Update music volume when it changes
  useEffect(() => {
    Object.values(musicTracks).forEach(track => {
      if (track) {
        track.volume = state.musicVolume / 100;
      }
    });
    
    if (testMusicTrack) {
      testMusicTrack.volume = state.musicVolume / 100;
    }
  }, [state.musicVolume, musicTracks, testMusicTrack]);
  
  // Update SFX volume globally when it changes
  // This ensures any new sound effects created will use the current volume setting
  useEffect(() => {
    // Store the current SFX volume in a global variable that can be accessed
    // by other components that create audio elements for sound effects
    window.globalSfxVolume = state.sfxVolume / 100;
    
    // We don't need to update existing SFX elements here since they're typically
    // short-lived and created when needed
    console.log(`SFX Volume updated to ${state.sfxVolume}%`);
  }, [state.sfxVolume]);
  
  // Play music for a specific category
  const playMusicForCategory = (category) => {
    if (!state.audioEnabled || !musicTracks[category]) return;
    
    // If test music is already playing, don't interrupt it
    if (testMusicTrack && !testMusicTrack.paused) {
      console.log('Test music is already playing, not starting category music');
      return;
    }
    
    // Stop all other music first
    Object.entries(musicTracks).forEach(([cat, track]) => {
      if (cat !== category && track) {
        track.pause();
        track.currentTime = 0;
      }
    });
    
    // Stop test music if playing
    if (testMusicTrack) {
      testMusicTrack.pause();
      testMusicTrack.currentTime = 0;
    }
    
    // Play the selected category music
    musicTracks[category].play().catch(error => {
      console.error('Error playing music:', error);
    });
  };
  
  // Stop all music
  const stopAllMusic = () => {
    Object.values(musicTracks).forEach(track => {
      if (track) {
        track.pause();
        track.currentTime = 0;
      }
    });
    
    if (testMusicTrack) {
      testMusicTrack.pause();
      testMusicTrack.currentTime = 0;
    }
  };
  
  // Stop only category music but preserve test music
  const stopCategoryMusic = () => {
    Object.values(musicTracks).forEach(track => {
      if (track) {
        track.pause();
        track.currentTime = 0;
      }
    });
    
    // Intentionally not stopping test music
  };
  
  // Helper function to setup and play a new track
  const setupAndPlayTrack = (songPath, forcePlay = false) => {
    // Stop any previously playing test music
    if (testMusicTrack) {
      testMusicTrack.pause();
      testMusicTrack.currentTime = 0;
    }
    
    // Create a new audio element for the selected song
    const newTestTrack = new Audio(songPath);
    newTestTrack.volume = state.musicVolume / 100;
    newTestTrack.loop = false;
    
    // Add event listener to play next song when this one ends
    newTestTrack.addEventListener('ended', () => {
      console.log('Song ended, advancing to next song');
      // We need to explicitly tell the next song to play regardless of current play state
      const currentIndex = availableSongs.indexOf(songPath);
      let nextSong;
      
      if (state.shuffleEnabled) {
        // Pick a random song that's not the current one
        const availableSongsExceptCurrent = availableSongs.filter(song => song !== songPath);
        const randomIndex = Math.floor(Math.random() * availableSongsExceptCurrent.length);
        nextSong = availableSongsExceptCurrent[randomIndex];
      } else {
        // Normal sequential behavior
        if (currentIndex < availableSongs.length - 1) {
          nextSong = availableSongs[currentIndex + 1];
        } else {
          // Wrap around to the first song
          nextSong = availableSongs[0];
        }
      }
      
      // Update the selected song in state
      dispatch({ type: ActionTypes.SET_SELECTED_SONG, payload: nextSong });
      
      // Force play the next song
      setupAndPlayTrack(nextSong, true);
    });
    
    // Store the track
    setTestMusicTrack(newTestTrack);
    
    // Play the test music if music was already playing or force play is true
    if (forcePlay || (testMusicTrack && !testMusicTrack.paused)) {
      newTestTrack.play().catch(error => {
        console.error('Error playing test music:', error);
      });
    }
    
    return newTestTrack;
  };

  // Test currently selected music
  const playTestMusic = () => {
    if (!state.audioEnabled) return;
    
    // If the test music is already playing, stop it
    if (testMusicTrack && !testMusicTrack.paused) {
      testMusicTrack.pause();
      testMusicTrack.currentTime = 0;
      return;
    }
    
    // Stop any previously playing test music
    if (testMusicTrack) {
      testMusicTrack.pause();
      testMusicTrack.currentTime = 0;
    }
    
    // Stop any category music that might be playing
    Object.values(musicTracks).forEach(track => {
      if (track) {
        track.pause();
        track.currentTime = 0;
      }
    });
    
    // Setup and play the selected song with force play enabled
    setupAndPlayTrack(state.selectedSong, true);
  };
  
  // Select previous song
  const selectPreviousSong = () => {
    const currentIndex = availableSongs.indexOf(state.selectedSong);
    let previousSong;
    
    if (currentIndex > 0) {
      previousSong = availableSongs[currentIndex - 1];
    } else {
      // Wrap around to the last song
      previousSong = availableSongs[availableSongs.length - 1];
    }
    
    dispatch({ type: ActionTypes.SET_SELECTED_SONG, payload: previousSong });
    
    // If test music is currently playing, play the new song
    if (testMusicTrack && !testMusicTrack.paused) {
      setupAndPlayTrack(previousSong, true);
    }
  };
  
  // Select next song with shuffle support
  const selectNextSong = () => {
    let nextSong;
    
    if (state.shuffleEnabled) {
      // Pick a random song that's not the current one
      const availableSongsExceptCurrent = availableSongs.filter(song => song !== state.selectedSong);
      const randomIndex = Math.floor(Math.random() * availableSongsExceptCurrent.length);
      nextSong = availableSongsExceptCurrent[randomIndex];
    } else {
      // Normal sequential behavior
      const currentIndex = availableSongs.indexOf(state.selectedSong);
      
      if (currentIndex < availableSongs.length - 1) {
        nextSong = availableSongs[currentIndex + 1];
      } else {
        // Wrap around to the first song
        nextSong = availableSongs[0];
      }
    }
    
    dispatch({ type: ActionTypes.SET_SELECTED_SONG, payload: nextSong });
    
    // If test music is currently playing, play the new song
    if (testMusicTrack && !testMusicTrack.paused) {
      setupAndPlayTrack(nextSong, true);
    }
  };
  
  // Stop test music specifically (used when closing menu)
  const stopTestMusic = () => {
    if (testMusicTrack) {
      testMusicTrack.pause();
      testMusicTrack.currentTime = 0;
      setTestMusicTrack(null); // Reset track to ensure icon change
    }
  };
  
  // Update the getSongNumber function to handle the new format
  const getSongNumber = (path) => {
    if (!path) return null;
    const match = path.match(/song_(\d+)\.mp3$/);
    return match ? parseInt(match[1]).toString() : null;
  };
  
  // Test sound function
  const playTestSound = () => {
    if (state.audioEnabled) {
      const sound = new Audio(getSoundPath('correct'));
      sound.volume = state.sfxVolume / 100;
      sound.play().catch(error => {
        console.error('Error playing test sound:', error);
      });
    }
  };
  
  // Toggle shuffle mode
  const toggleShuffle = () => {
    dispatch({ type: ActionTypes.TOGGLE_SHUFFLE });
  };
  
  return (
    <MenuContext.Provider value={{ 
      state, 
      dispatch, 
      ActionTypes, 
      playTestSound, 
      playMusicForCategory,
      stopAllMusic,
      stopCategoryMusic,
      selectPreviousSong,
      selectNextSong,
      playTestMusic,
      stopTestMusic,
      getSongNumber,
      testMusicTrack,
      toggleShuffle
    }}>
      {children}
    </MenuContext.Provider>
  );
}

// Custom hook for using the menu context
export function useMenuContext() {
  const context = useContext(MenuContext);
  if (!context) {
    throw new Error('useMenuContext must be used within a MenuProvider');
  }
  return context;
} 