import React, { useState } from 'react';
import { formatBytes, getFileCategory, getFileExtension } from '../hooks/useWebRTC';
import ProgressBar from './ProgressBar';

const TransferDashboard = ({ webRTC }) => {
  const { 
    outgoingQueue, 
    removeFromQueue, 
    sendFile, 
    incomingTransfers,
    peers,
    userNames
  } = webRTC;

  // Local state for selecting target peer in the queue
  const [selectedPeers, setSelectedPeers] = useState({});

  const handlePeerSelect = (queueId, peerId) => {
    setSelectedPeers(prev => ({ ...prev, [queueId]: peerId }));
  };

  const formatSpeed = (bytesPerSec) => {
    if (!bytesPerSec || isNaN(bytesPerSec)) return '0 KB/s';
    if (bytesPerSec < 1024) return `${bytesPerSec.toFixed(1)} B/s`;
    if (bytesPerSec < 1024 * 1024) return `${(bytesPerSec / 1024).toFixed(1)} KB/s`;
    return `${(bytesPerSec / (1024 * 1024)).toFixed(1)} MB/s`;
  };

  const connectedPeerList = Object.keys(peers).filter(id => peers[id].connected);

  return (
    <div className="transfer-dashboard">
      {/* ─── Outgoing Queue ─── */}
      <div className="transfer-section">
        <div className="section-label">Outgoing Staging Queue</div>
        
        {outgoingQueue.length === 0 ? (
          <div className="transfer-empty">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="12" y1="8" x2="12" y2="16"></line>
              <line x1="8" y1="12" x2="16" y2="12"></line>
            </svg>
            <p>No files staged for sending.</p>
            <p style={{ fontSize: 'var(--text-xs)', marginTop: '4px' }}>Go to the Mesh Room to select files.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
            {outgoingQueue.map(item => {
              const category = getFileCategory(item.file.name);
              const ext = getFileExtension(item.file.name);
              const isSent = item.status === 'sent';
              const isSending = item.status === 'sending';
              const targetPeerId = selectedPeers[item.id] || connectedPeerList[0] || '';

              return (
                <div key={item.id} className="transfer-card">
                  <div className={`transfer-file-icon type-${category}`}>
                    {ext || '?'}
                  </div>
                  <div className="transfer-file-info">
                    <div className="transfer-file-name" title={item.file.name}>{item.file.name}</div>
                    <div className="transfer-file-meta">
                      <span className="transfer-badge">{formatBytes(item.file.size)}</span>
                      <span className={`transfer-status ${item.status}`}>
                        {item.status === 'staged' ? 'Staged' : item.status === 'sending' ? 'Sending...' : 'Sent ✓'}
                      </span>
                    </div>

                    {!isSent && !isSending && connectedPeerList.length > 0 && (
                      <div style={{ marginTop: 'var(--spacing-md)' }}>
                        <select 
                          className="select" 
                          style={{ minHeight: '32px', padding: '4px 28px 4px 8px', fontSize: 'var(--text-xs)' }}
                          value={targetPeerId}
                          onChange={(e) => handlePeerSelect(item.id, e.target.value)}
                        >
                          {connectedPeerList.map(pid => (
                            <option key={pid} value={pid}>Send to: {userNames[pid] || 'Unknown'}</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                  <div className="transfer-actions">
                    {!isSent && !isSending && (
                      <>
                        <button 
                          className="btn btn-primary btn-sm"
                          disabled={!targetPeerId}
                          onClick={() => sendFile(targetPeerId, item.id)}
                        >
                          Send
                        </button>
                        <button 
                          className="btn btn-ghost btn-sm"
                          onClick={() => removeFromQueue(item.id)}
                          title="Remove from queue"
                        >
                          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>
                          </svg>
                        </button>
                      </>
                    )}
                    {isSent && (
                      <button 
                        className="btn btn-ghost btn-sm"
                        onClick={() => removeFromQueue(item.id)}
                        title="Clear"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ─── Incoming Transfers ─── */}
      <div className="transfer-section">
        <div className="section-label">Incoming Transfers</div>

        {incomingTransfers.length === 0 ? (
          <div className="transfer-empty">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            <p>No incoming files.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
            {incomingTransfers.map((transfer, idx) => {
              const category = getFileCategory(transfer.fileName);
              const ext = getFileExtension(transfer.fileName);
              const progressPct = transfer.fileSize > 0 ? (transfer.bytesReceived / transfer.fileSize) * 100 : 0;
              const isComplete = transfer.status === 'complete';
              
              return (
                <div key={`${transfer.peerId}-${idx}`} className="transfer-card">
                  <div className={`transfer-file-icon type-${category}`}>
                    {ext || '?'}
                  </div>
                  <div className="transfer-file-info">
                    <div className="transfer-file-name" title={transfer.fileName}>{transfer.fileName}</div>
                    
                    <div className="transfer-file-meta" style={{ marginBottom: 'var(--spacing-sm)' }}>
                      <span className="transfer-badge">From: {userNames[transfer.peerId] || 'Unknown'}</span>
                      <span className={`transfer-status ${transfer.status}`}>
                        {transfer.status === 'pending' ? 'Waiting Approval' : 
                         transfer.status === 'downloading' ? 'Downloading...' : 'Complete ✓'}
                      </span>
                    </div>

                    {!isComplete && transfer.status === 'downloading' && (
                      <div className="transfer-progress-area">
                        <ProgressBar progress={progressPct} />
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div className="transfer-speed">{formatBytes(transfer.bytesReceived)} / {formatBytes(transfer.fileSize)}</div>
                          <div className="transfer-speed" style={{ color: 'var(--accent)' }}>{formatSpeed(transfer.speed)}</div>
                        </div>
                      </div>
                    )}
                    
                    {isComplete && (
                      <div className="transfer-speed" style={{ color: 'var(--success)' }}>
                        Saved to your device ({formatBytes(transfer.fileSize)})
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default TransferDashboard;
