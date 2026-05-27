import React, { useState, useEffect, useRef } from 'react';

const ChatBox = ({ chatMessages, onSendMessage, userNames, myId }) => {
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const handleSendMessage = () => {
    if (message.trim()) {
      onSendMessage(message);
      setMessage('');
    }
  };

  const shortenUserName = (userName) => {
    if (!userName) return 'Unknown';
    return userName.length > 10 ? userName.substring(0, 10) + '...' : userName;
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="card-glass" style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
      <div style={{ padding: 'var(--spacing-md) var(--spacing-xl)', borderBottom: '1px solid var(--border)', background: 'var(--bg-surface)' }}>
        <div className="section-label" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
          Live Chat
        </div>
      </div>
      
      {chatMessages.length === 0 ? (
        <div className="chat-empty">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
          <p>No messages yet.<br/>Say hello to the room!</p>
        </div>
      ) : (
        <div className="chat-messages">
          {chatMessages.map((msg, index) => {
            const isSelf = msg.peerId === myId;
            return (
              <div key={index} className={`chat-bubble ${isSelf ? 'self' : 'peer'}`}>
                {!isSelf && <div className="chat-bubble-name">{shortenUserName(userNames[msg.peerId])}</div>}
                <div>{msg.message}</div>
                <div className="chat-bubble-time">{formatTime(msg.timestamp)}</div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      )}

      <div className="chat-input-bar">
        <input
          type="text"
          className="input"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
        />
        <button className="btn btn-primary btn-icon" onClick={handleSendMessage} disabled={!message.trim()}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
        </button>
      </div>
    </div>
  );
};

export default ChatBox;