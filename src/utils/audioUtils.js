// Helper function to get the correct base path for audio files
export const getBasePath = () => {
  // In development, use root path
  if (import.meta.env.DEV) {
    return '';
  }

  // In production (GitHub Pages), use the repository path
  return '/ReactDaily';
};

// Helper function to construct audio file paths
export const getAudioPath = (path) => {
  const basePath = getBasePath();
  // Ensure path starts with / if it doesn't already
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${basePath}${normalizedPath}`;
};

// Helper function specifically for music files
export const getMusicPath = (songNumber) => {
  const paddedNumber = String(songNumber).padStart(5, '0');
  return getAudioPath(`/music/song_${paddedNumber}.mp3`);
};

// Helper function specifically for sound effects
export const getSoundPath = (soundName) => {
  return getAudioPath(`/sounds/${soundName}.mp3`);
};