import { useState, useEffect, useRef, useCallback } from 'react';
import Peer from 'simple-peer';
import io from 'socket.io-client';
import CryptoJS from 'crypto-js';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';
const socket = io(BACKEND_URL, { transports: ['websocket'] });

// Simple MIME type mapping based on extension
const getMimeType = (filename) => {
  const extension = filename.split('.').pop().toLowerCase();
  const mimeTypes = {
    'txt': 'text/plain',
    'tex': 'text/plain',
    'png': 'image/png',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'gif': 'image/gif',
    'pdf': 'application/pdf',
    'doc': 'application/msword',
    'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'zip': 'application/zip',
    'rar': 'application/x-rar-compressed',
    'mp3': 'audio/mpeg',
    'mp4': 'video/mp4',
    'js': 'text/javascript',
    'py': 'text/x-python',
    'html': 'text/html',
    'css': 'text/css',
    'json': 'application/json',
    'csv': 'text/csv',
    'svg': 'image/svg+xml',
    'webp': 'image/webp',
  };
  return mimeTypes[extension] || 'application/octet-stream';
};

// Format bytes to human-readable string
export const formatBytes = (bytes) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Get file extension from filename
export const getFileExtension = (filename) => {
  const parts = filename.split('.');
  return parts.length > 1 ? parts.pop().toLowerCase() : '';
};

// Categorize file type for icon display
export const getFileCategory = (filename) => {
  const ext = getFileExtension(filename);
  const categories = {
    image: ['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'bmp', 'ico'],
    document: ['pdf', 'doc', 'docx', 'txt', 'tex', 'rtf', 'odt', 'xls', 'xlsx', 'ppt', 'pptx', 'csv'],
    archive: ['zip', 'rar', '7z', 'tar', 'gz'],
    code: ['js', 'py', 'html', 'css', 'json', 'java', 'cpp', 'c', 'ts', 'jsx', 'tsx', 'rb', 'go', 'rs'],
    media: ['mp3', 'mp4', 'wav', 'avi', 'mov', 'flac', 'mkv', 'webm'],
  };
  for (const [category, exts] of Object.entries(categories)) {
    if (exts.includes(ext)) return category;
  }
  return 'default';
};

const useWebRTC = () => {
  const [roomId, setRoomId] = useState('');
  const [peers, setPeers] = useState({});
  const [connectedPeerIds, setConnectedPeerIds] = useState([]);
  const [file, setFile] = useState(null);
  const [receivedFiles, setReceivedFiles] = useState({});
  const [showModal, setShowModal] = useState(null);
  const [fileChunks, setFileChunks] = useState({});
  const [fileName, setFileName] = useState('');
  const [progress, setProgress] = useState({});
  const [chatMessages, setChatMessages] = useState([]);
  const [acceptedFiles, setAcceptedFiles] = useState([]);
  const [userNames, setUserNames] = useState({});
  const [showCreateRoomModal, setShowCreateRoomModal] = useState(false);
  const [maxRoomSize, setMaxRoomSize] = useState(2);
  const [notification, setNotification] = useState(null);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [isSocketConnected, setIsSocketConnected] = useState(false);

  // Transfer dashboard state
  const [outgoingQueue, setOutgoingQueue] = useState([]);
  const [incomingTransfers, setIncomingTransfers] = useState([]);

  // Refs for stale closure prevention
  const acceptedFilesRef = useRef(acceptedFiles);
  const fileChunksRef = useRef(fileChunks);
  const fileNameRef = useRef(fileName);
  const receivedFilesRef = useRef(receivedFiles);
  const fileInputRef = useRef(null);
  const encryptionKeys = useRef({});
  const pendingFiles = useRef({});
  const peersRef = useRef(peers);
  const userNamesRef = useRef(userNames);
  const currentRoomRef = useRef(currentRoom);

  // Keep refs in sync
  useEffect(() => { acceptedFilesRef.current = acceptedFiles; }, [acceptedFiles]);
  useEffect(() => { fileChunksRef.current = fileChunks; }, [fileChunks]);
  useEffect(() => { fileNameRef.current = fileName; }, [fileName]);
  useEffect(() => { receivedFilesRef.current = receivedFiles; }, [receivedFiles]);
  useEffect(() => { peersRef.current = peers; }, [peers]);
  useEffect(() => { userNamesRef.current = userNames; }, [userNames]);
  useEffect(() => { currentRoomRef.current = currentRoom; }, [currentRoom]);

  const handleData = useCallback(
    (peerId) => (data) => {
      const receivedData = new TextDecoder().decode(data);
      try {
        const parsed = JSON.parse(receivedData);

        if (parsed.type === 'file-meta') {
          encryptionKeys.current[peerId] = parsed.key;
          setReceivedFiles((prev) => ({
            ...prev,
            [peerId]: { name: parsed.name, size: parsed.size },
          }));
          setFileName(parsed.name);
          setShowModal(peerId);
          setProgress((prev) => ({ ...prev, [peerId]: 0 }));

          // Add to incoming transfers dashboard
          setIncomingTransfers((prev) => {
            const existing = prev.find(t => t.peerId === peerId && t.status === 'downloading');
            if (existing) return prev;
            return [...prev, {
              peerId,
              fileName: parsed.name,
              fileSize: parsed.size,
              bytesReceived: 0,
              status: 'pending',
              startTime: null,
              speed: 0,
            }];
          });
        } else if (parsed.type === 'file-chunk' && acceptedFilesRef.current.includes(peerId)) {
          const decrypted = CryptoJS.AES.decrypt(
            parsed.data,
            encryptionKeys.current[peerId]
          ).toString(CryptoJS.enc.Latin1);
          const chunk = new Uint8Array(
            atob(decrypted)
              .split('')
              .map((c) => c.charCodeAt(0))
          );
          setFileChunks((prev) => ({
            ...prev,
            [peerId]: [...(prev[peerId] || []), chunk],
          }));
          setProgress((prev) => {
            const fileSize = receivedFilesRef.current[peerId]?.size || 1;
            const newProgress = Math.min(
              ((prev[peerId] || 0) + chunk.length) / fileSize * 100,
              100
            );
            return { ...prev, [peerId]: newProgress };
          });

          // Update incoming transfer dashboard
          setIncomingTransfers((prev) =>
            prev.map(t => {
              if (t.peerId === peerId && (t.status === 'downloading' || t.status === 'pending')) {
                const bytesReceived = t.bytesReceived + chunk.length;
                const elapsed = t.startTime ? (Date.now() - t.startTime) / 1000 : 1;
                const speed = bytesReceived / elapsed;
                return {
                  ...t,
                  bytesReceived,
                  status: 'downloading',
                  startTime: t.startTime || Date.now(),
                  speed,
                };
              }
              return t;
            })
          );
        } else if (parsed.type === 'file-end' && acceptedFilesRef.current.includes(peerId)) {
          const chunks = fileChunksRef.current[peerId] || [];
          const currentFileName = fileNameRef.current;
          const mimeType = getMimeType(currentFileName);
          const blob = new Blob(chunks, { type: mimeType });
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = currentFileName;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
          setAcceptedFiles((prev) => prev.filter((id) => id !== peerId));
          setFileChunks((prev) => {
            const newChunks = { ...prev };
            delete newChunks[peerId];
            return newChunks;
          });
          setProgress((prev) => {
            const newProgress = { ...prev };
            delete newProgress[peerId];
            return newProgress;
          });

          // Mark incoming transfer as complete
          setIncomingTransfers((prev) =>
            prev.map(t =>
              t.peerId === peerId && t.status === 'downloading'
                ? { ...t, status: 'complete', bytesReceived: t.fileSize }
                : t
            )
          );
        } else if (parsed.type === 'chat') {
          setChatMessages((prev) => [
            ...prev,
            { peerId, message: parsed.message, timestamp: Date.now() },
          ]);
        } else if (parsed.type === 'accept') {
          if (pendingFiles.current[peerId]) {
            const { sendChunks } = pendingFiles.current[peerId];
            sendChunks();
            delete pendingFiles.current[peerId];
          }
        }
      } catch (e) {
        console.error('Data parsing error:', e);
      }
    },
    [] // No dependencies needed — all state accessed via refs
  );

  useEffect(() => {
    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
      setIsSocketConnected(true);
    });

    socket.on('userNameAssigned', (userName) => {
      setUserNames((prev) => ({
        ...prev,
        [socket.id]: userName,
      }));
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
      setIsSocketConnected(false);
      setCurrentRoom(null);
      setRoomId('');
      setPeers({});
      setConnectedPeerIds([]);
      setChatMessages([]);
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setIsSocketConnected(false);
    });

    socket.on('usersInRoom', (peersWithNames) => {
      const newPeers = {};
      setUserNames((prev) => {
        const updated = { ...prev };
        peersWithNames.forEach(({ id, name }) => {
          if (id !== socket.id) {
            updated[id] = name;
          }
        });
        return updated;
      });

      peersWithNames.forEach(({ id: peerId }) => {
        if (!peersRef.current[peerId] && peerId !== socket.id) {
          const peer = new Peer({ initiator: true, trickle: false });
          peer.on('signal', (signal) => {
            socket.emit('signal', { targetId: peerId, signal });
          });
          peer.on('connect', () => {
            console.log(`Data channel open with ${peerId}`);
            setConnectedPeerIds((prev) => [...new Set([...prev, peerId])]);
          });
          peer.on('data', handleData(peerId));
          peer.on('error', (err) => console.error(`Peer ${peerId} error:`, err));
          newPeers[peerId] = peer;
        }
      });
      setPeers((prev) => ({ ...prev, ...newPeers }));
    });

    socket.on('newUserJoined', ({ id: peerId, name }) => {
      if (!peersRef.current[peerId] && peerId !== socket.id) {
        setUserNames((prev) => ({
          ...prev,
          [peerId]: name,
        }));
        const peer = new Peer({ initiator: false, trickle: false });
        peer.on('signal', (signal) => {
          socket.emit('signal', { targetId: peerId, signal });
        });
        peer.on('connect', () => {
          console.log(`Data channel open with ${peerId}`);
          setConnectedPeerIds((prev) => [...new Set([...prev, peerId])]);
        });
        peer.on('data', handleData(peerId));
        peer.on('error', (err) => console.error(`Peer ${peerId} error:`, err));
        setPeers((prev) => ({ ...prev, [peerId]: peer }));
      }
    });

    socket.on('signal', ({ from, signal }) => {
      if (peersRef.current[from]) {
        peersRef.current[from].signal(signal);
      } else {
        const peer = new Peer({ initiator: false, trickle: false });
        peer.on('signal', (signal) => {
          socket.emit('signal', { targetId: from, signal });
        });
        peer.on('connect', () => {
          console.log(`Data channel open with ${from}`);
          setConnectedPeerIds((prev) => [...new Set([...prev, from])]);
        });
        peer.on('data', handleData(from));
        peer.signal(signal);
        setPeers((prev) => ({ ...prev, [from]: peer }));
      }
    });

    socket.on('userLeft', ({ peerId, roomId: leftRoomId }) => {
      if (peersRef.current[peerId]) {
        peersRef.current[peerId].destroy();
        setPeers((prev) => {
          const newPeers = { ...prev };
          delete newPeers[peerId];
          return newPeers;
        });
        setConnectedPeerIds((prev) => prev.filter((id) => id !== peerId));

        if (leftRoomId === currentRoomRef.current) {
          const userName = userNamesRef.current[peerId] || 'Unknown';
          setNotification(`${userName} has left the room`);
          setTimeout(() => setNotification(null), 5000);
        }
      }
    });

    socket.on('roomCreated', (newRoomId) => {
      console.log(`Room created with ID: ${newRoomId}`);
      setRoomId(newRoomId);
      setShowCreateRoomModal(false);
      socket.emit('joinRoom', newRoomId);
    });

    socket.on('error', (message) => {
      setNotification(message);
      setTimeout(() => setNotification(null), 5000);
    });

    return () => {
      socket.off('connect');
      socket.off('userNameAssigned');
      socket.off('disconnect');
      socket.off('connect_error');
      socket.off('usersInRoom');
      socket.off('newUserJoined');
      socket.off('signal');
      socket.off('userLeft');
      socket.off('roomCreated');
      socket.off('error');
    };
  }, [handleData]);

  const joinRoom = useCallback(() => {
    if (roomId.trim()) {
      setCurrentRoom(roomId);
      socket.emit('joinRoom', roomId);
    }
  }, [roomId]);

  const handleCreateRoom = useCallback(() => {
    if (!socket.connected) {
      setNotification('Not connected to server. Please wait and try again.');
      setTimeout(() => setNotification(null), 5000);
      return;
    }

    socket.emit('createRoom', maxRoomSize);

    const timeout = setTimeout(() => {
      setNotification('Server did not respond. Please try again.');
      setTimeout(() => setNotification(null), 5000);
      setShowCreateRoomModal(false);
    }, 5000);

    socket.once('roomCreated', () => {
      clearTimeout(timeout);
    });
  }, [maxRoomSize]);

  const handleExitRoom = useCallback(() => {
    if (currentRoomRef.current) {
      socket.emit('leaveRoom', currentRoomRef.current);
      setCurrentRoom(null);
      setRoomId('');
      setPeers({});
      setConnectedPeerIds([]);
      setChatMessages([]);
      setNotification('You have left the room');
      setTimeout(() => setNotification(null), 5000);
    }
  }, []);

  const handleFileChange = useCallback((e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      // Auto-add to outgoing queue
      setOutgoingQueue((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          file: selectedFile,
          targetPeerId: null,
          status: 'staged',
        },
      ]);
    }
  }, []);

  const removeFromQueue = useCallback((queueId) => {
    setOutgoingQueue((prev) => prev.filter(item => item.id !== queueId));
  }, []);

  const sendFile = useCallback((targetPeerId, queueId) => {
    // Find file from queue or use currently selected file
    let fileToSend = file;
    if (queueId) {
      const queueItem = outgoingQueue.find(item => item.id === queueId);
      if (queueItem) fileToSend = queueItem.file;
    }

    if (fileToSend && peersRef.current[targetPeerId] && peersRef.current[targetPeerId].connected) {
      const peer = peersRef.current[targetPeerId];
      const chunkSize = 16384;
      let offset = 0;
      const key = CryptoJS.lib.WordArray.random(32).toString();

      // Update queue status
      if (queueId) {
        setOutgoingQueue((prev) =>
          prev.map(item =>
            item.id === queueId
              ? { ...item, targetPeerId, status: 'sending' }
              : item
          )
        );
      }

      const sendMeta = () => {
        peer.send(JSON.stringify({
          type: 'file-meta',
          name: fileToSend.name,
          size: fileToSend.size,
          key
        }));
      };

      const readNextChunk = () => {
        const slice = fileToSend.slice(offset, offset + chunkSize);
        const reader = new FileReader();
        reader.onload = () => {
          const chunk = reader.result;
          const encrypted = CryptoJS.AES.encrypt(
            btoa(String.fromCharCode(...new Uint8Array(chunk))),
            key
          ).toString();
          peer.send(JSON.stringify({ type: 'file-chunk', data: encrypted }));
          offset += chunkSize;
          if (offset < fileToSend.size) {
            readNextChunk();
          } else {
            peer.send(JSON.stringify({ type: 'file-end', name: fileToSend.name }));
            setFile(null);
            // Update queue status to sent
            if (queueId) {
              setOutgoingQueue((prev) =>
                prev.map(item =>
                  item.id === queueId
                    ? { ...item, status: 'sent' }
                    : item
                )
              );
            }
          }
        };
        reader.readAsArrayBuffer(slice);
      };

      sendMeta();
      pendingFiles.current[targetPeerId] = { file: fileToSend, sendChunks: readNextChunk };
    }
  }, [file, outgoingQueue]);

  const sendChatMessage = useCallback((message) => {
    Object.values(peersRef.current).forEach((peer) => {
      if (peer.connected) {
        peer.send(JSON.stringify({ type: 'chat', message }));
      }
    });
    setChatMessages((prev) => [
      ...prev,
      { peerId: socket.id, message, timestamp: Date.now() },
    ]);
  }, []);

  const handleAccept = useCallback((peerId) => {
    setAcceptedFiles((prev) => {
      const updated = [...new Set([...prev, peerId])];
      return updated;
    });
    setShowModal(null);
    const peer = peersRef.current[peerId];
    if (peer && peer.connected) {
      peer.send(JSON.stringify({ type: 'accept' }));
    }
    // Update incoming transfer status
    setIncomingTransfers((prev) =>
      prev.map(t =>
        t.peerId === peerId && t.status === 'pending'
          ? { ...t, status: 'downloading', startTime: Date.now() }
          : t
      )
    );
  }, []);

  const handleReject = useCallback((peerId) => {
    setShowModal(null);
    setReceivedFiles((prev) => {
      const newFiles = { ...prev };
      delete newFiles[peerId];
      return newFiles;
    });
    // Remove from incoming transfers
    setIncomingTransfers((prev) =>
      prev.filter(t => !(t.peerId === peerId && t.status === 'pending'))
    );
  }, []);

  return {
    // Socket
    socket,
    isSocketConnected,
    // Room
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
    // Peers
    peers,
    connectedPeerIds,
    userNames,
    // File transfer
    file,
    setFile,
    sendFile,
    receivedFiles,
    progress,
    showModal,
    handleAccept,
    handleReject,
    fileInputRef,
    handleFileChange,
    // Transfer queue
    outgoingQueue,
    removeFromQueue,
    incomingTransfers,
    // Chat
    chatMessages,
    sendChatMessage,
    // Notifications
    notification,
  };
};

export default useWebRTC;
