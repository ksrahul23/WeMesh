import React, { useState } from 'react';
import './App.css';
import { ThemeProvider } from './context/ThemeContext';
import ThemeToggle from './components/ThemeToggle';
import Room from './Room';
import ArchitecturePage from './components/ArchitecturePage';
import TransferDashboard from './components/TransferDashboard';
import useWebRTC from './hooks/useWebRTC';

function AppContent() {
  const [activeTab, setActiveTab] = useState('room');
  const webRTC = useWebRTC();

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-brand">
          <svg className="app-brand-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6L6 18M6 6l12 12" opacity="0.3"/>
            <circle cx="18" cy="6" r="3" />
            <circle cx="6" cy="18" r="3" />
            <circle cx="6" cy="6" r="3" />
            <circle cx="18" cy="18" r="3" />
            <path d="M6 9v6" />
            <path d="M18 9v6" />
            <path d="M9 6h6" />
            <path d="M9 18h6" />
          </svg>
          <div className="app-brand-name">We<span>Mesh</span></div>
        </div>
        
        <div className="app-header-actions">
          <span style={{ fontSize: 'var(--text-xs)', marginRight: 'var(--spacing-md)', color: 'var(--text-muted)' }}>
            by <a href="https://github.com/ksrahul23/WeMesh" target="_blank" rel="noopener noreferrer" className="author-link">
              rahul kumar shaw
            </a>
          </span>
          <ThemeToggle />
        </div>
      </header>

      <nav className="tab-nav">
        <button 
          className={`tab-nav-btn ${activeTab === 'room' ? 'active' : ''}`}
          onClick={() => setActiveTab('room')}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
          Mesh Room
        </button>
        <button 
          className={`tab-nav-btn ${activeTab === 'transfers' ? 'active' : ''}`}
          onClick={() => setActiveTab('transfers')}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line>
          </svg>
          Transfers
          {webRTC.outgoingQueue.length + webRTC.incomingTransfers.filter(t => t.status === 'downloading' || t.status === 'pending').length > 0 && (
            <span style={{
              background: 'var(--accent)',
              color: 'var(--accent-text)',
              fontSize: '0.65rem',
              padding: '2px 6px',
              borderRadius: '999px',
              marginLeft: '4px'
            }}>
              {webRTC.outgoingQueue.length + webRTC.incomingTransfers.filter(t => t.status === 'downloading' || t.status === 'pending').length}
            </span>
          )}
        </button>
        <button 
          className={`tab-nav-btn ${activeTab === 'architecture' ? 'active' : ''}`}
          onClick={() => setActiveTab('architecture')}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline>
          </svg>
          How it Works
        </button>
      </nav>

      <main className="tab-content">
        {activeTab === 'room' && <Room webRTC={webRTC} />}
        {activeTab === 'transfers' && <TransferDashboard webRTC={webRTC} />}
        {activeTab === 'architecture' && <ArchitecturePage />}
      </main>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;
