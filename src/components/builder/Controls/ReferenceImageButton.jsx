import React, { useRef } from 'react';
import { useBuilderContext } from '../../../contexts/BuilderContext';
import styles from './ReferenceImageButton.module.css';

const ReferenceImageButton = () => {
  const { state, dispatch } = useBuilderContext();
  const fileInputRef = useRef(null);

  const handleImageSelect = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        dispatch({
          type: 'SET_REFERENCE_IMAGE',
          src: e.target.result,
          isVisible: true,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleToggleImage = () => {
    if (state.referenceImage.src) {
      dispatch({ type: 'TOGGLE_REFERENCE_IMAGE' });
    } else {
      fileInputRef.current?.click();
    }
  };

  const handleClearImage = () => {
    dispatch({ type: 'CLEAR_REFERENCE_IMAGE' });
  };

  return (
    <div className={styles.container}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageSelect}
        style={{ display: 'none' }}
      />
      
      <button
        className={`${styles.button} ${state.referenceImage.isVisible ? styles.active : ''}`}
        onClick={handleToggleImage}
        title={state.referenceImage.src ? 'Toggle reference image' : 'Add reference image'}
      >
        {state.referenceImage.src ? '👁️' : '📷'}
      </button>
      
      {state.referenceImage.src && (
        <button
          className={styles.clearButton}
          onClick={handleClearImage}
          title="Clear reference image"
        >
          ✕
        </button>
      )}
    </div>
  );
};

export default ReferenceImageButton; 