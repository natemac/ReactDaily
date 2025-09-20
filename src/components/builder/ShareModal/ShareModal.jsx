import React, { useState, useEffect } from 'react';
import { useBuilderContext } from '../../../contexts/BuilderContext';
import useExport from '../../../hooks/useExport';
import './ShareModal.css';

const ShareModal = ({ isOpen, onClose }) => {
  const { state, dispatch } = useBuilderContext();
  const { exportToFile } = useExport();
  const { form } = state;
  
  // Close modal if escape key is pressed
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleEscape);
    return () => {
      window.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);
  
  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    dispatch({
      type: 'UPDATE_FORM',
      form: { [name]: value }
    });
  };
  
  // Handle share with friends button
  const handleShareWithFriends = () => {
    if (!form.itemName || !form.categoryName) {
      alert('Please complete the Drawing Name and Category fields.');
      return;
    }
    
    alert('Sharing functionality will be implemented in a future update.');
  };
  
  // Handle submit puzzle button
  const handleSubmitPuzzle = () => {
    if (!form.itemName || !form.categoryName) {
      alert('Please complete the Drawing Name and Category fields.');
      return;
    }
    
    alert('Puzzle submission will be implemented in a future update.');
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="share-overlay">
      <div className="share-modal">
        <div className="share-modal-header">
          <h2>Share Your Puzzle</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <div className="share-modal-body">
          <div className="form-section">
            <label htmlFor="itemName">Drawing Name</label>
            <input
              type="text"
              id="itemName"
              name="itemName"
              value={form.itemName}
              onChange={handleInputChange}
              placeholder="Enter the name of the item"
            />
          </div>
          
          <div className="form-section">
            <label htmlFor="categoryName">Category</label>
            <input
              type="text"
              id="categoryName"
              name="categoryName"
              value={form.categoryName}
              onChange={handleInputChange}
              placeholder="Enter a category name"
            />
          </div>
          
          <button 
            className="share-button"
            onClick={handleShareWithFriends}
          >
            Share with Friends
          </button>
          
          <div className="form-divider"></div>
          
          <button 
            className="submit-button"
            onClick={handleSubmitPuzzle}
          >
            Submit your Puzzle
          </button>
          
          <button 
            className="export-button"
            onClick={exportToFile}
          >
            Export Drawing Data
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShareModal; 