import React from 'react';

const ProgressBar = ({ progress, label }) => {
  const safeProgress = Math.max(0, Math.min(100, progress || 0));
  
  return (
    <div style={{ width: '100%' }}>
      <div className="progress-track">
        <div 
          className="progress-fill" 
          style={{ width: `${safeProgress}%` }}
        ></div>
      </div>
      {(label || safeProgress > 0) && (
        <div className="progress-label">
          {label ? label : `${safeProgress.toFixed(0)}%`}
        </div>
      )}
    </div>
  );
};

export default ProgressBar;
