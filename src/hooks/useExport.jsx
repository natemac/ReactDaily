import { useCallback } from 'react';
import { useBuilderContext } from '../contexts/BuilderContext';

const useExport = () => {
  const { state } = useBuilderContext();
  
  // Validate recording data
  const validateRecording = useCallback(() => {
    const { recording, form } = state;
    
    if (recording.dots.length < 2) {
      alert('Please create at least 2 points in the recording.');
      return false;
    }
    
    if (recording.sequence.length === 0) {
      alert('Please record a drawing sequence.');
      return false;
    }
    
    if (!form.itemName.trim()) {
      alert('Please enter a name for the item.');
      return false;
    }
    
    if (!form.categoryName.trim()) {
      alert('Please enter a category name.');
      return false;
    }
    
    return true;
  }, [state.recording, state.form]);
  
  // Get recording data for export
  const getExportData = useCallback(() => {
    const { recording, form } = state;
    
    // Collect only dots used in the recording sequence
    const usedDotIndices = new Set();
    recording.sequence.forEach(line => {
      usedDotIndices.add(line.from);
      usedDotIndices.add(line.to);
    });
    
    // Create a map from old indices to new indices
    const indexMap = {};
    const usedDots = [];
    
    // Add only the used dots to the exported data
    Array.from(usedDotIndices).sort((a, b) => a - b).forEach((oldIndex, newIndex) => {
      indexMap[oldIndex] = newIndex;
      
      const dot = recording.dots[oldIndex];
      if (dot) {
        usedDots.push({
          x: dot.x,
          y: dot.y
        });
      }
    });
    
    // Remap the line indices
    const remappedSequence = recording.sequence.map(line => ({
      from: indexMap[line.from],
      to: indexMap[line.to]
    }));
    
    // Get the category name or use a default if not provided
    const categoryNameValue = form.categoryName.trim() || 'Miscellaneous';
    
    // Return clean data for export in the required format
    return {
      name: form.itemName.trim().toUpperCase(),
      categoryName: categoryNameValue,
      dots: usedDots,
      sequence: remappedSequence,
    };
  }, [state.recording, state.form]);
  
  // Import drawing data from JSON
  const importDrawingData = useCallback((jsonData) => {
    try {
      // Parse JSON if it's a string
      const data = typeof jsonData === 'string' 
        ? JSON.parse(jsonData) 
        : jsonData;
      
      if (!data || !data.dots || !data.sequence) {
        throw new Error('Invalid data format');
      }
      
      // Import functionality would be implemented here
      // This would dispatch actions to update the state with the imported data
      
      return true;
    } catch (error) {
      console.error('Error importing drawing data:', error);
      alert(`Failed to import drawing: ${error.message}`);
      return false;
    }
  }, []);
  
  // Export to file
  const exportToFile = useCallback(() => {
    if (!validateRecording()) {
      return;
    }
    
    const data = getExportData();
    const jsonString = JSON.stringify(data, null, 2);
    
    // Create a blob and download link
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    // Create a filename based on the item name
    const filename = (data.name.toLowerCase().replace(/\s+/g, '_') || 'drawing') + '.json';
    
    // Trigger download
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    URL.revokeObjectURL(url);
    
    alert('Drawing exported successfully!');
  }, [validateRecording, getExportData]);
  
  return {
    validateRecording,
    getExportData,
    importDrawingData,
    exportToFile
  };
};

export default useExport; 