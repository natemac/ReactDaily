import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { BuilderProvider } from '../../contexts/BuilderContext';
import GridCanvas from './GridCanvas/GridCanvas';
import ModeControls from './Controls/ModeControls';
import TouchControls from './Controls/TouchControls';
import MouseInstructions from './Controls/MouseInstructions';
import FormFields from './FormFields/FormFields';
import PreviewModal from './PreviewModal/PreviewModal';
import ShareModal from './ShareModal/ShareModal';
import useExport from '../../hooks/useExport';
import './Builder.css';

const BuilderContent = () => {
  const { exportToFile } = useExport();
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  
  const openShareModal = () => {
    setIsShareModalOpen(true);
  };
  
  const closeShareModal = () => {
    setIsShareModalOpen(false);
  };
  
  return (
    <div className="builder-container">
      <h1 className="builder-title">Build Your Own Drawing</h1>
      
      <div className="builder-content">
        <ModeControls />
        
        <div className="grid-wrapper">
          <GridCanvas />
        </div>
        
        <MouseInstructions />
        <TouchControls />
        
        <FormFields />
        
        <div className="buttons-container">
          <button className="share-puzzle-btn" onClick={openShareModal}>
            Share Puzzle
          </button>
          
          <Link to="/" className="back-to-game-btn">
            Back to Game
          </Link>
        </div>
      </div>
      
      <PreviewModal />
      <ShareModal isOpen={isShareModalOpen} onClose={closeShareModal} />
    </div>
  );
};

const MemoizedBuilderContent = React.memo(BuilderContent);

const Builder = () => {
  return (
    <BuilderProvider>
      <MemoizedBuilderContent />
    </BuilderProvider>
  );
};

export default Builder; 