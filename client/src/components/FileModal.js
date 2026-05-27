import React from 'react';
import { formatBytes, getFileCategory, getFileExtension } from '../hooks/useWebRTC';

const FileModal = ({ file, onAccept, onReject }) => {
  const fileCategory = getFileCategory(file.name);
  const fileExtension = getFileExtension(file.name);

  return (
    <div className="modal-overlay">
      <div className="modal-dialog">
        <div className="modal-header">
          <h3>Incoming File</h3>
          <button className="modal-close" onClick={onReject}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div className="modal-body">
          <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--spacing-lg)' }}>
            A peer wants to send you a file directly. Do you want to accept this transfer?
          </p>

          <div className="file-request-info">
            <div className={`file-request-icon type-${fileCategory}`}>
              {fileExtension || '?'}
            </div>
            <div className="file-request-meta">
              <div className="file-request-name" title={file.name}>{file.name}</div>
              <div className="file-request-details">
                <span className="file-request-size">{formatBytes(file.size)}</span>
                <span className="file-request-type">{fileCategory}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onReject}>
            Decline
          </button>
          <button className="btn btn-primary" onClick={onAccept}>
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            Accept File
          </button>
        </div>
      </div>
    </div>
  );
};

export default FileModal;
