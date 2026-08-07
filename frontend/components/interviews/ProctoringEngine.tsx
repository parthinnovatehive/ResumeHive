'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';
import { api } from '@/lib/api/client';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Mic, 
  UserCheck, 
  Camera, 
  Sparkles
} from 'lucide-react';

interface ProctoringEngineProps {
  sessionId: string;
  isActive?: boolean;
  inline?: boolean;
  className?: string;
  onViolation?: (flagType: string, tabSwitches?: number) => void;
}

export default function ProctoringEngine({ 
  sessionId, 
  isActive = true, 
  inline = false,
  className = '',
  onViolation 
}: ProctoringEngineProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const faceLandmarkerRef = useRef<FaceLandmarker | null>(null);
  const requestAnimationFrameIdRef = useRef<number | null>(null);
  const audioAnimIdRef = useRef<number | null>(null);

  const [permissionDenied, setPermissionDenied] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [micLevel, setMicLevel] = useState<number>(0);
  const [faceCount, setFaceCount] = useState<number>(1);
  const [gazeStatus, setGazeStatus] = useState<'normal' | 'away'>('normal');

  const isActiveRef = useRef(isActive);
  useEffect(() => {
    isActiveRef.current = isActive;
  }, [isActive]);

  // Comprehensive hardware camera and audio track terminator
  const stopAllMediaTracks = useCallback(() => {
    // 1. Stop all stream tracks from ref
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        try {
          track.stop();
          track.enabled = false;
        } catch (e) {
          console.warn("Error stopping media track:", e);
        }
      });
      streamRef.current = null;
    }

    // 2. Stop tracks from video element if attached
    if (videoRef.current && videoRef.current.srcObject) {
      try {
        const stream = videoRef.current.srcObject as MediaStream;
        if (stream && typeof stream.getTracks === 'function') {
          stream.getTracks().forEach(track => {
            try {
              track.stop();
              track.enabled = false;
            } catch (e) {}
          });
        }
      } catch (e) {}
      videoRef.current.srcObject = null;
    }

    // 3. Close AudioContext
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      try {
        audioContextRef.current.close();
      } catch (e) {}
      audioContextRef.current = null;
    }

    // 4. Cancel animation frames
    if (requestAnimationFrameIdRef.current) {
      cancelAnimationFrame(requestAnimationFrameIdRef.current);
      requestAnimationFrameIdRef.current = null;
    }
    if (audioAnimIdRef.current) {
      cancelAnimationFrame(audioAnimIdRef.current);
      audioAnimIdRef.current = null;
    }

    // 5. Close MediaPipe FaceLandmarker
    if (faceLandmarkerRef.current) {
      try {
        faceLandmarkerRef.current.close();
      } catch (e) {}
      faceLandmarkerRef.current = null;
    }
  }, []);

  // When isActive turns false (e.g. interview ends), immediately shut down camera
  useEffect(() => {
    if (!isActive) {
      stopAllMediaTracks();
    }
  }, [isActive, stopAllMediaTracks]);

  // Hook into browser window unload / navigation to guarantee camera turns off
  useEffect(() => {
    const handleUnload = () => {
      stopAllMediaTracks();
    };
    window.addEventListener('beforeunload', handleUnload);
    window.addEventListener('pagehide', handleUnload);
    return () => {
      window.removeEventListener('beforeunload', handleUnload);
      window.removeEventListener('pagehide', handleUnload);
    };
  }, [stopAllMediaTracks]);

  const onViolationRef = useRef(onViolation);
  useEffect(() => {
    onViolationRef.current = onViolation;
  }, [onViolation]);

  // Throttle state
  const lastCheckTimeRef = useRef(0);
  const flagHistoryRef = useRef<Record<string, number>>({});
  
  const sendFlag = useCallback(async (flagType: string) => {
    if (!isActiveRef.current) return;
    const now = Date.now();
    const lastSent = flagHistoryRef.current[flagType] || 0;
    
    // Debounce: 5 seconds between same tab switch flags, 15s for visual deviations
    const debounceMs = (flagType === 'TAB_SWITCH' || flagType === 'WINDOW_BLUR' || flagType === 'FULLSCREEN_EXIT') ? 5000 : 15000;
    if (now - lastSent < debounceMs) return;
    
    flagHistoryRef.current[flagType] = now;
    
    try {
      const res = await api.post(`/interview/sessions/${sessionId}/flag`, {
        flag_type: flagType,
        timestamp: new Date().toISOString()
      });
      if (onViolationRef.current && isActiveRef.current) {
        onViolationRef.current(flagType, res.data?.tab_switches);
      }
    } catch (e) {
      console.error("Failed to send flag", e);
    }
  }, [sessionId]);

  useEffect(() => {
    if (!isActive) return;

    let isMounted = true;

    const setupCameraAndProctoring = async () => {
      try {
        // 1. Setup Camera with high definition request
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            width: { ideal: 1280 }, 
            height: { ideal: 720 },
            facingMode: 'user'
          },
          audio: true 
        });
        
        if (!isMounted || !isActiveRef.current) {
          stream.getTracks().forEach(t => t.stop());
          return;
        }

        streamRef.current = stream;
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        // Setup live audio meter
        try {
          const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
          if (AudioContextClass) {
            const audioCtx = new AudioContextClass();
            audioContextRef.current = audioCtx;
            const source = audioCtx.createMediaStreamSource(stream);
            const analyser = audioCtx.createAnalyser();
            analyser.fftSize = 256;
            source.connect(analyser);

            const bufferLength = analyser.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);

            const checkAudio = () => {
              if (!isMounted || !analyser || !audioContextRef.current) return;
              analyser.getByteFrequencyData(dataArray);
              let sum = 0;
              for (let i = 0; i < bufferLength; i++) {
                sum += dataArray[i];
              }
              const average = sum / bufferLength;
              setMicLevel(Math.min(100, Math.round((average / 128) * 100)));
              audioAnimIdRef.current = requestAnimationFrame(checkAudio);
            };
            checkAudio();
          }
        } catch (audioErr) {
          console.warn("Audio meter setup failed:", audioErr);
        }

      } catch (err) {
        console.warn("Camera permission denied.");
        if (isMounted) {
          setPermissionDenied(true);
          setIsInitializing(false);
        }
        sendFlag("CAMERA_UNAVAILABLE");
        return;
      }

      // 2. Setup MediaPipe FaceLandmarker
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
        );
        if (!isMounted || !isActiveRef.current) return;

        const faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
            delegate: "GPU"
          },
          outputFaceBlendshapes: true,
          runningMode: "VIDEO",
          numFaces: 2
        });
        
        if (!isMounted || !isActiveRef.current) {
          faceLandmarker.close();
          return;
        }

        faceLandmarkerRef.current = faceLandmarker;
        setIsInitializing(false);
      } catch (err) {
        console.error("Failed to initialize MediaPipe", err);
        if (isMounted) setIsInitializing(false);
        return;
      }

      // 3. Detection Loop
      const detectFaces = () => {
        if (!isMounted || !isActiveRef.current) return;
        
        const video = videoRef.current;
        if (video && video.readyState >= 2 && faceLandmarkerRef.current) {
          const now = Date.now();
          
          // Throttle detection to ~1 frame per second to save CPU
          if (now - lastCheckTimeRef.current > 1000) {
            lastCheckTimeRef.current = now;
            try {
              const results = faceLandmarkerRef.current.detectForVideo(video, performance.now());
              
              if (results.faceLandmarks) {
                const numFaces = results.faceLandmarks.length;
                setFaceCount(numFaces);
                
                if (numFaces === 0) {
                  sendFlag("NO_FACE_DETECTED");
                } else if (numFaces > 1) {
                  sendFlag("MULTIPLE_FACES_DETECTED");
                } else {
                  // 1 face detected. Check gaze via blendshapes.
                  if (results.faceBlendshapes && results.faceBlendshapes.length > 0) {
                    const blendshapes = results.faceBlendshapes[0].categories;
                    
                    const lookLeft = blendshapes.find(b => b.categoryName === 'eyeLookOutLeft')?.score || 0;
                    const lookRight = blendshapes.find(b => b.categoryName === 'eyeLookOutRight')?.score || 0;
                    const lookUp = blendshapes.find(b => b.categoryName === 'eyeLookUpLeft')?.score || 0;
                    const lookDown = blendshapes.find(b => b.categoryName === 'eyeLookDownLeft')?.score || 0;
                    
                    if (lookLeft > 0.6 || lookRight > 0.6 || lookUp > 0.6 || lookDown > 0.6) {
                      setGazeStatus('away');
                      sendFlag("LOOKING_AWAY");
                    } else {
                      setGazeStatus('normal');
                    }
                  }
                }
              }
            } catch (e) {}
          }
        }
        requestAnimationFrameIdRef.current = requestAnimationFrame(detectFaces);
      };
      
      detectFaces();
    };

    setupCameraAndProctoring();

    // 4. Tab, Window Blur, and Fullscreen Monitoring
    const handleVisibilityChange = () => {
      if (!isActiveRef.current || !isMounted) return;
      if (document.hidden) {
        sendFlag("TAB_SWITCH");
      }
    };

    const handleBlur = () => {
      if (!isActiveRef.current || !isMounted) return;
      sendFlag("WINDOW_BLUR");
    };
    
    const handleFullscreenChange = () => {
      if (!isActiveRef.current || !isMounted) return;
      if (!document.fullscreenElement) {
        sendFlag("FULLSCREEN_EXIT");
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleBlur);
    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      isMounted = false;
      stopAllMediaTracks();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleBlur);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, [sessionId, isActive]);

  if (permissionDenied) {
    return (
      <div className={inline ? "w-full bg-rose-950/80 border border-rose-700/60 text-rose-200 p-4 rounded-3xl shadow-xl z-50 text-sm backdrop-blur-xl" : "fixed bottom-6 right-6 w-80 bg-rose-950/80 border border-rose-700/60 text-rose-200 p-4 rounded-3xl shadow-2xl z-50 text-sm backdrop-blur-xl"}>
        <div className="flex items-center gap-2.5 mb-1.5 font-black text-rose-400">
          <ShieldAlert size={18} />
          Camera Monitoring is Inactive
        </div>
        <p className="text-xs leading-relaxed text-rose-300">
          Camera permission was denied. The interview session is still running, but please enable your camera for verified proctored evaluation.
        </p>
      </div>
    );
  }

  return (
    <div
      className={
        inline
          ? `w-full select-none ${className}`
          : `fixed bottom-6 right-6 z-50 transition-all duration-300 w-80 md:w-96 lg:w-[400px] select-none ${className}`
      }
    >
      {/* Outer Card with Glassmorphism and Status Glow */}
      <div className={`relative bg-slate-900/95 rounded-2xl shadow-xl overflow-hidden border transition-all duration-300 ${
        micLevel > 20 
          ? 'border-indigo-500 ring-2 ring-indigo-500/30 shadow-indigo-500/20' 
          : 'border-slate-800/80'
      }`}>

        {/* Video Header Bar - Clean without mirror or collapse icons */}
        <div className="flex items-center justify-between px-3.5 py-2 bg-slate-950/85 backdrop-blur-md border-b border-white/10 text-white z-20 relative">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-sm shadow-emerald-500" />
            <span className="text-[11px] font-extrabold tracking-wide text-slate-100 flex items-center gap-1.5">
              Candidate Video Feed
            </span>
          </div>

          <span className="text-[9px] uppercase font-bold text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-full border border-slate-700">
            Proctored Stream
          </span>
        </div>

        {/* Video Canvas / Stream Area */}
        <div className={inline ? "relative aspect-[16/9] max-h-[150px] md:max-h-[170px] lg:max-h-[190px] bg-black overflow-hidden group" : "relative aspect-video bg-black overflow-hidden group"}>
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            muted 
            className="w-full h-full object-cover scale-x-[-1]"
          />

          {/* Loading / Initializing Overlay */}
          {isInitializing && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/85 text-white backdrop-blur-sm z-30">
              <span className="w-6 h-6 rounded-full border-2 border-indigo-400/20 border-t-indigo-500 animate-spin mb-2" />
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-300">
                Connecting HD Camera &amp; AI Proctor...
              </span>
            </div>
          )}

          {/* Live Proctoring & Security Tags Overlay */}
          {!isInitializing && (
            <div className="absolute top-2 left-2 flex items-center gap-1.5 z-20">
              {/* Face Tracker Status */}
              <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-extrabold backdrop-blur-md border ${
                faceCount === 1 
                  ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300 shadow-sm' 
                  : 'bg-rose-950/80 border-rose-500/50 text-rose-300 animate-pulse'
              }`}>
                <UserCheck size={11} />
                <span>{faceCount === 1 ? '1 Face Verified' : faceCount === 0 ? 'No Face Detected' : 'Multiple Faces!'}</span>
              </div>

              {/* Gaze Status */}
              {gazeStatus === 'away' && (
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-amber-950/80 border border-amber-500/50 text-amber-300 animate-bounce shadow-sm">
                  Looking Away
                </div>
              )}
            </div>
          )}

          {/* Live Microphone Audio Level Visualizer Bar */}
          <div className="absolute bottom-2 inset-x-2 flex items-center justify-between px-2.5 py-1 rounded-xl bg-slate-950/85 backdrop-blur-md border border-white/10 z-20">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-200">
              <Mic size={12} className={micLevel > 15 ? 'text-emerald-400 animate-pulse' : 'text-slate-400'} />
              <span className="text-[10px] font-bold text-slate-300">Your Mic</span>
            </div>

            {/* Dynamic Mic Level Bar */}
            <div className="flex items-center gap-1 w-20 md:w-28 h-1.5 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700">
              <div 
                className={`h-full rounded-full transition-all duration-75 ${
                  micLevel > 60 
                    ? 'bg-emerald-400 shadow-sm shadow-emerald-400' 
                    : micLevel > 15 
                    ? 'bg-indigo-400' 
                    : 'bg-slate-600'
                }`}
                style={{ width: `${Math.max(4, micLevel)}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
