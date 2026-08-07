'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Volume2, Sparkles, RefreshCw, Eye, Building, Sun, Briefcase } from 'lucide-react';

export type AvatarState = 'IDLE' | 'LISTENING' | 'THINKING' | 'SPEAKING';

export interface PersonaConfig {
  id: string;
  name: string;
  role: string;
  image: string;
}

export const PERSONAS: Record<string, PersonaConfig> = {
  maya: {
    id: 'maya',
    name: 'Maya Vance',
    role: 'Principal AI Architect & Bar Raiser',
    image: '/images/avatar/avatar_3d_female.png',
  },
  leo: {
    id: 'leo',
    name: 'Leo Sterling',
    role: 'Staff Systems Lead & AI Evaluator',
    image: '/images/avatar/avatar_3d_male.png',
  },
};

interface InterviewerAvatarProps {
  state: AvatarState;
  onReplayAudio?: () => void;
  selectedPersona?: string;
  onSelectPersona?: (personaId: string) => void;
  className?: string;
}

export default function InterviewerAvatar({
  state,
  onReplayAudio,
  selectedPersona = 'maya',
  onSelectPersona,
  className = '',
}: InterviewerAvatarProps) {
  const [personaId, setPersonaId] = useState<string>(
    selectedPersona === 'atlas' || selectedPersona === 'marcus' || selectedPersona === 'leo' ? 'leo' : 'maya'
  );
  const persona = PERSONAS[personaId] || PERSONAS.maya;

  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isBlinking, setIsBlinking] = useState(false);
  const [audioMeter, setAudioMeter] = useState<number[]>([25, 45, 60, 35, 75, 40, 80, 50]);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const isSpeaking = state === 'SPEAKING';
  const isListening = state === 'LISTENING';
  const isThinking = state === 'THINKING';

  // Synchronize persona prop
  useEffect(() => {
    if (selectedPersona) {
      const mapped = selectedPersona === 'atlas' || selectedPersona === 'marcus' || selectedPersona === 'leo' ? 'leo' : 'maya';
      if (PERSONAS[mapped]) {
        setPersonaId(mapped);
      }
    }
  }, [selectedPersona]);

  // Mouse Parallax
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    setMousePos({ x, y });
  };

  const handleMouseLeave = () => {
    setMousePos({ x: 0, y: 0 });
  };

  // Natural Eye Blinking loop
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    const scheduleBlink = () => {
      const nextDelay = 3000 + Math.random() * 3500;
      timeout = setTimeout(() => {
        setIsBlinking(true);
        setTimeout(() => {
          setIsBlinking(false);
          scheduleBlink();
        }, 140);
      }, nextDelay);
    };
    scheduleBlink();
    return () => clearTimeout(timeout);
  }, []);

  // Moving Living Office Environment Canvas (Realistic window city traffic, daylight sweeps, swaying greenery, bokeh)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = canvas.offsetWidth || 800);
    let height = (canvas.height = canvas.offsetHeight || 360);

    // Moving city traffic outside panoramic glass window
    const traffic = Array.from({ length: 18 }, () => ({
      x: Math.random() * width,
      y: height * 0.45 + Math.random() * (height * 0.25),
      speed: (Math.random() > 0.5 ? 1 : -1) * (0.6 + Math.random() * 1.4),
      length: 15 + Math.random() * 25,
      isHeadlight: Math.random() > 0.4,
      opacity: 0.25 + Math.random() * 0.45,
    }));

    // Floating office dust & ambient bokeh light motes
    const particles = Array.from({ length: 28 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: 1.5 + Math.random() * 3.5,
      speedX: -0.15 + Math.random() * 0.3,
      speedY: -0.2 - Math.random() * 0.35,
      opacity: 0.15 + Math.random() * 0.45,
      pulse: Math.random() * Math.PI * 2,
    }));

    // Swaying background monstera office plant branches
    let plantSway = 0;
    let time = 0;

    const render = () => {
      time += 0.02;
      plantSway = Math.sin(time * 0.8) * 4;
      ctx.clearRect(0, 0, width, height);

      // 1. Realistic Executive Office Wall & Panoramic Window Layout
      // Sky / City Backdrop Gradient
      const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
      skyGrad.addColorStop(0, '#1e293b'); // Twilight Slate
      skyGrad.addColorStop(0.5, '#334155');
      skyGrad.addColorStop(1, '#0f172a');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, width, height);

      // Distant City Skyline Buildings in window
      ctx.fillStyle = '#090d16';
      const buildingCount = 14;
      const bWidth = width / (buildingCount * 0.7);
      for (let i = 0; i < buildingCount; i++) {
        const bHeight = 70 + ((i * 37) % 90);
        const bx = i * bWidth * 0.8 - 20;
        const by = height * 0.7 - bHeight;
        ctx.fillRect(bx, by, bWidth * 0.75, bHeight + 50);

        // Lit building windows
        ctx.fillStyle = 'rgba(254, 240, 138, 0.25)';
        for (let wy = by + 8; wy < by + bHeight - 10; wy += 12) {
          for (let wx = bx + 6; wx < bx + bWidth * 0.75 - 6; wx += 10) {
            if ((wx + wy + i) % 3 !== 0) {
              ctx.fillRect(wx, wy, 4, 6);
            }
          }
        }
        ctx.fillStyle = '#090d16';
      }

      // 2. Moving City Traffic Lights Outside Window
      traffic.forEach((t) => {
        t.x += t.speed;
        if (t.x > width + 40) t.x = -40;
        if (t.x < -40) t.x = width + 40;

        ctx.fillStyle = t.isHeadlight
          ? `rgba(254, 240, 138, ${t.opacity})` // Warm Headlight yellow
          : `rgba(239, 68, 68, ${t.opacity})`; // Taillight red

        ctx.beginPath();
        ctx.ellipse(t.x, t.y, t.length * 0.5, 1.8, 0, 0, Math.PI * 2);
        ctx.fill();
      });

      // 3. Office Panoramic Glass Window Frames & Ambient Reflections
      ctx.fillStyle = 'rgba(15, 23, 42, 0.82)'; // Office dark glass tint
      ctx.fillRect(0, 0, width, height);

      // Architectural window mullions (Vertical & Horizontal glass dividers)
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(width * 0.33, 0, 8, height);
      ctx.fillRect(width * 0.66, 0, 8, height);
      ctx.fillRect(0, height * 0.65, width, 10);

      // 4. Moving Daylight Sweep / Sunlight Sheen on Office Window
      const sweepX = (Math.sin(time * 0.3) * 0.5 + 0.5) * width;
      const sunGrad = ctx.createLinearGradient(sweepX - 120, 0, sweepX + 120, height);
      sunGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
      sunGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.06)');
      sunGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = sunGrad;
      ctx.fillRect(0, 0, width, height);

      // 5. Swaying Indoor Monstera Plant in Office Corner
      ctx.save();
      ctx.translate(width * 0.08, height * 0.7);
      ctx.rotate((plantSway * Math.PI) / 180);
      ctx.fillStyle = 'rgba(16, 185, 129, 0.22)';
      // Big leaf 1
      ctx.beginPath();
      ctx.ellipse(0, -40, 24, 45, 0.3, 0, Math.PI * 2);
      ctx.fill();
      // Big leaf 2
      ctx.beginPath();
      ctx.ellipse(25, -25, 20, 38, -0.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // 6. Floating Ambient Dust Motes & Bokeh Particles
      particles.forEach((p) => {
        p.x += p.speedX;
        p.y += p.speedY;
        p.pulse += 0.03;

        if (p.y < -10) p.y = height + 10;
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;

        const currentOpacity = p.opacity + Math.sin(p.pulse) * 0.12;
        ctx.fillStyle = `rgba(254, 240, 138, ${Math.max(0.04, currentOpacity)})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      animId = requestAnimationFrame(render);
    };

    render();

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Harmonic Audio Equalizer Telemetry
  useEffect(() => {
    if (!isSpeaking && !isListening) return;
    const interval = setInterval(() => {
      if (isSpeaking) {
        setAudioMeter([
          Math.floor(25 + Math.random() * 65),
          Math.floor(40 + Math.random() * 55),
          Math.floor(65 + Math.random() * 35),
          Math.floor(30 + Math.random() * 70),
          Math.floor(55 + Math.random() * 45),
          Math.floor(35 + Math.random() * 60),
          Math.floor(75 + Math.random() * 25),
          Math.floor(40 + Math.random() * 55),
        ]);
      } else if (isListening) {
        setAudioMeter([
          Math.floor(15 + Math.random() * 25),
          Math.floor(20 + Math.random() * 30),
          Math.floor(25 + Math.random() * 25),
          Math.floor(18 + Math.random() * 22),
          Math.floor(22 + Math.random() * 28),
          Math.floor(16 + Math.random() * 24),
          Math.floor(20 + Math.random() * 20),
          Math.floor(15 + Math.random() * 15),
        ]);
      }
    }, 85);
    return () => clearInterval(interval);
  }, [isSpeaking, isListening]);

  const handleSelectPersona = (id: string) => {
    setPersonaId(id);
    if (onSelectPersona) onSelectPersona(id);
  };

  // 3D Mouse Parallax values
  const tiltY = mousePos.x * 6 + (isThinking ? 4 : isListening ? -2 : 0);
  const tiltX = -mousePos.y * 4 + (isListening ? 3 : 0);
  const shiftX = mousePos.x * 4;
  const shiftY = mousePos.y * 3;

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`flex flex-col items-center justify-center w-full select-none ${className}`}
    >
      {/* Main Card */}
      <div className="relative group w-full rounded-3xl shadow-[0_16px_45px_rgba(0,0,0,0.5)] border border-slate-700/80 backdrop-blur-2xl overflow-hidden bg-slate-950/90 transition-all duration-300">
        {/* Living Moving Office Canvas Backdrop */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full object-cover pointer-events-none z-0 opacity-95"
        />

        {/* Ambient Glow Halos */}
        <div
          className={`absolute -inset-1 rounded-3xl opacity-35 blur-3xl transition-all duration-700 pointer-events-none ${
            isSpeaking
              ? 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-55 animate-pulse'
              : isListening
              ? 'bg-gradient-to-r from-emerald-500 to-teal-500 opacity-45'
              : isThinking
              ? 'bg-gradient-to-r from-amber-500 to-orange-500 opacity-45 animate-pulse'
              : 'bg-indigo-900/25'
          }`}
        />

        {/* Top Control Header Bar */}
        <div className="relative z-20 flex items-center justify-between gap-2 px-4 py-2.5 border-b border-white/10 bg-slate-950/70 backdrop-blur-md">
          {/* Identity & Status */}
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <span
                className={`w-2.5 h-2.5 rounded-full block ${
                  isSpeaking
                    ? 'bg-indigo-400 animate-ping'
                    : isListening
                    ? 'bg-emerald-400 animate-pulse'
                    : isThinking
                    ? 'bg-amber-400 animate-bounce'
                    : 'bg-emerald-400'
                }`}
              />
              <span
                className={`absolute inset-0 w-2.5 h-2.5 rounded-full block ${
                  isSpeaking
                    ? 'bg-indigo-400'
                    : isListening
                    ? 'bg-emerald-400'
                    : isThinking
                    ? 'bg-amber-400'
                    : 'bg-emerald-400'
                }`}
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black text-white tracking-tight flex items-center gap-1.5">
                  {persona.name}
                  <span className="text-[9px] uppercase font-black bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                    <Briefcase size={9} /> Live Office
                  </span>
                </h3>
              </div>
              <p className="text-[10px] text-slate-300 font-medium truncate max-w-[160px] md:max-w-none">
                {persona.role}
              </p>
            </div>
          </div>

          {/* Right Persona Switcher & Repeat Button */}
          <div className="flex items-center gap-1.5">
            {/* Persona Switcher */}
            <div className="bg-slate-900/90 p-0.5 rounded-xl border border-slate-700/80 flex items-center gap-0.5 shadow-inner">
              <button
                type="button"
                onClick={() => handleSelectPersona('maya')}
                className={`px-2 py-1 rounded-lg text-[11px] font-black transition-all flex items-center gap-1 ${
                  personaId === 'maya'
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-600/40'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
                title="Maya Vance (AI Lead)"
              >
                Maya
              </button>
              <button
                type="button"
                onClick={() => handleSelectPersona('leo')}
                className={`px-2 py-1 rounded-lg text-[11px] font-black transition-all flex items-center gap-1 ${
                  personaId === 'leo'
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-600/40'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
                title="Leo Sterling (Systems Lead)"
              >
                Leo
              </button>
            </div>

            {/* Repeat Last Spoken Audio */}
            {onReplayAudio && (
              <button
                type="button"
                onClick={onReplayAudio}
                className="p-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700/80 transition-all shadow-sm flex items-center gap-1 text-[11px] font-bold"
                title="Replay last question"
              >
                <RefreshCw size={12} className={isSpeaking ? 'animate-spin' : ''} />
                <span className="hidden sm:inline">Repeat</span>
              </button>
            )}
          </div>
        </div>

        {/* Center Stage: Character Portrait with Dynamic Natural Speaking & Real Office Backdrop */}
        <div className="relative flex flex-row items-center justify-center gap-4 z-10 p-3.5">
          {/* Portrait Frame with Mouse Parallax & Natural Breathing */}
          <div
            className="relative w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36 shrink-0 rounded-2xl overflow-hidden shadow-[0_12px_30px_rgba(0,0,0,0.7)] border-2 border-indigo-500/40 bg-slate-950/80 group/portrait"
            style={{
              perspective: 700,
            }}
          >
            {/* Parallax Head Container */}
            <div
              className="relative w-full h-full transition-transform duration-200 ease-out"
              style={{
                transform: `rotateY(${tiltY}deg) rotateX(${tiltX}deg) translate3d(${shiftX}px, ${shiftY}px, 0px)`,
                transformStyle: 'preserve-3d',
              }}
            >
              {/* High-Resolution 3D Stylized Pixar Character */}
              <img
                src={persona.image}
                alt={persona.name}
                className={`w-full h-full object-cover object-center select-none pointer-events-none transition-all duration-300 ${
                  isSpeaking ? 'scale-105 brightness-105' : isListening ? 'scale-[1.02] brightness-100' : 'scale-100'
                }`}
              />

              {/* Natural Speaking Cadence Glow Ring when speaking */}
              {isSpeaking && (
                <div className="absolute inset-0 bg-gradient-to-t from-indigo-600/20 via-transparent to-transparent pointer-events-none animate-pulse" />
              )}

              {/* Natural Eye Blinking Overlay */}
              {isBlinking && (
                <div
                  className="absolute pointer-events-none transition-opacity duration-75"
                  style={{
                    top: personaId === 'maya' ? '36.8%' : '36.5%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '34%',
                    height: '11%',
                  }}
                >
                  <div
                    className="w-full h-full rounded-full blur-[0.4px]"
                    style={{
                      backgroundColor: personaId === 'maya' ? '#fedac7' : '#f3caa7',
                      opacity: 0.98,
                      boxShadow: '0 2px 4px rgba(0,0,0,0.3) inset',
                    }}
                  />
                </div>
              )}
            </div>

            {/* Status Pill on Bottom of Portrait */}
            <div className="absolute bottom-2.5 inset-x-2.5 flex items-center justify-between px-3 py-1.5 rounded-2xl bg-slate-950/85 backdrop-blur-md border border-white/10 z-30">
              <div className="flex items-center gap-2">
                <span
                  className={`w-2 h-2 rounded-full ${
                    isSpeaking
                      ? 'bg-indigo-400 animate-ping'
                      : isListening
                      ? 'bg-emerald-400 animate-pulse'
                      : isThinking
                      ? 'bg-amber-400 animate-spin'
                      : 'bg-emerald-400'
                  }`}
                />
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-200">
                  {isSpeaking
                    ? 'Interviewer Speaking'
                    : isListening
                    ? 'Listening...'
                    : isThinking
                    ? 'Evaluating...'
                    : 'Active'}
                </span>
              </div>

              {/* Mini voice visualizer */}
              <div className="flex items-end gap-0.5 h-3">
                {audioMeter.slice(0, 5).map((height, i) => (
                  <span
                    key={i}
                    className={`w-0.5 rounded-full transition-all duration-75 ${
                      isSpeaking
                        ? 'bg-indigo-400'
                        : isListening
                        ? 'bg-emerald-400'
                        : 'bg-slate-600'
                    }`}
                    style={{ height: `${Math.min(100, Math.max(15, height))}%` }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Right Info Section with Live Telemetry */}
          <div className="flex-1 flex flex-col justify-center text-left space-y-3 w-full">
            <div className="bg-slate-900/75 rounded-2xl p-4 border border-slate-800/80 backdrop-blur-md shadow-inner">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-black text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles size={13} className="text-indigo-400 animate-pulse" />
                  Executive Interview Stage
                </span>
                <span className="text-[10px] font-mono text-emerald-300 bg-emerald-950/70 px-2 py-0.5 rounded border border-emerald-700/50 flex items-center gap-1">
                  <Building size={11} /> Real Office Environment
                </span>
              </div>
              <p className="text-xs md:text-sm text-slate-200 leading-relaxed font-medium">
                {isSpeaking ? (
                  <span className="text-indigo-300 font-semibold animate-pulse">
                    🎙️ {persona.name} is speaking and presenting the technical interview question.
                  </span>
                ) : isListening ? (
                  <span className="text-emerald-300 font-semibold">
                    👂 Attentively analyzing your voice responses in real time.
                  </span>
                ) : isThinking ? (
                  <span className="text-amber-300 font-semibold">
                    ⚡ Calculating response depth and engineering criteria...
                  </span>
                ) : (
                  <span className="text-slate-300">
                    Ready for your answer. Click the Big &quot;Start Speaking&quot; button below or type your response.
                  </span>
                )}
              </p>
            </div>

            {/* Voice Resonance Equalizer */}
            <div className="flex items-center gap-3 bg-slate-950/75 px-4 py-2.5 rounded-2xl border border-slate-800/80 backdrop-blur-md">
              <div className="text-xs text-slate-400 font-semibold shrink-0 flex items-center gap-1.5">
                <Volume2 size={15} className={isSpeaking ? 'text-indigo-400 animate-bounce' : 'text-slate-500'} />
                Voice Activity:
              </div>
              <div className="flex-1 flex items-center gap-1 h-3.5">
                {audioMeter.map((val, idx) => {
                  return (
                    <div
                      key={idx}
                      className={`flex-1 rounded-full transition-all duration-100 ${
                        isSpeaking
                          ? 'bg-gradient-to-t from-indigo-500 via-purple-500 to-pink-400'
                          : isListening
                          ? 'bg-emerald-400/80'
                          : 'bg-slate-700/60'
                      }`}
                      style={{ height: `${val}%` }}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
