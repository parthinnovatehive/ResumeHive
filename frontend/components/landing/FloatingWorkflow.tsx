"use client";

import { motion } from "framer-motion";
import { FileText, Cpu, Zap, Globe, Briefcase, Video, TrendingUp, Award } from "lucide-react";
import { useRef, useEffect, useState } from "react";

const WORKFLOW_NODES = [
  { id: "resume", label: "Resume Builder", icon: FileText, color: "from-blue-500 to-blue-600", x: 10, y: 15, delay: 0 },
  { id: "ats", label: "ATS Analysis", icon: Cpu, color: "from-emerald-400 to-emerald-500", x: 45, y: 5, delay: 0.2 },
  { id: "rewrite", label: "AI Rewrite", icon: Zap, color: "from-amber-400 to-orange-500", x: 80, y: 25, delay: 0.4 },
  { id: "linkedin", label: "LinkedIn Opt.", icon: Globe, color: "from-cyan-400 to-blue-500", x: 20, y: 50, delay: 0.6 },
  { id: "jobs", label: "Job Matching", icon: Briefcase, color: "from-indigo-400 to-purple-500", x: 60, y: 45, delay: 0.8 },
  { id: "interview", label: "Mock Interview", icon: Video, color: "from-rose-400 to-pink-500", x: 30, y: 80, delay: 1.0 },
  { id: "analytics", label: "Analytics", icon: TrendingUp, color: "from-slate-600 to-slate-800", x: 75, y: 75, delay: 1.2 },
  { id: "offer", label: "Offer Letter", icon: Award, color: "from-premium-emerald to-teal-500", x: 50, y: 95, delay: 1.4 },
];

const CONNECTIONS = [
  ["resume", "ats"],
  ["ats", "rewrite"],
  ["rewrite", "linkedin"],
  ["linkedin", "jobs"],
  ["jobs", "interview"],
  ["interview", "analytics"],
  ["analytics", "offer"],
];

export function FloatingWorkflow() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

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

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setMousePos({
      x: (e.clientX - rect.left - rect.width / 2) / 20,
      y: (e.clientY - rect.top - rect.height / 2) / 20
    });
  };

  const getNodeCoords = (node: any) => {
    return {
      x: (node.x / 100) * dimensions.width,
      y: (node.y / 100) * dimensions.height
    };
  };

  return (
    <div 
      ref={containerRef} 
      className="relative w-full h-[600px] flex items-center justify-center perspective-1000"
      onMouseMove={handleMouseMove}
    >
      <motion.div 
        className="absolute inset-0 w-full h-full transform-style-preserve-3d"
        animate={{ 
          rotateX: -mousePos.y,
          rotateY: mousePos.x
        }}
        transition={{ type: "spring", stiffness: 75, damping: 20 }}
      >
        {/* SVG Connections */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-visible">
          <defs>
            <linearGradient id="flow-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0F52BA" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#10B981" stopOpacity="0.8" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          
          {dimensions.width > 0 && CONNECTIONS.map(([startId, endId], idx) => {
            const startNode = WORKFLOW_NODES.find(n => n.id === startId);
            const endNode = WORKFLOW_NODES.find(n => n.id === endId);
            
            if (!startNode || !endNode) return null;
            
            const start = getNodeCoords(startNode);
            const end = getNodeCoords(endNode);
            
            // Generate curved path
            const controlX = (start.x + end.x) / 2 + (Math.random() * 40 - 20);
            const controlY = (start.y + end.y) / 2 + (Math.random() * 40 - 20);
            
            const pathD = `M ${start.x} ${start.y} Q ${controlX} ${controlY} ${end.x} ${end.y}`;
            
            return (
              <g key={`connection-${startId}-${endId}`}>
                <path
                  d={pathD}
                  fill="none"
                  stroke="rgba(148, 163, 184, 0.2)"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                  className="dark:stroke-slate-700"
                />
                <motion.path
                  d={pathD}
                  fill="none"
                  stroke="url(#flow-gradient)"
                  strokeWidth="3"
                  filter="url(#glow)"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ 
                    duration: 1.5, 
                    delay: 0.5 + idx * 0.2, 
                    ease: "easeInOut" 
                  }}
                />
                
                {/* Flow particle */}
                <motion.circle
                  r="4"
                  fill="#10B981"
                  filter="url(#glow)"
                  animate={{ offsetDistance: ["0%", "100%"] }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: idx * 0.5,
                    ease: "linear"
                  }}
                  style={{
                    offsetPath: `path('${pathD}')`,
                  }}
                />
              </g>
            );
          })}
        </svg>

        {/* Nodes */}
        {WORKFLOW_NODES.map((node) => (
          <motion.a
            href={`#${node.id === 'offer' ? 'features' : node.id}`} // Links to corresponding sections
            key={node.id}
            initial={{ opacity: 0, scale: 0, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{
              duration: 0.6,
              delay: node.delay,
              type: "spring",
              stiffness: 200,
              damping: 20
            }}
            whileHover={{ scale: 1.1, zIndex: 50 }}
            className="absolute -translate-x-1/2 -translate-y-1/2 group cursor-pointer z-10"
            style={{ 
              left: `${node.x}%`, 
              top: `${node.y}%`,
              translateZ: Math.random() * 50 + 20
            }}
          >
            {/* Continuous floating animation */}
            <motion.div
              animate={{ y: [-5, 5, -5] }}
              transition={{ duration: 4 + Math.random() * 2, repeat: Infinity, ease: "easeInOut", delay: Math.random() * 2 }}
              className="relative flex flex-col items-center gap-2"
            >
              <div className="relative w-14 h-14 rounded-2xl glass-card flex items-center justify-center shadow-lg group-hover:shadow-premium-bloom transition-all duration-300 border border-white/40 dark:border-white/10 overflow-hidden">
                <div className={`absolute inset-0 bg-gradient-to-br ${node.color} opacity-10 group-hover:opacity-20 transition-opacity`} />
                <node.icon className={`w-6 h-6 text-slate-700 dark:text-slate-200 relative z-10 group-hover:scale-110 transition-transform`} />
              </div>
              
              {/* Tooltip Label */}
              <div className="absolute top-full mt-2 px-3 py-1.5 rounded-lg bg-white/90 dark:bg-slate-900/90 backdrop-blur-md shadow-xl border border-slate-200/50 dark:border-slate-700/50 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 whitespace-nowrap pointer-events-none z-20">
                <span className="text-xs font-bold text-slate-900 dark:text-white">{node.label}</span>
              </div>
            </motion.div>
          </motion.a>
        ))}
      </motion.div>
    </div>
  );
}
