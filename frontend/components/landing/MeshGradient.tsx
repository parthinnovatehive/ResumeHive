"use client";

import { useEffect, useRef } from "react";
import { motion, useSpring, useTransform } from "framer-motion";

export function MeshGradient() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Mouse tracking for interactive glow
  const mouseX = useSpring(0, { stiffness: 50, damping: 20 });
  const mouseY = useSpring(0, { stiffness: 50, damping: 20 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none bg-background transition-colors duration-700"
    >
      {/* Interactive Mouse Glow */}
      <motion.div
        className="absolute w-[800px] h-[800px] rounded-full bg-premium-blue/10 dark:bg-premium-blue/20 blur-[120px] mix-blend-screen -translate-x-1/2 -translate-y-1/2 will-change-transform"
        style={{
          x: mouseX,
          y: mouseY,
        }}
      />
      
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.2] dark:opacity-[0.1]" />

      {/* Floating Animated Orbs */}
      <motion.div 
        animate={{ 
          x: [0, 100, 0, -100, 0],
          y: [0, -50, 100, 50, 0],
          scale: [1, 1.1, 0.9, 1.1, 1]
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute -top-[10%] -left-[10%] w-[60%] h-[60%] rounded-full bg-premium-blue/15 dark:bg-premium-blue/20 blur-[120px] mix-blend-multiply dark:mix-blend-screen" 
      />
      
      <motion.div 
        animate={{ 
          x: [0, -100, 0, 100, 0],
          y: [0, 100, -50, -100, 0],
          scale: [1, 1.2, 0.8, 1.2, 1]
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        className="absolute top-[20%] right-[10%] w-[40%] h-[50%] rounded-full bg-premium-purple/10 dark:bg-premium-purple/15 blur-[120px] mix-blend-multiply dark:mix-blend-screen" 
      />
      
      <motion.div 
        animate={{ 
          x: [0, 50, -50, 0],
          y: [0, 50, 100, 0],
          scale: [1, 0.9, 1.1, 1]
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        className="absolute -bottom-[20%] left-[20%] w-[50%] h-[40%] rounded-full bg-premium-emerald/10 dark:bg-premium-emerald/15 blur-[120px] mix-blend-multiply dark:mix-blend-screen" 
      />

      {/* Noise Texture Overlay for Premium Feel */}
      <div 
        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
        }}
      />
    </div>
  );
}
