import React, { useState } from 'react';

const ArchitecturePage = () => {
  const [openStep, setOpenStep] = useState(1);

  return (
    <div className="arch-page">
      <div className="arch-hero">
        <div className="arch-mesh-bg">
          <div className="mesh-dot" style={{ top: '20%', left: '30%' }}></div>
          <div className="mesh-dot" style={{ top: '60%', left: '70%', animationDelay: '1s' }}></div>
          <div className="mesh-dot" style={{ top: '40%', left: '50%', animationDelay: '2s' }}></div>
          <div className="mesh-dot" style={{ top: '80%', left: '20%', animationDelay: '1.5s' }}></div>
        </div>
        
        <h1>How We<span>Mesh</span> Works</h1>
        <p>A deep dive into the decentralized architecture, WebRTC handshakes, and cryptographic security that powers direct browser-to-browser communication.</p>
      </div>

      <div className="arch-overview">
        <div className="arch-overview-card">
          <div className="arch-overview-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
          </div>
          <h3>Peer-to-Peer</h3>
          <p>No central server stores your files. Data flows directly between browsers using the WebRTC data channel protocol.</p>
        </div>
        <div className="arch-overview-card">
          <div className="arch-overview-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
          </div>
          <h3>End-to-End Encryption</h3>
          <p>Every file is encrypted locally using AES-256 before leaving your device. Only the recipient has the key to decrypt it.</p>
        </div>
        <div className="arch-overview-card">
          <div className="arch-overview-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
            </svg>
          </div>
          <h3>Zero Server Limits</h3>
          <p>Since data bypasses our servers completely, there are no artificial file size limits or bandwidth throttling.</p>
        </div>
      </div>

      <div className="arch-security">
        <h2>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
          </svg>
          The Connection Lifecycle
        </h2>
        
        <div className="arch-steps">
          {/* Step 1 */}
          <div className={`arch-step ${openStep === 1 ? 'open' : ''}`}>
            <div className="arch-step-header" onClick={() => setOpenStep(openStep === 1 ? null : 1)}>
              <div className="arch-step-number">1</div>
              <div className="arch-step-title">
                <h3>Socket.io Handshake (Signaling)</h3>
                <p>Establishing presence via the signaling server</p>
              </div>
              <svg className="arch-step-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </div>
            {openStep === 1 && (
              <div className="arch-step-content">
                <p>Before browsers can connect directly, they must discover each other. We use a lightweight Node.js + Socket.io server solely for this "signaling" phase.</p>
                <p>When you join a room, the server broadcasts your presence to existing peers. It does not touch your actual file data.</p>
                <div className="arch-code-block">
<span className="code-comment">{'// Client connects and joins room'}</span>
<span className="code-keyword">socket</span>.<span className="code-property">emit</span>(<span className="code-string">'joinRoom'</span>, roomId);

<span className="code-comment">{'// Server notifies others'}</span>
<span className="code-keyword">socket</span>.<span className="code-property">to</span>(roomId).<span className="code-property">emit</span>(<span className="code-string">'newUserJoined'</span>, peerId);
                </div>
              </div>
            )}
          </div>

          {/* Step 2 */}
          <div className={`arch-step ${openStep === 2 ? 'open' : ''}`}>
            <div className="arch-step-header" onClick={() => setOpenStep(openStep === 2 ? null : 2)}>
              <div className="arch-step-number">2</div>
              <div className="arch-step-title">
                <h3>SDP Offer & Answer</h3>
                <p>Negotiating connection capabilities</p>
              </div>
              <svg className="arch-step-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </div>
            {openStep === 2 && (
              <div className="arch-step-content">
                <p>Browsers exchange Session Description Protocol (SDP) messages through the signaling server. This establishes what kind of data they intend to share (in our case, a data channel) and how they plan to encode it.</p>
                <div className="arch-code-block">
<span className="code-comment">{'// Example SDP Payload Fragment'}</span>
<span className="code-keyword">v</span>=<span className="code-number">0</span>
<span className="code-keyword">o</span>=<span className="code-string">- 4611738734685513511 2 IN IP4 127.0.0.1</span>
<span className="code-keyword">s</span>=<span className="code-string">-</span>
<span className="code-keyword">t</span>=<span className="code-number">0 0</span>
<span className="code-keyword">a</span>=<span className="code-string">group:BUNDLE 0</span>
                </div>
              </div>
            )}
          </div>

          {/* Step 3 */}
          <div className={`arch-step ${openStep === 3 ? 'open' : ''}`}>
            <div className="arch-step-header" onClick={() => setOpenStep(openStep === 3 ? null : 3)}>
              <div className="arch-step-number">3</div>
              <div className="arch-step-title">
                <h3>ICE Candidate Discovery</h3>
                <p>NAT Traversal and path finding</p>
              </div>
              <svg className="arch-step-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </div>
            {openStep === 3 && (
              <div className="arch-step-content">
                <p>Because most users are behind NAT routers, they don't have public IP addresses. Browsers use STUN servers to discover their public-facing IP, generating "ICE Candidates."</p>
                <p>These candidates are swapped via the signaling server until a direct UDP network path between the two browsers is successfully mapped.</p>
              </div>
            )}
          </div>

          {/* Step 4 */}
          <div className={`arch-step ${openStep === 4 ? 'open' : ''}`}>
            <div className="arch-step-header" onClick={() => setOpenStep(openStep === 4 ? null : 4)}>
              <div className="arch-step-number">4</div>
              <div className="arch-step-title">
                <h3>ArrayBuffer Chunking & AES Encryption</h3>
                <p>Preparing the file for direct transit</p>
              </div>
              <svg className="arch-step-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </div>
            {openStep === 4 && (
              <div className="arch-step-content">
                <p>WebRTC data channels cannot send massive files at once. We must slice the file into small chunks (16KB), encrypt each chunk, and stream them.</p>
                
                <div className="arch-chunk-visual">
                  <div className="arch-chunk source">File (1MB)</div>
                  <div className="arch-chunk arrow">→</div>
                  <div className="arch-chunk step">Slice (16KB)</div>
                  <div className="arch-chunk arrow">→</div>
                  <div className="arch-chunk step">Base64 Encode</div>
                  <div className="arch-chunk arrow">→</div>
                  <div className="arch-chunk step">AES Encrypt</div>
                  <div className="arch-chunk arrow">→</div>
                  <div className="arch-chunk result">WebRTC Send</div>
                </div>

                <div className="arch-code-block">
<span className="code-comment">{'// Cryptographic slicing pipeline'}</span>
<span className="code-keyword">const</span> slice = file.slice(offset, offset + <span className="code-number">16384</span>);
<span className="code-keyword">const</span> chunk = reader.result;
<span className="code-keyword">const</span> encrypted = CryptoJS.AES.<span className="code-property">encrypt</span>(
  <span className="code-property">btoa</span>(String.<span className="code-property">fromCharCode</span>(...<span className="code-keyword">new</span> Uint8Array(chunk))),
  key
).<span className="code-property">toString</span>();
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="arch-tech-stack">
        <div className="arch-tech-badge">React 19</div>
        <div className="arch-tech-badge">WebRTC</div>
        <div className="arch-tech-badge">Socket.io</div>
        <div className="arch-tech-badge">CryptoJS</div>
        <div className="arch-tech-badge">Simple-Peer</div>
      </div>
    </div>
  );
};

export default ArchitecturePage;
