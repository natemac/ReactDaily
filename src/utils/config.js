/**
 * Game Configuration
 * Central place for all game-related constants and settings
 */

export const CONFIG = {
  // Animation settings
  PIXELS_PER_SECOND: 200,       // Animation speed in pixels per second (lower = slower)
  MINIMUM_LINE_TIME: 200,       // Minimum time for short lines (milliseconds)
  ANIMATION_LINE_BY_LINE: true, // Animate lines individually from point to point

  // Visual settings
  DOT_RADIUS: 4,                // Size of dots on the grid
  LINE_WIDTH: 3,                // Width of drawing lines

  // Gameplay settings
  GUESS_TIME_LIMIT: 20,         // Seconds for guessing
  HIDE_INITIAL_MESSAGES: true,  // Hide any messages at game start

  // Hint system
  HINT_COOLDOWN_TIME: 5,        // Cooldown time in seconds between hints
  HINTS_AVAILABLE: 0,           // Number of hints available per game (0 = unlimited)

  // UI settings
  WRONG_MESSAGE_DURATION: 800,  // Duration to show wrong messages (milliseconds)
  CELEBRATION_DURATION: 4000,   // Duration of celebration before returning to menu (increased from 1500ms to 4000ms)
  SHOW_SONG_INFO: false,        // Whether to display song information in category cards

  // Audio settings
  MUSIC_ENABLED: true,          // Enable background music
  SOUND_EFFECTS_ENABLED: true,  // Enable sound effects
  MUSIC_VOLUME: 0.4,            // Default volume for background music (0-1)
  SFX_VOLUME: 0.5,              // Default volume for sound effects (0-1)
  FADE_DURATION: 500,           // Default duration for audio fades (milliseconds)

  // Debug settings
  DEBUG_MODE: false             // Enable debug logging and features
};

// You can also export individual settings if needed
export const {
  PIXELS_PER_SECOND,
  MINIMUM_LINE_TIME,
  ANIMATION_LINE_BY_LINE,
  DOT_RADIUS,
  LINE_WIDTH,
  GUESS_TIME_LIMIT,
  HIDE_INITIAL_MESSAGES,
  HINT_COOLDOWN_TIME,
  HINTS_AVAILABLE,
  WRONG_MESSAGE_DURATION,
  CELEBRATION_DURATION,
  SHOW_SONG_INFO,
  MUSIC_ENABLED,
  SOUND_EFFECTS_ENABLED,
  MUSIC_VOLUME,
  SFX_VOLUME,
  FADE_DURATION,
  DEBUG_MODE
} = CONFIG; 