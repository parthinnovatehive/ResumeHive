"use client";

import { motion, useScroll, useTransform, animate, useMotionValue } from "framer-motion";
import { FileText, Cpu, Zap, Globe, Briefcase, Video, Sparkles } from "lucide-react";
import { useRef, useEffect, useState } from "react";
import Image from "next/image";

// Helper component for looping numbers
const LoopingNumber = ({ from, to, suffix, duration = 3 }: { from: number, to: number, suffix: string, duration?: number }) => {
  const count = useMotionValue(from);
  const [display, setDisplay] = useState(from);

  useEffect(() => {
    const controls = animate(count, to, {
      duration: duration,
      ease: "easeInOut",
      repeat: Infinity,
      repeatType: "reverse",
      onUpdate: (latest) => setDisplay(Math.round(latest))
    });
    return controls.stop;
  }, [count, from, to, duration]);

  return <>{display}{suffix}</>;
};

export function FloatingWorkflow() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  // Ambient cinematic camera movement tied to scroll
  const cameraRotateX = useTransform(scrollYProgress, [0, 1], [20, -10]);
  const cameraRotateY = useTransform(scrollYProgress, [0, 1], [-20, 20]);
  const cameraZ = useTransform(scrollYProgress, [0, 1], [-150, 100]);

  const nodes = [
    { id: "resume", label: "Resume Builder", icon: FileText, x: -35, y: -30, color: "blue", countFrom: 92, countTo: 98, suffix: "%", image: "/images/hero/resume.jpg" },
    { id: "ats", label: "ATS Engine", icon: Cpu, x: -20, y: 35, color: "emerald", countFrom: 85, countTo: 99, suffix: "%", image: "/images/hero/ats.jpg" },
    { id: "linkedin", label: "LinkedIn Opt.", icon: Globe, x: 35, y: -25, color: "cyan", countFrom: 120, countTo: 345, suffix: "+", image: "/images/hero/linkedin.jpg" },
    { id: "coding", label: "Coding Sandbox", icon: Zap, x: -10, y: -45, color: "amber", countFrom: 12, countTo: 1, suffix: "", image: "/images/hero/coding.jpg" },
    { id: "interview", label: "Mock Interview", icon: Video, x: 25, y: 40, color: "rose", countFrom: 70, countTo: 96, suffix: "%", image: "/images/hero/interview.jpg" },
    { id: "jobs", label: "Job Matches", icon: Briefcase, x: 45, y: 10, color: "indigo", countFrom: 5, countTo: 42, suffix: "", image: "/images/hero/jobs.jpg" },
  ];

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        });
      }
    };
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="relative w-full h-[600px] lg:h-[800px] flex items-center justify-center perspective-[2500px] z-10 pointer-events-none"
    >
      <motion.div 
        className="absolute inset-0 w-full h-full transform-style-preserve-3d flex items-center justify-center"
        style={{ 
          rotateX: cameraRotateX,
          rotateY: cameraRotateY,
          z: cameraZ
        }}
        // Continuous slow ambient rotation of the entire scene
        animate={{
          rotateZ: [0, 1.5, -1.5, 0],
        }}
        transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
      >
        
        {/* SVG Data Flow Paths - Ambient organic curves */}
        <svg className="absolute inset-0 w-full h-full overflow-visible" style={{ zIndex: 0 }}>
          <defs>
            <filter id="ambient-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="8" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
            <linearGradient id="ambient-line" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.05)" />
              <stop offset="50%" stopColor="rgba(255,255,255,0.25)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0.05)" />
            </linearGradient>
          </defs>
          
          {nodes.map((node, i) => {
            const startX = dimensions.width / 2;
            const startY = dimensions.height / 2;
            const endX = startX + (node.x / 100) * dimensions.width;
            const endY = startY + (node.y / 100) * dimensions.height;
            // Smooth organic bezier curves
            const cp1X = startX + (endX - startX) * 0.4 + (i % 2 === 0 ? 100 : -100);
            const cp1Y = startY + (endY - startY) * 0.1 - 60;
            const cp2X = startX + (endX - startX) * 0.6;
            const cp2Y = endY + 60;
            const pathD = `M ${startX} ${startY} C ${cp1X} ${cp1Y}, ${cp2X} ${cp2Y}, ${endX} ${endY}`;
            
            return (
              <g key={`ambient-path-${i}`}>
                <path d={pathD} fill="none" stroke="url(#ambient-line)" strokeWidth="1.5" />
                
                {/* Glowing data traveling along the path */}
                <motion.circle
                  r="2.5"
                  fill="#fff"
                  filter="url(#ambient-glow)"
                  animate={{ offsetDistance: ["0%", "100%"] }}
                  transition={{ 
                    duration: 5 + i * 0.5, 
                    repeat: Infinity, 
                    ease: "linear", 
                    delay: i * 1.2 
                  }}
                  style={{ offsetPath: `path('${pathD}')` }}
                />
              </g>
            );
          })}
        </svg>

        {/* Central AI Neural Core - VisionOS Style */}
        <motion.div 
          className="absolute z-20 flex flex-col items-center justify-center"
          animate={{ scale: [1, 1.03, 1], opacity: [0.8, 1, 0.8] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="relative w-36 h-36 lg:w-44 lg:h-44 rounded-full flex items-center justify-center overflow-hidden shadow-[0_0_80px_rgba(59,130,246,0.2)]">
            {/* Deep Glass Background */}
            <div className="absolute inset-0 bg-white/5 dark:bg-white/5 backdrop-blur-3xl rounded-full border border-white/20 dark:border-white/10" />
            
            {/* Soft Ambient Core Glow */}
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/30 via-purple-500/30 to-emerald-500/30 mix-blend-screen rounded-full" />
            
            {/* Neural Pulse Rings */}
            <motion.div animate={{ rotate: 360, scale: [1, 1.05, 1] }} transition={{ duration: 40, repeat: Infinity, ease: "linear" }} className="absolute inset-3 rounded-full border border-white/20" />
            <motion.div animate={{ rotate: -360, scale: [1, 1.1, 1] }} transition={{ duration: 35, repeat: Infinity, ease: "linear" }} className="absolute inset-6 rounded-full border border-white/10 border-t-white/40" />
            <motion.div animate={{ rotate: 180, scale: [0.9, 1, 0.9] }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} className="absolute inset-8 rounded-full border border-dashed border-white/10" />
            
            {/* Core Light Bloom */}
            <motion.div 
              animate={{ opacity: [0.5, 0.9, 0.5] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-0 bg-blue-400/40 blur-[40px] rounded-full" 
            />
            
            <Sparkles className="w-12 h-12 text-white/90 relative z-10 drop-shadow-[0_0_20px_rgba(255,255,255,0.9)]" strokeWidth={1.5} />
          </div>
        </motion.div>

        {/* Floating VisionOS Glass Cards with Premium Imagery */}
        {nodes.map((node, i) => {
          return (
            <motion.div
              key={node.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 2.5, delay: i * 0.2 + 1 }}
              className="absolute z-30"
              style={{
                x: `${node.x}vw`,
                y: `${node.y}vh`,
                translateZ: i % 2 === 0 ? 100 : 150 // Deep perspective
              }}
            >
              {/* Continuous Ambient Float & Breathe */}
              <motion.div
                animate={{ 
                  y: [0, -20, 0],
                  rotateX: [0, 8, 0],
                  rotateY: [0, -8, 0]
                }}
                transition={{ 
                  duration: 10 + i * 2, 
                  repeat: Infinity, 
                  ease: "easeInOut", 
                  delay: i * 0.7 
                }}
                className="relative"
              >
                {/* VisionOS Material Card with Embedded Image */}
                <div className="relative rounded-3xl bg-white/10 dark:bg-white/5 backdrop-blur-2xl border border-white/30 dark:border-white/20 shadow-[0_40px_80px_rgba(0,0,0,0.2)] w-56 overflow-hidden group">
                  
                  {/* Generated Image Background with Blend */}
                  <div className="absolute inset-0 opacity-40 mix-blend-overlay dark:opacity-30">
                    <Image 
                      src={node.image}
                      alt={node.label}
                      fill
                      className="object-cover transition-transform duration-[10s] group-hover:scale-110 ease-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  </div>

                  {/* Inner Edge Highlight */}
                  <div className="absolute inset-0 rounded-3xl border border-white/40 mix-blend-overlay pointer-events-none z-10" />
                  
                  {/* Ambient Card Light Sweep */}
                  <motion.div 
                    className="absolute -inset-[150%] bg-gradient-to-tr from-transparent via-white/10 to-transparent rotate-45 z-10"
                    animate={{ translateX: ["-100%", "200%"] }}
                    transition={{ duration: 8 + i, repeat: Infinity, ease: "linear", delay: i }}
                  />

                  {/* Card Content */}
                  <div className="relative z-20 p-5">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-[inset_0_0_10px_rgba(255,255,255,0.2)]">
                        <node.icon className="w-5 h-5 text-white drop-shadow-md" strokeWidth={2} />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-white drop-shadow-md">{node.label}</h3>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-white/20 flex justify-between items-end">
                      {/* Live Looping Value */}
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-bold tracking-tighter text-white drop-shadow-lg">
                          <LoopingNumber from={node.countFrom} to={node.countTo} suffix={node.suffix} duration={5 + i} />
                        </span>
                      </div>
                      {/* Pulsing indicator */}
                      <motion.div 
                        animate={{ scale: [1, 1.8, 1], opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 2.5, repeat: Infinity }}
                        className="w-2 h-2 rounded-full bg-emerald-400 mb-2 shadow-[0_0_10px_rgba(52,211,153,0.9)]" 
                      />
                    </div>
                  </div>
                </div>
                
                {/* Ambient Soft Shadow */}
                <div className="absolute -bottom-8 left-6 right-6 h-8 bg-black/30 dark:bg-black/60 blur-2xl rounded-full pointer-events-none" />
              </motion.div>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
