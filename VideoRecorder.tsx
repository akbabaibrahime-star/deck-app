import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { CloseIcon, ArrowPathIcon, PlayIcon, ArrowDownTrayIcon, CameraIcon as VideoIcon, PhotographIcon } from './Icons';

interface CameraViewProps {
  onClose: () => void;
  onSave: (mediaDataUrl: string, mediaBlob: Blob, mediaType: 'photo' | 'video') => void;
  initialMode: 'photo' | 'video';
}

const MAX_RECORDING_TIME = 15; // in seconds

export const VideoRecorder: React.FC<CameraViewProps> = ({ onClose, onSave, initialMode }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<number | null>(null);
  const previewVideoRef = useRef<HTMLVideoElement>(null);

  const [mode, setMode] = useState<'photo' | 'video'>(initialMode);
  const [cameraState, setCameraState] = useState<'idle' | 'recording' | 'preview'>('idle');
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [mediaBlob, setMediaBlob] = useState<Blob | null>(null);
  const [timer, setTimer] = useState(0);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isPreviewPaused, setIsPreviewPaused] = useState(true);

  // Zoom state
  const [zoomCapabilities, setZoomCapabilities] = useState<{ min: number, max: number, step: number } | null>(null);
  const [zoom, setZoom] = useState(1);

  const cleanupStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  const initializeStream = useCallback(async () => {
    cleanupStream();
    setError(null);
    setIsInitialized(false);
    setZoomCapabilities(null);
    setZoom(1);

    const videoConstraints = {
        facingMode,
        width: { ideal: 1920 },
        height: { ideal: 1080 },
        frameRate: { ideal: 30 }
    };

    try {
      let stream;
      if (mode === 'video') {
        try {
          stream = await navigator.mediaDevices.getUserMedia({ video: videoConstraints, audio: true });
        } catch (err) {
          console.warn("getUserMedia with audio+video failed in recorder, trying video-only:", err);
          if (err instanceof DOMException && (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError' || err.name === 'NotReadableError' || err.name === 'TrackStartError')) {
            stream = await navigator.mediaDevices.getUserMedia({ video: videoConstraints, audio: false });
          } else {
            throw err;
          }
        }
      } else {
        stream = await navigator.mediaDevices.getUserMedia({ video: { ...videoConstraints }, audio: false });
      }

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      streamRef.current = stream;

      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack && 'zoom' in videoTrack.getCapabilities()) {
        const capabilities = videoTrack.getCapabilities();
        const zoomCaps = (capabilities as any).zoom;
        if (zoomCaps) {
            setZoomCapabilities({ min: zoomCaps.min, max: zoomCaps.max, step: zoomCaps.step });
            setZoom((videoTrack.getSettings() as any).zoom || 1);
        }
      }
      setIsInitialized(true);
    } catch (err) {
      console.error("Error accessing camera:", err);
      setError("Kamera erişimi reddedildi. Lütfen tarayıcı izinlerinizi kontrol edin.");
    }
  }, [facingMode, cleanupStream, mode]);

  useEffect(() => {
    initializeStream();
    return () => {
      cleanupStream();
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [initializeStream, cleanupStream]);
  
  const zoomStops = useMemo(() => {
    if (!zoomCapabilities) return [];
    const { min, max } = zoomCapabilities;
    const stops: { value: number; label: string }[] = [];

    if (min <= 0.5) stops.push({ value: 0.5, label: '0,5x' });
    if (min <= 1 && max >= 1) stops.push({ value: 1, label: '1x' });
    if (min <= 1.5 && max >= 1.5) stops.push({ value: 1.5, label: '1,5x' });
    if (min <= 2 && max >= 2) stops.push({ value: 2, label: '2x' });

    const uniqueStops = Array.from(new Map(stops.map(s => [s.label, s])).values());
    
    return uniqueStops.length > 1 ? uniqueStops : [];
  }, [zoomCapabilities]);


  const handleZoomChange = (newZoom: number) => {
    if (!streamRef.current || !zoomCapabilities) return;
    const videoTrack = streamRef.current.getVideoTracks()[0];
    if (videoTrack) {
        videoTrack.applyConstraints({ advanced: [{ zoom: newZoom } as any] })
            .then(() => setZoom(newZoom))
            .catch(err => console.error("Zoom failed:", err));
    }
  };

  const handleTakePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Flip image if front camera is used
      if (facingMode === 'user') {
          ctx.translate(canvas.width, 0);
          ctx.scale(-1, 1);
      }
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg');
      canvas.toBlob((blob) => {
        if (blob) {
          setMediaUrl(dataUrl);
          setMediaBlob(blob);
          setCameraState('preview');
          cleanupStream();
        }
      }, 'image/jpeg');
    }
  };

  const startRecording = () => {
    if (!streamRef.current) return;
    const stream = streamRef.current;
    
    recordedChunksRef.current = [];
    const options = { mimeType: 'video/webm; codecs=vp9', videoBitsPerSecond : 2500000 };
    try {
        mediaRecorderRef.current = new MediaRecorder(stream, options);
    } catch (e) {
        console.warn("High quality codec not supported, falling back.");
        mediaRecorderRef.current = new MediaRecorder(stream);
    }
    
    mediaRecorderRef.current.ondataavailable = (event) => { if (event.data.size > 0) recordedChunksRef.current.push(event.data); };
    
    mediaRecorderRef.current.onstop = () => {
      const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
      setMediaBlob(blob);
      setMediaUrl(URL.createObjectURL(blob));
      setCameraState('preview');
      setIsPreviewPaused(false);
      cleanupStream();
    };
    
    mediaRecorderRef.current.start();
    setCameraState('recording');
    setTimer(0);
    timerIntervalRef.current = window.setInterval(() => {
      setTimer(prev => {
        if (prev >= MAX_RECORDING_TIME - 1) {
          stopRecording();
          return MAX_RECORDING_TIME;
        }
        return prev + 1;
      });
    }, 1000);
  };
  
  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') mediaRecorderRef.current.stop();
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    timerIntervalRef.current = null;
  };

  const handleMainButton = () => {
    if (mode === 'photo') handleTakePhoto();
    else { if (cameraState === 'recording') stopRecording(); else startRecording(); }
  };

  const handleRetake = () => {
    if (mediaUrl && mediaUrl.startsWith('blob:')) URL.revokeObjectURL(mediaUrl);
    setMediaUrl(null);
    setMediaBlob(null);
    setTimer(0);
    initializeStream();
    setCameraState('idle');
  };

  const handleSave = () => { if (mediaUrl && mediaBlob) onSave(mediaUrl, mediaBlob, mode); };

  const toggleMode = (newMode: 'photo' | 'video') => {
    if (mode === newMode || cameraState !== 'idle') return;
    setMode(newMode);
    initializeStream();
  };
  
  const togglePreviewPlay = () => {
    const video = previewVideoRef.current; if (!video) return;
    if (video.paused) { video.play(); setIsPreviewPaused(false); }
    else { video.pause(); setIsPreviewPaused(true); }
  };

  const handleSwitchCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  return (
    <div className="fixed inset-0 bg-black z-[80] flex flex-col animate-fadeIn">
      <header className="absolute top-0 left-0 right-0 p-4 flex justify-end items-center z-20">
        <button onClick={onClose} className="p-2 rounded-full bg-black/40 hover:bg-black/60"><CloseIcon className="w-6 h-6" /></button>
      </header>

      <main className="flex-grow relative flex items-center justify-center bg-black overflow-hidden">
        {error && <div className="absolute inset-0 flex items-center justify-center text-center text-red-400 p-4 z-20">{error}</div>}
        {!isInitialized && !error && <div className="absolute inset-0 flex items-center justify-center z-20"><div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin"></div></div>}

        <video ref={videoRef} className={`w-full h-full object-cover transition-opacity duration-300 ${cameraState === 'preview' || !isInitialized ? 'opacity-0' : 'opacity-100'}`} autoPlay muted playsInline />
        
        {cameraState === 'preview' && mediaUrl && (
          <div className="absolute inset-0" onClick={mode === 'video' ? togglePreviewPlay : undefined}>
            {mode === 'photo' ? (
              <img src={mediaUrl} alt="Preview" className="w-full h-full object-contain" />
            ) : (
              <>
                <video ref={previewVideoRef} key={mediaUrl} src={mediaUrl} className="w-full h-full object-cover" autoPlay loop onPlay={() => setIsPreviewPaused(false)} onPause={() => setIsPreviewPaused(true)} />
                {isPreviewPaused && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 pointer-events-none">
                    <div className="bg-black/50 p-4 rounded-full"><PlayIcon className="w-12 h-12 text-white" /></div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {cameraState === 'recording' && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 flex justify-between items-center text-white">
            <div className="flex items-center gap-2 bg-black/50 p-2 rounded-full">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <span className="font-mono text-sm">{String(timer).padStart(2, '0')}:{String(MAX_RECORDING_TIME).padStart(2, '0')}</span>
            </div>
          </div>
        )}
      </main>
      
      <footer className="absolute bottom-0 left-0 right-0 p-6 flex flex-col items-center justify-end gap-5 z-10 bg-gradient-to-t from-black/80 to-transparent">
        {cameraState === 'preview' ? (
          <div className="flex justify-between items-center w-full max-w-sm animate-fadeIn">
            <button onClick={handleRetake} className="font-semibold text-lg px-6 py-3 rounded-lg hover:bg-white/10">Tekrar Çek</button>
            <button onClick={handleSave} className="font-bold text-lg bg-blue-600 px-8 py-3 rounded-lg hover:bg-blue-700">{mode === 'photo' ? 'Fotoğrafı Kullan' : 'Videoyu Kullan'}</button>
          </div>
        ) : (
          <div className="w-full flex flex-col items-center gap-5">
            {mode === 'photo' && zoomStops.length > 0 && (
                <div className="flex justify-center items-center gap-2 bg-black/40 backdrop-blur-sm p-1 rounded-full">
                    {zoomStops.map(stop => {
                        const isActive = Math.abs(zoom - stop.value) < (zoomCapabilities?.step || 0.1); 
                        return (
                            <button
                                key={stop.label}
                                onClick={() => handleZoomChange(stop.value)}
                                className={`w-10 h-10 flex items-center justify-center rounded-full text-xs font-bold transition-colors ${
                                    isActive ? 'bg-white text-black' : 'text-white'
                                }`}
                            >
                                {stop.label}
                            </button>
                        )
                    })}
                </div>
            )}
            <div className="flex justify-between items-center w-full max-w-xs">
                <button onClick={handleSwitchCamera} className="p-3 bg-white/20 rounded-full hover:bg-white/30 disabled:opacity-50" disabled={cameraState === 'recording'}>
                    <ArrowPathIcon className="w-6 h-6" />
                </button>
                <button onClick={handleMainButton} className={`flex items-center justify-center ${mode === 'photo' ? 'w-16 h-16 border-4 border-white rounded-full' : 'w-20 h-20 border-4 border-white rounded-full'}`}>
                    <div className={`transition-all duration-200 ${mode === 'photo' ? 'w-14 h-14 bg-white rounded-full' : (cameraState === 'recording' ? 'w-8 h-8 bg-red-500 rounded-md' : 'w-16 h-16 bg-red-500 rounded-full')}`}></div>
                </button>
                <div className="w-12 h-12"></div>
            </div>
             <div className="flex justify-center items-center gap-6">
                <button onClick={() => toggleMode('video')} className={`font-semibold text-lg transition-colors ${mode === 'video' ? 'text-white' : 'text-gray-500'}`}>VİDEO</button>
                <button onClick={() => toggleMode('photo')} className={`font-semibold text-lg transition-colors ${mode === 'photo' ? 'text-white' : 'text-gray-500'}`}>FOTOĞRAF</button>
            </div>
          </div>
        )}
      </footer>
       <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out forwards; }
      `}</style>
    </div>
  );
};
