import React, { useState, useEffect, useCallback, useRef } from 'react';
const Icon = ({ name, size = 24, className = "" }) => {
  const icons = {
    leaf: <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Zm0 0c0-1.43.75-2.5 2-2.5 1.5 0 2.5 1 2.5 2.5M17.58 12.58C15.29 10.29 12.71 9 10 9" />,
    camera: <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />,
    history: <><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></>,
    wifi: <path d="M5 13a10 10 0 0 1 14 0M8.5 16.5a5 5 0 0 1 7 0M12 20h.01"/>,
    wifiOff: <><path d="M5 13a10 10 0 0 1 5.6-2.6M12 20h.01"/><path d="M8.5 16.5a5 5 0 0 1 3.5-1.5"/><line x1="2" y1="2" x2="22" y2="22"/></>,
    cloud: <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/>,
    cloudOff: <><path d="M22 15c0-1.5-.5-2.8-1.4-3.8"/><path d="M17.5 19H9a7 7 0 1 1 6.71-9h.79"/><line x1="2" y1="2" x2="22" y2="22"/></>,
    video: <><path d="m22 8-6 4 6 4V8Z"/><rect width="14" height="12" x="2" y="6" rx="2" ry="2"/></>,
    square: <rect width="18" height="18" x="3" y="3" rx="2"/>,
    rotateCcw: <><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></>,
    mic: <><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v3"/></>,
    micOff: <><line x1="2" y1="2" x2="22" y2="22"/><path d="M18.89 13.23A7.12 7.12 0 0 0 19 12v-2M5 10v2a7 7 0 0 0 12 5"/><path d="M15 9.34V5a3 3 0 0 0-5.68-1.33M12 19v3"/></>,
    send: <><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></>,
    loader: <><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/></>,
    check: <><path d="M20 6 9 17l-5-5"/></>,
    x: <><path d="M18 6 6 18"/><path d="m6 6 12 12"/></>,
    play: <polygon points="5 3 19 12 5 21 5 3"/>,
    trash: <><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></>,
    alert: <><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></>,
  };
  
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      {icons[name]}
    </svg>
  );
};

// ==================== STYLES ====================
const styles = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { 
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    background: #F5F7F4;
    -webkit-font-smoothing: antialiased;
  }
  
  .app { 
    min-height: 100vh; 
    background: linear-gradient(180deg, #F5F7F4 0%, #E8F0E3 100%);
    padding-bottom: 2rem;
  }
  
  .header { 
    padding: 1.5rem 1.25rem 1rem;
    background: white;
    border-bottom: 1px solid #E5E8E5;
  }
  
  .header-top {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 0.5rem;
  }
  
  .logo { 
    width: 3rem;
    height: 3rem;
    background: linear-gradient(135deg, #5FB764 0%, #4A9F4F 100%);
    border-radius: 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    box-shadow: 0 2px 8px rgba(95, 183, 100, 0.25);
  }
  
  .brand {
    flex: 1;
  }
  
  .brand-name { 
    font-size: 1.5rem;
    font-weight: 700;
    color: #2D3A2E;
    letter-spacing: -0.02em;
  }
  
  .brand-tagline { 
    font-size: 0.875rem;
    color: #6B7B6E;
    margin-top: 0.125rem;
  }
  
  .network-indicator {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    padding: 0.5rem 0.875rem;
    border-radius: 2rem;
    font-size: 0.75rem;
    font-weight: 500;
  }
  
  .network-indicator.online {
    background: #E8F5E9;
    color: #2E7D32;
  }
  
  .network-indicator.offline {
    background: #FFF8E1;
    color: #F57C00;
  }
  
  .tabs-container {
    padding: 0 1.25rem;
    margin-top: 1.5rem;
  }
  
  .tab-list { 
    display: grid;
    grid-template-columns: 1fr 1fr;
    background: white;
    border-radius: 1rem;
    padding: 0.375rem;
    margin-bottom: 1.5rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  }
  
  .tab-btn { 
    padding: 0.875rem 1rem;
    border: none;
    background: transparent;
    border-radius: 0.75rem;
    font-size: 0.9375rem;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    transition: all 0.2s ease;
    color: #6B7B6E;
  }
  
  .tab-btn.active { 
    background: linear-gradient(135deg, #5FB764 0%, #4A9F4F 100%);
    color: white;
    box-shadow: 0 2px 8px rgba(95, 183, 100, 0.3);
  }
  
  .card { 
    background: white;
    border-radius: 1.25rem;
    padding: 1.25rem;
    margin-bottom: 1rem;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  }
  
  .video-container { 
    position: relative;
    aspect-ratio: 16/9;
    background: linear-gradient(135deg, #2D3A2E 0%, #1A2419 100%);
    border-radius: 1rem;
    overflow: hidden;
    margin-bottom: 1rem;
  }
  
  .video-preview { 
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  .video-placeholder { 
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: #8B9B8E;
    gap: 0.75rem;
  }
  
  .video-placeholder-text {
    font-size: 0.9375rem;
    font-weight: 500;
  }
  
  .timer { 
    position: absolute;
    top: 1rem;
    right: 1rem;
    background: rgba(0, 0, 0, 0.75);
    backdrop-filter: blur(8px);
    color: white;
    padding: 0.375rem 0.875rem;
    border-radius: 2rem;
    font-size: 0.875rem;
    font-weight: 600;
    letter-spacing: 0.02em;
  }
  
  .timer.recording { 
    background: #EF4444;
    animation: pulse 1.5s ease-in-out infinite;
  }
  
  @keyframes pulse { 
    0%, 100% { opacity: 1; } 
    50% { opacity: 0.7; } 
  }
  
  .video-controls { 
    display: flex;
    gap: 1rem;
    justify-content: center;
  }
  
  .control-btn { 
    width: 3.5rem;
    height: 3.5rem;
    border-radius: 50%;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
  
  .control-btn:active {
    transform: scale(0.95);
  }
  
  .record-btn { 
    background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%);
    color: white;
  }
  
  .record-btn:hover { 
    box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
  }
  
  .stop-btn { 
    background: linear-gradient(135deg, #2D3A2E 0%, #1A2419 100%);
    color: white;
  }
  
  .reset-btn { 
    background: white;
    color: #6B7B6E;
    border: 2px solid #E5E8E5;
  }
  
  .reset-btn:hover { 
    background: #F5F7F4;
  }
  
  .voice-section { 
    margin-bottom: 1rem;
  }
  
  .voice-header { 
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 0.875rem;
  }
  
  .voice-label { 
    font-size: 0.9375rem;
    font-weight: 600;
    color: #2D3A2E;
  }
  
  .voice-btn { 
    padding: 0.5rem 1rem;
    border-radius: 2rem;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.8125rem;
    font-weight: 500;
    transition: all 0.2s ease;
  }
  
  .voice-btn.listening { 
    background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%);
    color: white;
    animation: pulse 1.5s ease-in-out infinite;
  }
  
  .voice-btn.idle { 
    background: #F5F7F4;
    color: #5FB764;
    border: 2px solid #E5E8E5;
  }
  
  .voice-btn.idle:hover { 
    background: #E8F5E9;
    border-color: #5FB764;
  }
  
  .textarea { 
    width: 100%;
    min-height: 120px;
    padding: 1rem;
    border: 2px solid #E5E8E5;
    border-radius: 1rem;
    font-size: 0.9375rem;
    resize: vertical;
    font-family: inherit;
    color: #2D3A2E;
    background: #FAFBFA;
    transition: all 0.2s ease;
  }
  
  .textarea:focus { 
    outline: none;
    border-color: #5FB764;
    background: white;
    box-shadow: 0 0 0 4px rgba(95, 183, 100, 0.1);
  }
  
  .textarea::placeholder {
    color: #A8B5AB;
  }
  
  .submit-btn { 
    width: 100%;
    padding: 1rem;
    border: none;
    border-radius: 1rem;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    transition: all 0.2s ease;
    background: linear-gradient(135deg, #5FB764 0%, #4A9F4F 100%);
    color: white;
    box-shadow: 0 4px 12px rgba(95, 183, 100, 0.3);
  }
  
  .submit-btn:hover:not(:disabled) { 
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(95, 183, 100, 0.4);
  }
  
  .submit-btn:active:not(:disabled) {
    transform: translateY(0);
  }
  
  .submit-btn:disabled { 
    opacity: 0.5;
    cursor: not-allowed;
    transform: none !important;
  }
  
  .hint { 
    text-align: center;
    font-size: 0.8125rem;
    color: #8B9B8E;
    margin-top: 0.75rem;
  }
  
  .toast { 
    position: fixed;
    bottom: 2rem;
    left: 1.25rem;
    right: 1.25rem;
    max-width: 28rem;
    margin: 0 auto;
    padding: 1rem 1.25rem;
    border-radius: 1rem;
    display: flex;
    align-items: center;
    gap: 0.875rem;
    z-index: 100;
    animation: slideUp 0.3s ease-out;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  }
  
  .toast.online { 
    background: linear-gradient(135deg, #5FB764 0%, #4A9F4F 100%);
    color: white;
  }
  
  .toast.offline { 
    background: white;
    color: #F57C00;
    border: 2px solid #FFE0B2;
  }
  
  .toast-icon {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  .toast-content {
    flex: 1;
  }
  
  .toast-title {
    font-weight: 600;
    font-size: 0.9375rem;
  }
  
  .toast-message {
    font-size: 0.8125rem;
    opacity: 0.9;
    margin-top: 0.125rem;
  }
  
  .toast-close { 
    padding: 0.375rem;
    background: transparent;
    border: none;
    cursor: pointer;
    border-radius: 0.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.2s;
  }
  
  .toast-close:hover { 
    background: rgba(255, 255, 255, 0.2);
  }
  
  @keyframes slideUp { 
    from { transform: translateY(1rem); opacity: 0; } 
    to { transform: translateY(0); opacity: 1; } 
  }
  
  .gallery-empty { 
    text-align: center;
    padding: 4rem 1.25rem;
    color: #8B9B8E;
  }
  
  .gallery-empty-icon {
    margin: 0 auto 1rem;
    opacity: 0.4;
  }
  
  .gallery-empty-text {
    font-size: 1rem;
    font-weight: 500;
    color: #6B7B6E;
  }
  
  .gallery-item { 
    display: flex;
    gap: 1rem;
    padding: 1rem;
    background: #FAFBFA;
    border-radius: 1rem;
    margin-bottom: 0.75rem;
    transition: all 0.2s ease;
  }
  
  .gallery-item:hover {
    background: #F5F7F4;
  }
  
  .gallery-thumb { 
    width: 5.5rem;
    height: 4rem;
    background: linear-gradient(135deg, #2D3A2E 0%, #1A2419 100%);
    border-radius: 0.75rem;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #8B9B8E;
    overflow: hidden;
    flex-shrink: 0;
  }
  
  .gallery-thumb video { 
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  .gallery-info { 
    flex: 1;
    min-width: 0;
  }
  
  .gallery-title { 
    font-size: 0.9375rem;
    font-weight: 600;
    color: #2D3A2E;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  .gallery-meta { 
    font-size: 0.8125rem;
    color: #8B9B8E;
    margin-top: 0.375rem;
  }
  
  .gallery-desc { 
    font-size: 0.8125rem;
    color: #6B7B6E;
    margin-top: 0.375rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  
  .gallery-actions { 
    display: flex;
    gap: 0.25rem;
    align-items: flex-start;
  }
  
  .gallery-btn { 
    padding: 0.625rem;
    background: transparent;
    border: none;
    cursor: pointer;
    border-radius: 0.5rem;
    color: #8B9B8E;
    transition: all 0.2s ease;
  }
  
  .gallery-btn:hover { 
    background: #E5E8E5;
  }
  
  .gallery-btn.delete:hover { 
    background: #FFEBEE;
    color: #EF4444;
  }
  
  .error-msg { 
    background: #FFEBEE;
    color: #C62828;
    padding: 0.875rem 1rem;
    border-radius: 0.75rem;
    font-size: 0.875rem;
    display: flex;
    align-items: center;
    gap: 0.625rem;
    margin-bottom: 1rem;
    border: 1px solid #FFCDD2;
  }
  
  .badge { 
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.25rem 0.625rem;
    border-radius: 2rem;
    font-size: 0.6875rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.02em;
  }
  
  .badge.pending { 
    background: #FFF8E1;
    color: #F57C00;
  }
  
  .badge.synced { 
    background: #E8F5E9;
    color: #2E7D32;
  }
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  
  .animate-spin {
    animation: spin 1s linear infinite;
  }
`;

// ==================== INDEXEDDB HELPER ====================
const DB_NAME = 'CropDocDB';
const STORE_NAME = 'pendingMedia';

const initDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
  });
};

const savePendingMedia = async (data) => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const request = store.put(data);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

const getAllPendingMedia = async () => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
};

const deletePendingMedia = async (id) => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const request = store.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

const getPendingCount = async () => {
  const items = await getAllPendingMedia();
  return items.length;
};

// ==================== HOOKS ====================
const useOnlineStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  return { isOnline };
};

const useVideoRecorder = (maxDuration = 30) => {
  const [state, setState] = useState({
    isRecording: false,
    recordedBlob: null,
    recordedUrl: null,
    duration: 0,
    error: null,
  });
  
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);
  const startTimeRef = useRef(0);

  const startRecording = useCallback(async () => {
    setState(prev => ({ ...prev, error: null, recordedBlob: null, recordedUrl: null }));
    chunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: true,
      });
      
      streamRef.current = stream;
      const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9') ? 'video/webm;codecs=vp9' : 'video/webm';
      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType });
        const url = URL.createObjectURL(blob);
        const finalDuration = Math.round((Date.now() - startTimeRef.current) / 1000);
        setState(prev => ({ ...prev, isRecording: false, recordedBlob: blob, recordedUrl: url, duration: finalDuration }));
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start(1000);
      startTimeRef.current = Date.now();
      setState(prev => ({ ...prev, isRecording: true, duration: 0 }));

      timerRef.current = setInterval(() => {
        const elapsed = Math.round((Date.now() - startTimeRef.current) / 1000);
        setState(prev => ({ ...prev, duration: elapsed }));
        if (elapsed >= maxDuration) {
          clearInterval(timerRef.current);
          mediaRecorder.stop();
        }
      }, 1000);

      return stream;
    } catch (err) {
      setState(prev => ({ ...prev, error: 'Camera/microphone permission denied.' }));
      return null;
    }
  }, [maxDuration]);

  const stopRecording = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (mediaRecorderRef.current?.state !== 'inactive') mediaRecorderRef.current?.stop();
  }, []);

  const resetRecording = useCallback(() => {
    if (state.recordedUrl) URL.revokeObjectURL(state.recordedUrl);
    setState({ isRecording: false, recordedBlob: null, recordedUrl: null, duration: 0, error: null });
  }, [state.recordedUrl]);

  const getStream = useCallback(() => streamRef.current, []);

  return { ...state, startRecording, stopRecording, resetRecording, getStream, maxDuration };
};

const useVoiceInput = () => {
  const [state, setState] = useState({ isListening: false, transcript: '', isSupported: false, error: null });
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    setState(prev => ({ ...prev, isSupported: !!SpeechRecognition }));

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      
      recognition.onstart = () => setState(prev => ({ ...prev, isListening: true, error: null }));
      recognition.onresult = (event) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) finalTranscript += event.results[i][0].transcript + ' ';
        }
        if (finalTranscript) setState(prev => ({ ...prev, transcript: prev.transcript + finalTranscript }));
      };
      recognition.onerror = (event) => setState(prev => ({ ...prev, isListening: false, error: event.error }));
      recognition.onend = () => setState(prev => ({ ...prev, isListening: false }));
      recognitionRef.current = recognition;
    }
  }, []);

  const startListening = useCallback(() => { recognitionRef.current?.start(); }, []);
  const stopListening = useCallback(() => { recognitionRef.current?.stop(); }, []);
  const clearTranscript = useCallback(() => setState(prev => ({ ...prev, transcript: '', error: null })), []);
  const setTranscript = useCallback((text) => setState(prev => ({ ...prev, transcript: text })), []);

  return { ...state, startListening, stopListening, clearTranscript, setTranscript };
};

// ==================== COMPONENTS ====================
const NetworkStatus = ({ pendingCount, isSyncing }) => {
  const { isOnline } = useOnlineStatus();
  return (
    <div className="header">
      <div className="header-top">
        <div className="logo">
          <Icon name="leaf" size={28} />
        </div>
        <div className="brand">
          <div className="brand-name">CropDoc</div>
          <div className="brand-tagline">Capture & Analyze</div>
        </div>
        <div className={`network-indicator ${isOnline ? 'online' : 'offline'}`}>
          <Icon name={isOnline ? 'wifi' : 'wifiOff'} size={14} />
          <span>{isOnline ? 'Online' : 'Offline'}</span>
        </div>
      </div>
      {pendingCount > 0 && (
        <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', color: '#F57C00' }}>
          <Icon name={isSyncing ? 'loader' : 'cloudOff'} size={14} className={isSyncing ? 'animate-spin' : ''} />
          <span>{pendingCount} capture{pendingCount !== 1 ? 's' : ''} pending sync</span>
        </div>
      )}
    </div>
  );
};

const VideoRecorder = ({ onVideoRecorded, maxDuration = 30 }) => {
  const { isRecording, recordedBlob, recordedUrl, duration, error, startRecording, stopRecording, resetRecording, getStream } = useVideoRecorder(maxDuration);
  const liveVideoRef = useRef(null);
  const [hasRecorded, setHasRecorded] = useState(false);

  const handleStart = async () => {
    const stream = await startRecording();
    if (stream && liveVideoRef.current) {
      liveVideoRef.current.srcObject = stream;
      liveVideoRef.current.play();
    }
  };

  const handleStop = () => { stopRecording(); setHasRecorded(true); };
  const handleReset = () => { resetRecording(); setHasRecorded(false); };

  useEffect(() => {
    if (recordedBlob && hasRecorded) onVideoRecorded(recordedBlob, duration);
  }, [recordedBlob, duration, hasRecorded, onVideoRecorded]);

  const formatTime = (seconds) => `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, '0')}`;

  return (
    <div>
      <div className="video-container">
        {isRecording ? (
          <video ref={liveVideoRef} className="video-preview" muted playsInline />
        ) : recordedUrl ? (
          <video src={recordedUrl} className="video-preview" controls playsInline />
        ) : (
          <div className="video-placeholder">
            <Icon name="video" size={56} />
            <span className="video-placeholder-text">Tap record to start</span>
          </div>
        )}
        {(isRecording || recordedUrl) && (
          <div className={`timer ${isRecording ? 'recording' : ''}`}>
            {formatTime(duration)} / {formatTime(maxDuration)}
          </div>
        )}
      </div>
      
      {error && (
        <div className="error-msg">
          <Icon name="alert" size={18} />
          {error}
        </div>
      )}
      
      <div className="video-controls">
        {!isRecording && !recordedUrl && (
          <button onClick={handleStart} className="control-btn record-btn">
            <Icon name="video" size={24} />
          </button>
        )}
        {isRecording && (
          <button onClick={handleStop} className="control-btn stop-btn">
            <Icon name="square" size={24} />
          </button>
        )}
        {recordedUrl && (
          <button onClick={handleReset} className="control-btn reset-btn">
            <Icon name="rotateCcw" size={24} />
          </button>
        )}
      </div>
    </div>
  );
};

const VoiceInput = ({ onTranscriptChange, placeholder }) => {
  const { isListening, transcript, isSupported, error, startListening, stopListening, setTranscript } = useVoiceInput();

  useEffect(() => { onTranscriptChange(transcript); }, [transcript, onTranscriptChange]);

  const handleChange = (e) => setTranscript(e.target.value);
  const toggleListening = () => isListening ? stopListening() : startListening();

  return (
    <div className="voice-section">
      <div className="voice-header">
        <label className="voice-label">Description</label>
        {isSupported && (
          <button onClick={toggleListening} className={`voice-btn ${isListening ? 'listening' : 'idle'}`}>
            <Icon name={isListening ? 'micOff' : 'mic'} size={16} />
            {isListening ? 'Stop' : 'Voice'}
          </button>
        )}
      </div>
      {error && (
        <div className="error-msg">
          <Icon name="alert" size={16} />
          Voice error: {error}
        </div>
      )}
      <textarea 
        className="textarea" 
        value={transcript} 
        onChange={handleChange} 
        placeholder={placeholder}
      />
    </div>
  );
};

const ConfirmationToast = ({ isVisible, type, message, onClose }) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setShow(true);
      const timer = setTimeout(() => { setShow(false); setTimeout(onClose, 300); }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible && !show) return null;
  const defaultMessage = type === 'online' ? 'Successfully saved!' : 'Saved offline - will sync when connected';

  return (
    <div className={`toast ${type}`} style={{ opacity: show ? 1 : 0 }}>
      <div className="toast-icon">
        <Icon name={type === 'online' ? 'cloud' : 'cloudOff'} size={20} />
        <Icon name="check" size={18} />
      </div>
      <div className="toast-content">
        <p className="toast-title">{message || defaultMessage}</p>
        {type === 'offline' && <p className="toast-message">Data stored on this device</p>}
      </div>
      <button onClick={() => { setShow(false); setTimeout(onClose, 300); }} className="toast-close">
        <Icon name="x" size={18} />
      </button>
    </div>
  );
};

const MediaGallery = () => {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const load = async () => { 
      const data = await getAllPendingMedia(); 
      setItems(data.sort((a, b) => b.createdAt - a.createdAt)); 
    };
    load();
  }, []);

  const handleDelete = async (id, url) => {
    if (url) URL.revokeObjectURL(url);
    await deletePendingMedia(id);
    setItems(prev => prev.filter(item => item.id !== id));
  };

  if (items.length === 0) {
    return (
      <div className="gallery-empty">
        <Icon name="history" size={56} className="gallery-empty-icon" />
        <p className="gallery-empty-text">No captures yet</p>
      </div>
    );
  }

  return (
    <div>
      {items.map(item => (
        <div key={item.id} className="gallery-item">
          <div className="gallery-thumb">
            {item.blobUrl ? <video src={item.blobUrl} /> : <Icon name="video" size={24} />}
          </div>
          <div className="gallery-info">
            <div className="gallery-title">
              Crop Capture
              <span className="badge pending">Pending</span>
            </div>
            <div className="gallery-meta">
              {new Date(item.createdAt).toLocaleDateString()} • {item.durationSeconds}s
            </div>
            {item.voiceTranscription && (
              <div className="gallery-desc">{item.voiceTranscription.substring(0, 60)}...</div>
            )}
          </div>
          <div className="gallery-actions">
            <button onClick={() => handleDelete(item.id, item.blobUrl)} className="gallery-btn delete">
              <Icon name="trash" size={20} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

const CaptureForm = ({ onPendingCountChange }) => {
  const { isOnline } = useOnlineStatus();
  const [videoBlob, setVideoBlob] = useState(null);
  const [videoDuration, setVideoDuration] = useState(0);
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState({ visible: false, type: 'online', message: '' });

  const handleVideoRecorded = useCallback((blob, duration) => { 
    setVideoBlob(blob); 
    setVideoDuration(duration); 
  }, []);
  
  const handleDescriptionChange = useCallback((text) => setDescription(text), []);

  const handleSubmit = async () => {
    if (!videoBlob) return;
    setIsSubmitting(true);

    const id = `capture_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const blobUrl = URL.createObjectURL(videoBlob);
    
    await savePendingMedia({
      id,
      blob: videoBlob,
      blobUrl,
      filename: `crop_${Date.now()}.webm`,
      fileType: 'video',
      mimeType: videoBlob.type,
      voiceTranscription: description || undefined,
      durationSeconds: videoDuration,
      createdAt: Date.now(),
    });

    setToast({ 
      visible: true, 
      type: isOnline ? 'online' : 'offline', 
      message: isOnline ? 'Capture saved successfully!' : 'Saved offline - will sync when online' 
    });
    
    setVideoBlob(null);
    setVideoDuration(0);
    setDescription('');
    
    const count = await getPendingCount();
    onPendingCountChange?.(count);
    setIsSubmitting(false);
  };

  return (
    <div>
      <div className="card">
        <VideoRecorder onVideoRecorded={handleVideoRecorded} maxDuration={30} />
      </div>
      
      <div className="card">
        <VoiceInput 
          onTranscriptChange={handleDescriptionChange} 
          placeholder="Describe what you observe in the crop..." 
        />
      </div>
      
      <button onClick={handleSubmit} disabled={!videoBlob || isSubmitting} className="submit-btn">
        {isSubmitting ? (
          <>
            <Icon name="loader" size={20} className="animate-spin" />
            Saving...
          </>
        ) : (
          <>
            <Icon name="send" size={20} />
            {isOnline ? 'Submit Capture' : 'Save Offline'}
          </>
        )}
      </button>
      
      <p className="hint">
        {isOnline ? 'Your capture will be saved immediately' : 'Will sync automatically when you\'re back online'}
      </p>
      
      <ConfirmationToast 
        isVisible={toast.visible} 
        type={toast.type} 
        message={toast.message} 
        onClose={() => setToast(prev => ({ ...prev, visible: false }))} 
      />
    </div>
  );
};

// ==================== MAIN APP ====================
function cropdocapp() {
  const [pendingCount, setPendingCount] = useState(0);
  const [activeTab, setActiveTab] = useState('capture');

  useEffect(() => {
    const init = async () => { 
      await initDB(); 
      const count = await getPendingCount(); 
      setPendingCount(count); 
    };
    init();
  }, []);

  return (
    <>
      <style>{styles}</style>
      <div className="app">
        <NetworkStatus pendingCount={pendingCount} isSyncing={false} />
        
        <div className="tabs-container">
          <div className="tab-list">
            <button 
              onClick={() => setActiveTab('capture')} 
              className={`tab-btn ${activeTab === 'capture' ? 'active' : ''}`}
            >
              <Icon name="camera" size={18} />
              Capture
            </button>
            <button 
              onClick={() => setActiveTab('history')} 
              className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
            >
              <Icon name="history" size={18} />
              History
            </button>
          </div>
          
          {activeTab === 'capture' && <CaptureForm onPendingCountChange={setPendingCount} />}
          {activeTab === 'history' && <div className="card"><MediaGallery /></div>}
        </div>
      </div>
    </>
  );
}

export default cropdocapp;
