import FileModal from './components/FileModal';
import PeerList from './components/PeerList';
import ProgressBar from './components/ProgressBar';
import ChatBox from './components/ChatBox';
import Notifications from './components/Notifications';

const Room = ({ webRTC }) => {
  const {
    isSocketConnected,
    roomId,
    setRoomId,
    currentRoom,
    joinRoom,
    handleCreateRoom,
    handleExitRoom,
    showCreateRoomModal,
    setShowCreateRoomModal,
    maxRoomSize,
    setMaxRoomSize,
    connectedPeerIds,
    userNames,
    file,
    sendFile,
    receivedFiles,
    progress,
    showModal,
    handleAccept,
    handleReject,
    fileInputRef,
    handleFileChange,
    chatMessages,
    sendChatMessage,
    notification
  } = webRTC;

  if (!currentRoom) {
    return (
      <div className="welcome-state" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', textAlign: 'center', padding: 'var(--spacing-3xl)' }}>
        <h2 style={{ marginBottom: '16px' }}>Join the Mesh</h2>
        <p>Connect directly to another device to share files securely and chat privately. No data passes through our servers.</p>
        
        <div className="card-glass" style={{ maxWidth: '400px', width: '100%', marginTop: '32px' }}>
          <div className="input-row" style={{ flexDirection: 'column' }}>
            <div>
              <input
                type="text"
                className="input"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                placeholder="Enter Room ID"
                onKeyPress={(e) => e.key === 'Enter' && joinRoom()}
              />
            </div>
            <button 
              className="btn btn-primary w-100" 
              onClick={joinRoom}
              disabled={!roomId.trim()}
            >
              Join Room
            </button>
            <div style={{ textAlign: 'center', margin: '12px 0', color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase' }}>or</div>
            <button
              className="btn btn-secondary w-100"
              onClick={() => setShowCreateRoomModal(true)}
              disabled={!isSocketConnected}
            >
              {isSocketConnected ? 'Create New Room' : 'Connecting to Server...'}
            </button>
          </div>
        </div>

        <Notifications notification={notification} />

        {showCreateRoomModal && (
          <div className="modal-overlay">
            <div className="modal-dialog">
              <div className="modal-header">
                <h3>Create New Room</h3>
                <button className="modal-close" onClick={() => setShowCreateRoomModal(false)}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
              <div className="modal-body">
                <label className="form-label">Maximum Users</label>
                <select
                  className="select"
                  value={maxRoomSize}
                  onChange={(e) => setMaxRoomSize(Number(e.target.value))}
                >
                  <option value={2}>2 Users</option>
                  <option value={5}>5 Users</option>
                  <option value={10}>10 Users</option>
                </select>
                <p style={{ marginTop: '12px', fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                  A unique Room ID will be generated for you to share.
                </p>
              </div>
              <div className="modal-footer">
                <button className="btn btn-ghost" onClick={() => setShowCreateRoomModal(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={handleCreateRoom}>Create</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="room-layout">
      <div className="room-sidebar">
        <div className="room-controls card-glass">
          <div className="section-label">Current Session</div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div className="room-id-display" onClick={() => navigator.clipboard.writeText(currentRoom)} title="Click to copy">
              {currentRoom}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
            </div>
            <div className="room-status in-room">
              <span className="status-dot"></span>
              Live
            </div>
          </div>
          <button className="btn btn-danger w-100" onClick={handleExitRoom}>
            Leave Room
          </button>
        </div>

        <div className="card">
          <div className="section-label">File Transfer</div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
          <div 
            className={`file-zone ${file ? 'has-file' : ''}`}
            onClick={() => fileInputRef.current.click()}
            onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
            onDrop={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                fileInputRef.current.files = e.dataTransfer.files;
                handleFileChange({ target: { files: e.dataTransfer.files } });
              }
            }}
          >
            {file ? (
              <div className="file-name-display">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
                  <polyline points="13 2 13 9 20 9"></polyline>
                </svg>
                {file.name}
              </div>
            ) : (
              <>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="17 8 12 3 7 8"></polyline>
                  <line x1="12" y1="3" x2="12" y2="15"></line>
                </svg>
                <p>Click or drag file here to stage for sending</p>
              </>
            )}
          </div>
        </div>

        <PeerList 
          peers={connectedPeerIds} 
          userNames={userNames} 
          myId={webRTC.socket?.id}
          onSendFile={(peerId) => sendFile(peerId)}
          hasFile={!!file}
        />
      </div>

      <div className="room-main">
        <ChatBox 
          chatMessages={chatMessages} 
          onSendMessage={sendChatMessage} 
          userNames={userNames}
          myId={webRTC.socket.id}
        />
      </div>

      {showModal && receivedFiles[showModal] && (
        <FileModal
          file={receivedFiles[showModal]}
          onAccept={() => handleAccept(showModal)}
          onReject={() => handleReject(showModal)}
        />
      )}

      {/* Progress is handled in TransferDashboard now, but we keep a simplified version here for direct visual feedback if wanted. Actually, let's keep it clean and rely on the dashboard. */}
      {showModal && progress[showModal] > 0 && (
        <div style={{ position: 'fixed', bottom: '80px', right: '24px', width: '300px', zIndex: 1000, background: 'var(--bg-surface)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-lg)' }}>
          <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, marginBottom: '8px' }}>Downloading {receivedFiles[showModal].name}...</div>
          <ProgressBar progress={progress[showModal]} />
        </div>
      )}

      <Notifications notification={notification} />
    </div>
  );
};

export default Room;
