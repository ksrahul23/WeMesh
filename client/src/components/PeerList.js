import React from 'react';

const PeerList = ({ peers, userNames, myId, onSendFile, hasFile }) => {
  const getInitials = (name) => {
    if (!name) return '??';
    const parts = name.split(/(?=[A-Z])/); // Split game names by capital letters
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  const myName = userNames[myId] || 'You';

  return (
    <div className="card">
      <div className="section-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>Network Peers</span>
        <span style={{ background: 'var(--bg-inset)', padding: '2px 8px', borderRadius: '10px', fontSize: '10px' }}>
          {peers.length + 1} Online
        </span>
      </div>
      
      <div className="peer-list-container">
        <div className="peer-card" style={{ borderLeft: '3px solid var(--accent)', background: 'var(--bg-inset)' }}>
          <div className="peer-avatar">
            {getInitials(myName)}
            <span className="peer-avatar-status"></span>
          </div>
          <div className="peer-info">
            <div className="peer-name" title={myName}>{myName}</div>
            <div className="peer-status-text">You</div>
          </div>
          <div className="peer-send-btn">
          </div>
        </div>

        {peers.length === 0 ? (
          <div className="peers-empty" style={{ marginTop: '16px' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
            <p>Waiting for peers to join...</p>
          </div>
        ) : (
          peers.map((peerId) => {
            const userName = userNames[peerId] || 'Unknown';
            return (
              <div key={peerId} className="peer-card">
                <div className="peer-avatar">
                  {getInitials(userName)}
                  <span className="peer-avatar-status"></span>
                </div>
                <div className="peer-info">
                  <div className="peer-name" title={userName}>{userName}</div>
                  <div className="peer-status-text">Connected</div>
                </div>
                <div className="peer-send-btn">
                  <button 
                    className="btn btn-secondary btn-icon btn-sm" 
                    onClick={() => onSendFile(peerId)}
                    disabled={!hasFile}
                    title={hasFile ? `Send file to ${userName}` : 'Stage a file first to send'}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="22" y1="2" x2="11" y2="13"></line>
                      <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                    </svg>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default PeerList;