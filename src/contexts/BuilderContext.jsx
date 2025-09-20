import React, { createContext, useContext, useReducer } from 'react';
import { GRID_SIZE, DOT_RADIUS, MIN_DRAW_GRID, MAX_DRAW_GRID } from '../utils/constants';

// Initial state
const initialState = {
  mode: 'sketch', // 'sketch', 'edit', 'record', 'preview'
  
  // Grid and canvas state
  gridPointSize: 0,
  hoveredGridPoint: null,
  
  // Drag state
  isDragging: false,
  draggedDotIndex: null,
  dragStartTime: null,
  
  // Sketch data
  sketch: {
    dots: [], // Array of {x, y, gridX, gridY} objects
    lines: [], // Array of {from, to} objects
    selectedDot: null, // Index of selected dot
    pendingPoint: null, // Index of dot that's currently being connected
  },
  
  // Recording data
  recording: {
    isRecording: false,
    isPlaying: false,
    dots: [], // Array of {x, y, gridX, gridY} objects
    lines: [], // Array of {from, to} objects
    sequence: [], // Array of {from, to} objects in the order they should be drawn
  },
  
  // Touch state
  isTouch: false,
  touch: {
    lastTouchX: 0,
    lastTouchY: 0,
  },
  
  // Form data
  form: {
    itemName: '',
    categoryName: '',
  },
  
  // Reference image for tracing
  referenceImage: {
    src: null,
    isVisible: false,
  },
};

// Reducer function
function builderReducer(state, action) {
  switch (action.type) {
    case 'SET_MODE':
      return {
        ...state,
        mode: action.mode,
      };
      
    case 'SET_GRID_POINT_SIZE':
      return {
        ...state,
        gridPointSize: action.size,
      };
      
    case 'SET_HOVERED_GRID_POINT':
      return {
        ...state,
        hoveredGridPoint: action.point,
      };
      
    case 'ADD_DOT':
      return {
        ...state,
        sketch: {
          ...state.sketch,
          dots: [...state.sketch.dots, action.dot],
        },
      };
      
    case 'REMOVE_DOT':
      // Remove dot and any connected lines
      const newDots = state.sketch.dots.filter((_, index) => index !== action.index);
      const newLines = state.sketch.lines.filter(
        line => line.from !== action.index && line.to !== action.index
      );
      
      // Update indices in lines
      const updatedLines = newLines.map(line => ({
        from: line.from > action.index ? line.from - 1 : line.from,
        to: line.to > action.index ? line.to - 1 : line.to,
      }));
      
      return {
        ...state,
        sketch: {
          ...state.sketch,
          dots: newDots,
          lines: updatedLines,
          selectedDot: null,
          pendingPoint: null,
        },
      };
      
    case 'ADD_LINE':
      return {
        ...state,
        sketch: {
          ...state.sketch,
          lines: [...state.sketch.lines, action.line],
        },
      };
      
    case 'SET_SELECTED_DOT':
      return {
        ...state,
        sketch: {
          ...state.sketch,
          selectedDot: action.index,
        },
      };
      
    case 'SET_PENDING_POINT':
      return {
        ...state,
        sketch: {
          ...state.sketch,
          pendingPoint: action.index,
        },
      };
      
    case 'SET_RECORDING_STATE':
      return {
        ...state,
        recording: {
          ...state.recording,
          isRecording: action.isRecording,
        },
      };
      
    case 'SET_PLAYING_STATE':
      return {
        ...state,
        recording: {
          ...state.recording,
          isPlaying: action.isPlaying,
        },
      };
      
    case 'ADD_RECORDING_DOT':
      return {
        ...state,
        recording: {
          ...state.recording,
          dots: [...state.recording.dots, action.dot],
        },
      };
      
    case 'ADD_RECORDING_LINE':
      return {
        ...state,
        recording: {
          ...state.recording,
          lines: [...state.recording.lines, action.line],
        },
      };
      
    case 'ADD_TO_SEQUENCE':
      return {
        ...state,
        recording: {
          ...state.recording,
          sequence: [...state.recording.sequence, action.line],
        },
      };
      
    case 'RESET_RECORDING':
      return {
        ...state,
        recording: {
          ...state.recording,
          dots: [],
          lines: [],
          sequence: [],
          isRecording: false,
          isPlaying: false,
        },
      };
      
    case 'SET_TOUCH_INFO':
      return {
        ...state,
        isTouch: action.isTouch || state.isTouch,
        touch: {
          ...state.touch,
          ...action.touch,
        },
      };
      
    case 'UPDATE_FORM':
      return {
        ...state,
        form: {
          ...state.form,
          ...action.form,
        },
      };
      
    case 'SET_DRAGGING':
      return {
        ...state,
        isDragging: action.isDragging,
        draggedDotIndex: action.dotIndex,
        dragStartTime: action.startTime || null,
      };
      
    case 'UPDATE_DOT_POSITION':
      const updatedDots = [...state.sketch.dots];
      updatedDots[action.index] = {
        ...updatedDots[action.index],
        x: action.x,
        y: action.y,
        gridX: action.gridX,
        gridY: action.gridY,
      };
      
      return {
        ...state,
        sketch: {
          ...state.sketch,
          dots: updatedDots,
        },
      };
      
    case 'SET_REFERENCE_IMAGE':
      return {
        ...state,
        referenceImage: {
          ...state.referenceImage,
          src: action.src,
          isVisible: action.isVisible !== undefined ? action.isVisible : true,
        },
      };
      
    case 'TOGGLE_REFERENCE_IMAGE':
      return {
        ...state,
        referenceImage: {
          ...state.referenceImage,
          isVisible: !state.referenceImage.isVisible,
        },
      };
      
    case 'CLEAR_REFERENCE_IMAGE':
      return {
        ...state,
        referenceImage: {
          src: null,
          isVisible: false,
        },
      };
      
    default:
      return state;
  }
}

// Create context
const BuilderContext = createContext();

// Provider component
export const BuilderProvider = ({ children }) => {
  const [state, dispatch] = useReducer(builderReducer, initialState);
  
  return (
    <BuilderContext.Provider value={{ state, dispatch }}>
      {children}
    </BuilderContext.Provider>
  );
};

// Custom hook to use the builder context
export const useBuilderContext = () => {
  const context = useContext(BuilderContext);
  
  if (!context) {
    throw new Error('useBuilderContext must be used within a BuilderProvider');
  }
  
  return context;
}; 