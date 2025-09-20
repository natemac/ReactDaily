import React from 'react';
import { useBuilderContext } from '../../../contexts/BuilderContext';
import styles from './FormFields.module.css';

const FormFields = () => {
  const { state, dispatch } = useBuilderContext();
  
  // We're keeping this component for potential future form needs
  // Form fields were moved to the ShareModal
  
  return (
    <div className={styles.formFields}>
      {/* Divider is kept for spacing */}
      
      
      {/* Form fields moved to ShareModal */}
    </div>
  );
};

export default FormFields; 