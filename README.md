# Anticipation Daily - React App

## Project Overview
This is a React-based web application for the Anticipation Daily game/puzzle experience. The app consists of both a game mode where users can play puzzles and a builder mode where new puzzles can be created.

## File Structure

```
AnticipationDaily-React/
├── public/             # Static assets and HTML template
├── src/                # Main source code
│   ├── assets/         # Images, icons, and other static resources
│   ├── components/     # UI components
│   │   ├── builder/    # Components for puzzle builder interface
│   │   ├── game/       # Components for gameplay interface
│   │   ├── Home.jsx    # Home page component
│   │   ├── OrientationHandler.jsx  # Handles device orientation
│   │   └── RotationOverlay.jsx     # Shows overlay for incorrect orientation
│   ├── contexts/       # React context providers for state management
│   │   ├── BuilderContext.jsx      # State for the puzzle builder
│   │   └── GameContext.jsx         # State for the game
│   ├── hooks/          # Custom React hooks
│   │   ├── useBuilderActions.jsx   # Centralized actions for builder
│   │   ├── useMouseKeyboardControls.jsx # Mouse/keyboard specific controls
│   │   ├── useTouchControls.jsx    # Touch-specific controls
│   │   ├── useExport.jsx           # Export functionality
│   │   └── useTimer.js             # Timer functionality
│   ├── styles/         # CSS modules and style-related files
│   ├── utils/          # Utility functions and constants
│   │   ├── config.js   # Configuration values
│   │   └── constants.js # Constants used throughout the app
│   ├── App.css         # Main application styles
│   ├── App.jsx         # Main application component
│   ├── index.css       # Global styles
│   └── main.jsx        # Entry point for the React application
├── originalJScode/     # Original JavaScript version (for reference only)
├── .gitignore          # Git ignore file
├── eslint.config.js    # ESLint configuration
├── package.json        # NPM dependencies and scripts
├── vite.config.js      # Vite bundler configuration
└── index.html          # HTML entry point
```

## Key Files and Components

### Core Files (You'll Interact With These)

1. **src/components/Home.jsx**
   - The main landing page component 
   - Contains navigation to game and builder modes

2. **src/components/game/**
   - **Game.jsx**: Main game component that manages game state and user interactions
   - **GameCanvas.jsx**: Renders the interactive game board/grid where puzzles are displayed
   - **WordDisplay.jsx**: Displays the words that players need to find in the puzzle
   - **GameStyles.css**: Styling specific to the game interface

3. **src/components/builder/**
   - **Builder.jsx**: Main builder interface that coordinates all builder components
   - **GridCanvas/**
     - **GridCanvas.jsx**: Interactive grid canvas for puzzle creation and editing
     - **GridCanvas.module.css**: Styling for the grid canvas
   - **Controls/**
     - **ModeControls.jsx**: UI for switching between different editing modes
     - **TouchControls.jsx**: Controls optimized for touch devices
     - **MouseInstructions.jsx**: Instructions for mouse-based interaction
   - **FormFields/**
     - **FormFields.jsx**: Form inputs for configuring puzzle parameters
     - **FormFields.module.css**: Styling for form components

### Important Backend Files

1. **src/hooks/** (Recently Refactored)
   - **useBuilderActions.jsx**: Centralized hook for all builder actions (core functionality)
   - **useMouseKeyboardControls.jsx**: Mouse and keyboard specific interaction logic
   - **useTouchControls.jsx**: Touch device specific interaction logic
   - **useExport.jsx**: Handles exporting puzzles

2. **src/contexts/**
   - **BuilderContext.jsx**: Manages state for the builder mode
   - **GameContext.jsx**: Manages state for the game mode

3. **src/utils/**
   - **config.js**: App configuration
   - **constants.js**: Constant values used throughout the app

4. **src/App.jsx**
   - Sets up routing between different sections of the app
   - Includes orientation handling for mobile devices

5. **Configuration Files**
   - **package.json**: Lists dependencies and scripts
   - **vite.config.js**: Configuration for the Vite bundler
   - **eslint.config.js**: Linting rules

## Recent Updates and Features

### Game Mode Enhancements
- **Dynamic Drawing Speed**: Drawing animation now uses pixel-based speed rather than point-based speed, making longer lines take proportionally longer to draw
- **Hint System**: Implemented a cooldown-based hint system with configurable timing
- **Difficulty Modes**: 
  - Easy mode shows dots where the drawing will appear and provides hints
  - Hard mode hides dots and doesn't offer hints
- **Responsive Word Display**: Words automatically resize to fit available space on all screen sizes
- **Space-Aware Word Handling**: Properly handles multi-word phrases with appropriate spacing
- **Mobile Optimizations**: 
  - Tighter letter spacing and smaller fonts on mobile devices
  - Touch-friendly UI elements
  - Responsive layout that adapts to screen size

### Theme System 
- **Multiple Theme Support**: The app now supports switchable themes (Modern and 8-bit themes included)
- **Theme Persistence**: User's theme preference is saved to localStorage and persists across page refreshes
- **Immediate Theme Application**: Theme is applied before React loads to prevent flash of incorrect theme
- **Cross-Tab Synchronization**: Theme changes in one tab are automatically applied to all open tabs
- **Fallback Mechanism**: Error handling ensures the app defaults to the Modern theme if issues occur

### Menu and Settings Panel
- **Audio Settings**: Controls for toggling audio and adjusting music/SFX volume
- **Theme Selection**: Easy switching between available themes
- **Settings Persistence**: All settings are saved to localStorage

### Game Configuration
- **Centralized Settings**: Game settings like drawing speed, hint cooldown time, and visual preferences are managed in a central config file
- **Customizable Parameters**: Easy modification of game parameters without changing core logic

### Code Architecture Improvements
- **Refactored Action Management**: Separated the core functionality from interface-specific code
- **Centralized Builder Actions**: All builder actions are now in `useBuilderActions.jsx`
- **Dedicated Input Handlers**: Created separate hooks for mouse/keyboard and touch interfaces
- **Better Separation of Concerns**: Core logic is separated from UI controls
- **Enhanced Code Reusability**: Eliminated duplicated logic between interfaces

### Touch Interface Enhancements
- **Improved Touch Detection**: Better touch point detection and feedback
- **Preview Before Placement**: Points in sketch/record mode show a preview before placement
- **Set Point Button**: Points are only placed when the "Set Point" button is pressed
- **Enhanced Visual Feedback**: Clear green circle previews where points will be placed
- **Button Style Improvements**: Fixed touch button styling and interaction states

### Mouse/Keyboard Interface Improvements
- **Double-Click to Cancel**: Added double-click to cancel current line in sketch/record mode
- **Continuous Drawing**: Drawing continues from the last placed point
- **Edit Mode Enhancements**: 
  - Click on a point to select it
  - Drag points to move them
  - Click-and-release to remove points

### General Improvements
- **Responsive Grid**: Grid properly redraws on window resize
- **Enhanced Edit Mode**: Dedicated UI for selecting, moving, and removing points
- **Mode-Specific Controls**: Controls adapt based on current mode (sketch, record, edit, preview)
- **Edge Detection**: Prevents placing points on grid edges with visual feedback
- **Visual Cues**: Clearer highlighting of active and selected elements

## Theme System

### Using Themes
- Access theme settings through the gear icon in the app header
- Choose between Modern (default) and 8-bit themes
- Theme preference is remembered between sessions

### Creating Custom Themes
To create a new theme:

1. **Create a new CSS file** in `src/styles/themes/` (e.g., `mytheme.css`)
2. **Extend the base theme** by following this structure:
   ```css
   /* Import base theme variables */
   @import './themeBase.css';

   /* Override CSS variables */
   :root[data-theme="mytheme"] {
     /* Colors */
     --primary-color: #your-color;
     --secondary-color: #your-color;
     --text-color: #your-color;
     --background-color: #your-color;
     
     /* Typography */
     --font-family: 'Your Font', sans-serif;
     --header-font: 'Your Header Font', serif;
     
     /* UI Elements */
     --button-radius: 4px;
     --panel-radius: 8px;
     
     /* Other custom properties... */
   }
   
   /* Add any additional theme-specific styles */
   ```

3. **Register your theme** in `MenuContext.jsx`:
   - Add your theme to the theme options
   - Update the initial state if needed

4. **Preload your theme** in `index.html` and `main.jsx`:
   ```html
   <link rel="preload" href="/src/styles/themes/mytheme.css" as="style">
   ```

5. **Test thoroughly** across different devices and browsers

### Theme Variables Reference
The following CSS variables can be customized in your theme:

#### Colors
- `--primary-color`: Main brand color
- `--secondary-color`: Secondary accent color
- `--text-color`: Default text color
- `--background-color`: Page background
- `--panel-background`: Background for panels and cards
- `--border-color`: Color for borders and dividers
- `--highlight-color`: Color for highlighted elements
- `--button-color`: Default button background
- `--button-text`: Button text color
- `--button-hover`: Button hover state
- `--error-color`: Color for error states

#### Typography
- `--font-family`: Main font for body text
- `--header-font`: Font for headings
- `--font-size-small`: Size for small text
- `--font-size-normal`: Default text size
- `--font-size-large`: Size for large text
- `--font-size-xlarge`: Size for extra large text

#### Layout & UI
- `--spacing-small`: Small spacing unit
- `--spacing-medium`: Medium spacing unit
- `--spacing-large`: Large spacing unit
- `--button-radius`: Border radius for buttons
- `--panel-radius`: Border radius for panels
- `--shadow-default`: Default shadow for elements
- `--transition-default`: Default transition timing

See the existing themes (`modern.css` and `8bit.css`) for examples of implementation.

## How Components Work Together

1. **Application Flow**:
   - **main.jsx** initializes the React app
   - **App.jsx** sets up routes and basic structure
   - Routes direct to **Home**, **Game**, or **Builder** components

2. **Game Mode**:
   - **GameContext** provides state management
   - **Game.jsx** is the main container
   - **GameCanvas.jsx** renders the actual puzzle grid
   - **WordDisplay.jsx** shows words to find
   - **useTimer.js** tracks game time

3. **Builder Mode**:
   - **BuilderContext** provides state management
   - **Builder.jsx** is the main container
   - **GridCanvas.jsx** handles drawing and rendering the grid
   - **useBuilderActions.jsx** provides core functionality
   - **useMouseKeyboardControls.jsx** and **useTouchControls.jsx** handle user input
   - **Controls/** components provide UI elements
   - **FormFields/** allow configuring puzzle parameters

4. **Responsive Design**:
   - **OrientationHandler.jsx** detects device orientation
   - **RotationOverlay.jsx** shows a message when device is in wrong orientation
   - CSS files handle responsive styling

## Getting Started

1. **Development**:
   ```
   npm run dev
   ```

2. **Development with Tailscale (Remote Access)**:
   ```
   npm run dev -- --host
   ```
   This will make the Vite server accessible via your Tailscale IP address.
   
   For direct access with a specific Tailscale IP:
   ```
   npm run dev -- --host 100.70.95.45
   ```
   The server will be accessible at http://100.70.95.45:5173 (default port is 5173).

3. **Build for Production**:
   ```
   npm run build
   ```

4. **Preview Production Build**:
   ```
   npm run preview
   ```

5. **Preview Production Build with Tailscale (Remote Access)**:
   ```
   npm run preview -- --host
   ```
   
   For direct access with a specific Tailscale IP:
   ```
   npm run preview -- --host 100.70.95.45
   ```
   The preview server will be accessible at http://100.70.95.45:4173 (default preview port is 4173).

## Technologies Used

- React 19
- React Router
- Styled Components
- Custom React Hooks
- Vite (for bundling and development server)

## Builder Mode Workflow

### Desktop (Mouse/Keyboard) Interface
1. **Sketch Mode**: 
   - Click on grid points to place dots
   - Click on an existing dot to connect lines
   - Double-click to cancel the current line
   - Drawing continues from the last placed point

2. **Edit Mode**:
   - Click on a dot to select it
   - Click and hold to drag dots to new positions
   - Quick click on a dot to delete it

3. **Record Mode**:
   - Create a recording path by placing dots
   - Use sketch as a reference (shown with reduced opacity)
   - Double-click to cancel the current line

4. **Preview Mode**:
   - View the final product without editing controls

### Touch Interface (Mobile/Tablet)
1. **Sketch Mode**:
   - Tap or drag to see a preview point (green circle)
   - Press "Set Point" button to place a dot
   - Press "Cancel Point" to cancel the current line

2. **Edit Mode**:
   - Tap on a dot to select it
   - Press "Remove Point" to delete the selected dot

3. **Record Mode**:
   - Similar to sketch mode but creates a recording path
   - Press "Set Point" to place dots
   - Press "Cancel Point" to cancel the current line

4. **Preview Mode**:
   - View the final product without editing controls

## Game Mode Workflow

### Game Start
1. **Category Selection**:
   - User selects a category from the home screen
   - Category data is loaded from corresponding JSON file
   - Game screen is prepared with the selected category background color

2. **Game Ready State**:
   - Drawing area shows a blank canvas (dots visible only in easy mode)
   - Word spaces are shown as empty placeholders
   - Begin button is displayed and ready for user interaction

### Active Gameplay
1. **Begin Button Pressed**:
   - Timer starts counting in hundredths of seconds
   - Drawing animation begins at consistent pixel-based speed
   - Word spaces are revealed with cursor at the first letter
   - Begin button changes to Guess button
   - Hint button appears (in easy mode only) with initial cooldown

2. **Drawing Animation**:
   - Drawing appears line by line with consistent speed
   - Longer lines take proportionally longer to draw than shorter lines
   - Animation speed is controlled by the PIXELS_PER_SECOND config setting

3. **Hint System**:
   - In easy mode, the hint button can be used to reveal letters
   - After using a hint, the button enters cooldown state for 5 seconds
   - Each hint reveals the next letter in the word

4. **Guessing**:
   - Player can attempt to guess the word anytime by pressing the Guess button
   - Correct guesses advance the player to the next puzzle
   - Incorrect guesses display a "WRONG" message

### Difficulty Levels
1. **Easy Mode**:
   - Dots are visible showing the drawing path
   - Hint button is available with cooldown
   - First few letters can be revealed as hints

2. **Hard Mode**:
   - No dots are visible
   - No hint button is available
   - Player must rely solely on the drawing animation

## Notes for Non-Programmers

- Focus on content within the **src/components/** directory if you need to make UI changes
- Most game logic is in the **contexts/** and **hooks/** directories
- CSS files control the styling and appearance
- Configuration files like **package.json** and build files should generally not be modified unless adding new dependencies
- The **originalJScode/** directory contains the original JavaScript version of the application and is kept for reference only - all active development should happen in the **src/** directory
- The **_temp/** folder contains temporary code that wasn't originally made for our React program but is being stored for potential implementation into this project 

## Component-Specific Troubleshooting Guide

### Home Component
- **Key Files**: 
  - `src/components/Home.jsx` - Main component
  - `src/App.jsx` - Contains routing configuration
- **Common Issues**:
  - Navigation problems typically involve React Router in App.jsx
  - Styling issues are in both Home.jsx and App.css
  - If buttons don't work, check the event handlers in Home.jsx

### Game Component
- **Key Files**:
  - `src/components/game/Game.jsx` - Main container
  - `src/components/game/GameCanvas.jsx` - The game board/grid
  - `src/components/game/WordDisplay.jsx` - Word display
  - `src/contexts/GameContext.jsx` - State management
  - `src/hooks/useTimer.js` - Timer functionality
- **Common Issues**:
  - Game logic bugs are typically in GameContext.jsx
  - Visual/rendering issues are usually in GameCanvas.jsx
  - Performance problems often relate to inefficient rendering in GameCanvas.jsx
  - Word display issues are in WordDisplay.jsx
  - Timer problems are in useTimer.js

### Builder Component
- **Key Files**:
  - `src/components/builder/Builder.jsx` - Main container
  - `src/components/builder/GridCanvas/GridCanvas.jsx` - Interactive grid editor
  - `src/components/builder/Controls/ModeControls.jsx` - Editing mode controls
  - `src/components/builder/Controls/TouchControls.jsx` - Touch-specific controls
  - `src/contexts/BuilderContext.jsx` - State management
  - `src/hooks/useBuilderActions.jsx` - Centralized builder actions
  - `src/hooks/useMouseKeyboardControls.jsx` - Mouse/keyboard controls
  - `src/hooks/useTouchControls.jsx` - Touch controls
- **Common Issues**:
  - Grid rendering issues are in GridCanvas.jsx
  - Logic issues are in useBuilderActions.jsx
  - Mouse/keyboard issues are in useMouseKeyboardControls.jsx
  - Touch interface issues are in useTouchControls.jsx and TouchControls.jsx
  - State management bugs are in BuilderContext.jsx

### Shared Components
- `src/components/OrientationHandler.jsx` and `RotationOverlay.jsx` affect all screens on mobile
- CSS files may impact multiple components:
  - App.css affects the entire application
  - Component-specific CSS only affects their respective components

When debugging an issue, focus first on the component where the issue is visible, then check its state management in the relevant context file, and finally look at any shared services (hooks) it uses. 

## State Management and Data Flow

This application uses React's Context API for state management instead of Redux or other state libraries. Here's how data flows through the application:

### Builder Mode State Flow
1. **BuilderContext.jsx** - Contains all state for the builder
2. **useBuilderActions.jsx** - Provides functions that modify the state
3. **Interface-specific hooks** - Handle user input and call appropriate actions
4. **UI Components** - Display state and capture user interactions

### Game Mode State Flow
1. **GameContext.jsx** - Contains all state for the game
2. **Game.jsx** and child components - Display state and handle interactions
3. **useTimer.js** - Manages timer functionality

## Quick Reference: What to Tell the AI

When starting a new AI session for different components, here are the key files to tell the AI to focus on:

### For Home Page Work
```
Please focus on these files:
- src/components/Home.jsx
- src/App.jsx 
- src/App.css
```

### For Game Component Work
```
Please focus on these files:
- src/components/game/Game.jsx
- src/components/game/DrawingCanvas.jsx 
- src/components/game/WordSpaces.jsx
- src/contexts/GameContext.jsx
- src/utils/config.js
```

### For Builder Component Work
```
Please focus on these files:
- src/components/builder/Builder.jsx
- src/components/builder/GridCanvas/GridCanvas.jsx
- src/components/builder/Controls/ModeControls.jsx
- src/components/builder/Controls/TouchControls.jsx
- src/contexts/BuilderContext.jsx
- src/hooks/useBuilderActions.jsx
- src/hooks/useMouseKeyboardControls.jsx
- src/hooks/useTouchControls.jsx
```

### For Specific Builder Features
- **Core Logic**: Focus on useBuilderActions.jsx and BuilderContext.jsx
- **Mouse/Keyboard Interface**: Focus on useMouseKeyboardControls.jsx
- **Touch Interface**: Focus on useTouchControls.jsx and TouchControls.jsx
- **Grid Canvas**: Focus on GridCanvas.jsx
- **UI Controls**: Focus on the specific Control components
- **Export Functionality**: Focus on useExport.jsx

Copy-paste the appropriate block above when starting a new AI session to quickly get the AI focused on the right files.

# Game Component Configuration

### Key Configuration Files
- **src/utils/config.js**: Contains all game parameters including:
  - PIXELS_PER_SECOND: Controls drawing animation speed
  - HINT_COOLDOWN_TIME: Time between hint availability
  - DOT_RADIUS: Size of dots in easy mode
  - LINE_WIDTH: Thickness of drawing lines
  - Other timing and visual parameters

### JSON Format for Game Items
Game items are stored in JSON files (e.g., `src/assets/items/yellow.json`):
```json
{
  "name": "ITEM NAME",
  "categoryName": "Category",
  "dots": [
    { "x": 0, "y": 0 },
    { "x": 100, "y": 100 },
    // Additional dots...
  ],
  "sequence": [
    { "from": 0, "to": 1 },
    // Additional line segments...
  ]
}
```
- **name**: The word or phrase to guess (displayed in word spaces)
- **categoryName**: Category label displayed at the top of the game
- **dots**: Array of point coordinates for the drawing
- **sequence**: Drawing order, connecting dots by their indices

## Quick Reference: What to Tell the AI

When starting a new AI session for different components, here are the key files to tell the AI to focus on:

### For Home Page Work
```
Please focus on these files:
- src/components/Home.jsx
- src/App.jsx 
- src/App.css
```

### For Game Component Work
```
Please focus on these files:
- src/components/game/Game.jsx
- src/components/game/DrawingCanvas.jsx 
- src/components/game/WordSpaces.jsx
- src/contexts/GameContext.jsx
- src/utils/config.js
```

### For Builder Component Work
```
Please focus on these files:
- src/components/builder/Builder.jsx
- src/components/builder/GridCanvas/GridCanvas.jsx
- src/components/builder/Controls/ModeControls.jsx
- src/components/builder/Controls/TouchControls.jsx
- src/contexts/BuilderContext.jsx
- src/hooks/useBuilderActions.jsx
- src/hooks/useMouseKeyboardControls.jsx
- src/hooks/useTouchControls.jsx
```

### For Specific Builder Features
- **Core Logic**: Focus on useBuilderActions.jsx and BuilderContext.jsx
- **Mouse/Keyboard Interface**: Focus on useMouseKeyboardControls.jsx
- **Touch Interface**: Focus on useTouchControls.jsx and TouchControls.jsx
- **Grid Canvas**: Focus on GridCanvas.jsx
- **UI Controls**: Focus on the specific Control components
- **Export Functionality**: Focus on useExport.jsx

Copy-paste the appropriate block above when starting a new AI session to quickly get the AI focused on the right files.