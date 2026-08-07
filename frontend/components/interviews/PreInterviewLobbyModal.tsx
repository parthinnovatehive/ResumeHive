'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  Camera, 
  CameraOff, 
  Mic, 
  MicOff, 
  ShieldCheck, 
  ShieldAlert, 
  CheckCircle2, 
  X, 
  Play, 
  Loader2, 
  Sparkles, 
  Info,
  AlertTriangle,
  Lock,
  Volume2
} from 'lucide-react';

interface PreInterviewLobbyModalProps {
  category: {
    id: number;
    name: string;
    slug: string;
  };
  categoryMeta: {
    icon: any;
    color: string;
    badgeBg: string;
    badgeText: string;
    description: string;
    topics: string[];
  };
  onClose: () => void;
  onConfirmStart: () => void;
  isStarting: boolean;
}

export default function PreInterviewLobbyModal({
  category,
  categoryMeta,
  onClose,
  onConfirmStart,
  isStarting
}: PreInterviewLobbyModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioAnimIdRef = useRef<number | null>(null);

  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [cameraPermission, setCameraPermission] = useState<'pending' | 'granted' | 'denied'>('pending');
  const [micPermission, setMicPermission] = useState<'pending' | 'granted' | 'denied'>('pending');
  const [micLevel, setMicLevel] = useState<number>(0);

  const IconComponent = categoryMeta.icon;

  // Cleanup helper for media stream tracks
  const stopMediaTracks = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        try {
          track.stop();
          track.enabled = false;
        } catch (e) {}
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      try {
        audioContextRef.current.close();
      } catch (e) {}
      audioContextRef.current = null;
    }
    if (audioAnimIdRef.current) {
      cancelAnimationFrame(audioAnimIdRef.current);
      audioAnimIdRef.current = null;
    }
  };

  // Initialize camera and mic streams
  useEffect(() => {
    let isMounted = true;

    const setupMedia = async () => {
      stopMediaTracks();
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
          audio: true
        });

        if (!isMounted) {
          stream.getTracks().forEach(t => t.stop());
          return;
        }

        streamRef.current = stream;
        setCameraPermission('granted');
        setMicPermission('granted');

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        // Setup Audio Analyser for mic meter
        try {
          const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
          if (AudioCtx) {
            const audioCtx = new AudioCtx();
            audioContextRef.current = audioCtx;
            const source = audioCtx.createMediaStreamSource(stream);
            const analyser = audioCtx.createAnalyser();
            analyser.fftSize = 256;
            source.connect(analyser);

            const bufferLength = analyser.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);

            const updateMicLevel = () => {
              if (!isMounted || !analyser || !audioContextRef.current) return;
              analyser.getByteFrequencyData(dataArray);
              let sum = 0;
              for (let i = 0; i < bufferLength; i++) {
                sum += dataArray[i];
              }
              const average = sum / bufferLength;
              setMicLevel(Math.min(100, Math.round((average / 128) * 100)));
              audioAnimIdRef.current = requestAnimationFrame(updateMicLevel);
            };
            updateMicLevel();
          }
        } catch (audioErr) {
          console.warn("Audio meter setup failed in lobby:", audioErr);
        }

      } catch (err: any) {
        if (!isMounted) return;
        console.warn("Lobby media permission denied or error:", err);
        setCameraPermission('denied');
        setMicPermission('denied');
      }
    };

    setupMedia();

    return () => {
      isMounted = false;
      stopMediaTracks();
    };
  }, []);

  // Handle toggling video track
  const toggleCamera = () => {
    if (streamRef.current) {
      const videoTrack = streamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !isCameraOn;
        setIsCameraOn(!isCameraOn);
      }
    }
  };

  // Handle toggling audio track
  const toggleMic = () => {
    if (streamRef.current) {
      const audioTrack = streamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !isMicOn;
        setIsMicOn(!isMicOn);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 pt-20 md:pt-24 bg-slate-950/85 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="bg-slate-900 rounded-[32px] max-w-5xl w-full border border-slate-800 shadow-[0_25px_70px_rgba(0,0,0,0.6)] overflow-hidden flex flex-col max-h-[calc(100vh-115px)] mt-10 md:mt-14 text-white relative animate-in zoom-in-95 duration-200">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center bg-gradient-to-br ${categoryMeta.color} border border-white/10 shadow-sm`}>
              <IconComponent size={20} />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight text-white flex items-center gap-2">
                {category.name}
                <span className={`text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${categoryMeta.badgeBg}`}>
                  {categoryMeta.badgeText}
                </span>
              </h2>
              <p className="text-xs text-slate-400">Google Meet Style Hardware &amp; Security Pre-Check</p>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={isStarting}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all border border-slate-700/50 disabled:opacity-50"
            title="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Main Content Body: Left Camera & Mic Test Room | Right Rules & Permission Checklist */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
          
          {/* LEFT COLUMN: Google Meet Camera Feed & Mic Visualizer (7 cols) */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
            {/* Camera Viewport Container */}
            <div className="relative aspect-video bg-slate-950 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl flex items-center justify-center group">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover scale-x-[-1] transition-opacity duration-300 ${
                  isCameraOn && cameraPermission === 'granted' ? 'opacity-100' : 'opacity-0 absolute'
                }`}
              />

              {/* Camera Off / Permission Denied Overlay */}
              {(!isCameraOn || cameraPermission !== 'granted') && (
                <div className="flex flex-col items-center justify-center p-6 text-center text-slate-400">
                  <div className="w-16 h-16 rounded-full bg-slate-800/90 border border-slate-700 flex items-center justify-center mb-3 text-slate-300 shadow-lg">
                    <CameraOff size={28} />
                  </div>
                  <h4 className="text-sm font-bold text-slate-200 mb-1">
                    {cameraPermission === 'denied' ? 'Camera Permission Denied' : 'Camera is Turned Off'}
                  </h4>
                  <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
                    {cameraPermission === 'denied'
                      ? 'Please allow camera and mic permissions in your browser address bar to proceed.'
                      : 'Click the camera button below to enable video preview.'}
                  </p>
                </div>
              )}

              {/* GMeet Style Floating Action Pill (Bottom Center of Video) */}
              <div className="absolute bottom-4 inset-x-0 flex items-center justify-center gap-3 z-20">
                {/* Mic Toggle Button */}
                <button
                  type="button"
                  onClick={toggleMic}
                  disabled={micPermission === 'denied'}
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 shadow-lg ${
                    isMicOn && micPermission === 'granted'
                      ? 'bg-slate-800/90 hover:bg-slate-700 text-emerald-400 border border-slate-700 ring-2 ring-emerald-500/20'
                      : 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/40 ring-4 ring-rose-500/20'
                  }`}
                  title={isMicOn ? 'Mute Microphone' : 'Unmute Microphone'}
                >
                  {isMicOn && micPermission === 'granted' ? <Mic size={20} /> : <MicOff size={20} />}
                </button>

                {/* Camera Toggle Button */}
                <button
                  type="button"
                  onClick={toggleCamera}
                  disabled={cameraPermission === 'denied'}
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 shadow-lg ${
                    isCameraOn && cameraPermission === 'granted'
                      ? 'bg-slate-800/90 hover:bg-slate-700 text-emerald-400 border border-slate-700 ring-2 ring-emerald-500/20'
                      : 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/40 ring-4 ring-rose-500/20'
                  }`}
                  title={isCameraOn ? 'Turn Off Camera' : 'Turn On Camera'}
                >
                  {isCameraOn && cameraPermission === 'granted' ? <Camera size={20} /> : <CameraOff size={20} />}
                </button>
              </div>
            </div>

            {/* Mic Testing Level Bar */}
            <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-2.5 text-xs font-bold text-slate-300">
                <Volume2 size={16} className={micLevel > 15 && isMicOn ? 'text-emerald-400 animate-pulse' : 'text-slate-500'} />
                <span>Microphone Input Level</span>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-36 md:w-48 h-2.5 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700">
                  <div
                    className={`h-full rounded-full transition-all duration-75 ${
                      !isMicOn ? 'bg-slate-600' : micLevel > 60 ? 'bg-emerald-400 shadow-sm shadow-emerald-400' : 'bg-indigo-400'
                    }`}
                    style={{ width: `${!isMicOn ? 0 : Math.max(4, micLevel)}%` }}
                  />
                </div>
                <span className="text-[11px] font-mono text-slate-400 w-8 text-right">
                  {!isMicOn ? 'Muted' : `${micLevel}%`}
                </span>
              </div>
            </div>

            {/* Hardware Status Badges */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className={`p-3 rounded-2xl border flex items-center gap-2.5 ${
                cameraPermission === 'granted' && isCameraOn
                  ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
                  : 'bg-rose-950/40 border-rose-500/30 text-rose-300'
              }`}>
                {cameraPermission === 'granted' && isCameraOn ? <CheckCircle2 size={16} /> : <ShieldAlert size={16} />}
                <span className="font-semibold">
                  {cameraPermission === 'granted' && isCameraOn ? 'HD Camera Ready' : 'Camera Off'}
                </span>
              </div>

              <div className={`p-3 rounded-2xl border flex items-center gap-2.5 ${
                micPermission === 'granted' && isMicOn
                  ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
                  : 'bg-rose-950/40 border-rose-500/30 text-rose-300'
              }`}>
                {micPermission === 'granted' && isMicOn ? <CheckCircle2 size={16} /> : <ShieldAlert size={16} />}
                <span className="font-semibold">
                  {micPermission === 'granted' && isMicOn ? 'Mic Audio Active' : 'Mic Muted'}
                </span>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Instructions, Guidelines & Permission Check (5 cols) */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-5">
            <div>
              {/* Category Info */}
              <h3 className="text-xl font-extrabold text-white mb-2">{category.name}</h3>
              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                {categoryMeta.description}
              </p>

              {/* Topics Pills */}
              {categoryMeta.topics.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-5">
                  {categoryMeta.topics.map((topic, i) => (
                    <span key={i} className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-slate-800 text-indigo-300 border border-slate-700/80">
                      {topic}
                    </span>
                  ))}
                </div>
              )}

              {/* Permissions & Proctoring Rules Checklist */}
              <div className="space-y-3 bg-slate-950/90 p-4 rounded-2xl border border-slate-800 text-xs">
                <div className="text-[11px] font-black uppercase tracking-wider text-indigo-400 flex items-center gap-1.5 mb-1">
                  <ShieldCheck size={14} /> Security &amp; Anti-Cheating Protocol
                </div>

                <div className="flex items-start gap-2.5 text-slate-300">
                  <div className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0 animate-pulse" />
                  <span>
                    <strong className="text-white">Strict 3-Strike Disqualification:</strong> Tab switching, window minimization, or losing window focus will issue warning strikes.
                  </span>
                </div>

                <div className="flex items-start gap-2.5 text-slate-300">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                  <span>
                    <strong className="text-white">AI Proctor Monitoring:</strong> Face presence, multiple faces, and eye gaze tracking run continuously during the session.
                  </span>
                </div>

                <div className="flex items-start gap-2.5 text-slate-300">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                  <span>
                    <strong className="text-white">Voice &amp; Text Answers:</strong> Speak directly into your microphone or type your responses. Real-time TTS will speak questions aloud.
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 space-y-3">
              <button
                type="button"
                onClick={onConfirmStart}
                disabled={isStarting}
                className="w-full py-4 px-6 rounded-2xl font-black text-sm md:text-base bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-xl shadow-indigo-600/30 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isStarting ? (
                  <>
                    <Loader2 size={18} className="animate-spin text-white" />
                    <span>Connecting to Proctored Room...</span>
                  </>
                ) : (
                  <>
                    <Play size={18} className="fill-white" />
                    <span>Ready to Join Interview</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={onClose}
                disabled={isStarting}
                className="w-full py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-all border border-transparent hover:border-slate-700 disabled:opacity-50"
              >
                Choose Different Round
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
