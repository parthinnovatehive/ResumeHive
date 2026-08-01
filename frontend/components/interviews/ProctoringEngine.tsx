'use client';
import { useEffect, useRef, useState } from 'react';
import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';
import { api } from '@/lib/api/client';

interface ProctoringEngineProps {
  sessionId: string;
}

export default function ProctoringEngine({ sessionId }: ProctoringEngineProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const faceLandmarkerRef = useRef<FaceLandmarker | null>(null);
  
  // Throttle state
  const lastCheckTimeRef = useRef(0);
  const flagHistoryRef = useRef<Record<string, number>>({});
  
  const sendFlag = async (flagType: string) => {
    const now = Date.now();
    const lastSent = flagHistoryRef.current[flagType] || 0;
    
    // Debounce: 20 seconds between same flag types
    if (now - lastSent < 20000) return;
    
    flagHistoryRef.current[flagType] = now;
    
    try {
      // NOTE ON PRIVACY:
      // Only the string flagType (e.g. "LOOKING_AWAY") is sent to the backend.
      // No video frames, audio, or biometric data are transmitted or stored.
      await api.post(`/interview/sessions/${sessionId}/flag`, {
        flag_type: flagType,
        timestamp: new Date().toISOString()
      });
    } catch (e) {
      console.error("Failed to send flag", e);
    }
  };

  useEffect(() => {
    let stream: MediaStream | null = null;
    let requestAnimationFrameId: number;
    let isComponentMounted = true;

    const setupCameraAndProctoring = async () => {
      try {
        // 1. Setup Camera
        stream = await navigator.mediaDevices.getUserMedia({ video: { width: 320, height: 240 } });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.warn("Camera permission denied.");
        setPermissionDenied(true);
        setIsInitializing(false);
        sendFlag("CAMERA_UNAVAILABLE");
        return;
      }

      // 2. Setup MediaPipe
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
        );
        const faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
            delegate: "GPU"
          },
          outputFaceBlendshapes: true,
          runningMode: "VIDEO",
          numFaces: 2
        });
        
        faceLandmarkerRef.current = faceLandmarker;
        setIsInitializing(false);
      } catch (err) {
        console.error("Failed to initialize MediaPipe", err);
        setIsInitializing(false);
        return;
      }

      // 3. Start Detection Loop
      const detectFaces = () => {
        if (!isComponentMounted) return;
        
        const video = videoRef.current;
        if (video && video.readyState >= 2 && faceLandmarkerRef.current) {
          const now = Date.now();
          
          // Throttle detection to ~1 frame per second to save CPU
          if (now - lastCheckTimeRef.current > 1000) {
             lastCheckTimeRef.current = now;
             const results = faceLandmarkerRef.current.detectForVideo(video, performance.now());
             
             if (results.faceLandmarks) {
               const numFaces = results.faceLandmarks.length;
               
               if (numFaces === 0) {
                 sendFlag("NO_FACE_DETECTED");
               } else if (numFaces > 1) {
                 sendFlag("MULTIPLE_FACES_DETECTED");
               } else {
                 // 1 face detected. Check head pose via blendshapes if available.
                 if (results.faceBlendshapes && results.faceBlendshapes.length > 0) {
                    const blendshapes = results.faceBlendshapes[0].categories;
                    
                    // Look for eye deviation (looking away)
                    const lookLeft = blendshapes.find(b => b.categoryName === 'eyeLookOutLeft')?.score || 0;
                    const lookRight = blendshapes.find(b => b.categoryName === 'eyeLookOutRight')?.score || 0;
                    const lookUp = blendshapes.find(b => b.categoryName === 'eyeLookUpLeft')?.score || 0;
                    const lookDown = blendshapes.find(b => b.categoryName === 'eyeLookDownLeft')?.score || 0;
                    
                    // If any deviation score is unusually high, flag it
                    if (lookLeft > 0.6 || lookRight > 0.6 || lookUp > 0.6 || lookDown > 0.6) {
                        sendFlag("LOOKING_AWAY");
                    }
                 }
               }
             }
          }
        }
        requestAnimationFrameId = requestAnimationFrame(detectFaces);
      };
      
      detectFaces();
    };

    setupCameraAndProctoring();

    // 4. Tab and Fullscreen Monitoring
    const handleVisibilityChange = () => {
      if (document.hidden) {
        sendFlag("TAB_SWITCH");
      }
    };
    
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        sendFlag("FULLSCREEN_EXIT");
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      isComponentMounted = false;
      if (stream) stream.getTracks().forEach(t => t.stop());
      if (requestAnimationFrameId) cancelAnimationFrame(requestAnimationFrameId);
      if (faceLandmarkerRef.current) faceLandmarkerRef.current.close();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, [sessionId]);

  // Request fullscreen on mount
  useEffect(() => {
     const enforceFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(e => {
                console.log("Could not request fullscreen programmatically without interaction.");
            });
        }
     };
     enforceFullscreen();
  }, []);

  if (permissionDenied) {
    return (
      <div className="fixed bottom-4 right-4 w-64 bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-2xl shadow-xl z-50 text-sm">
        <strong className="block mb-1">Camera Monitoring is off</strong>
        Some interviews may require this for verification. Session is still active.
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 w-48 aspect-video bg-black rounded-2xl shadow-2xl overflow-hidden border-2 border-slate-700 z-50">
      <video 
        ref={videoRef} 
        autoPlay 
        playsInline 
        muted 
        className="w-full h-full object-cover transform scale-x-[-1]" 
      />
      
      {isInitializing && (
         <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/80 text-white">
            <span className="w-5 h-5 rounded-full border-2 border-white/20 border-t-white animate-spin mb-2" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300">Proctoring</span>
         </div>
      )}
      {!isInitializing && (
         <div className="absolute top-2 right-2 flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-2 py-1 rounded-full border border-white/10">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-bold text-white uppercase tracking-widest">Live</span>
         </div>
      )}
    </div>
  );
}
