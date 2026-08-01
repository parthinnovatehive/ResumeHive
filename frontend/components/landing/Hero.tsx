"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { ArrowRight, Play, Sparkles, CheckCircle2, ChevronDown } from "lucide-react";
import { HeroSlideshow } from "./HeroSlideshow";

const TYPEWRITER_WORDS = [
  "Engineer Your Dream Career",
  "Master Algorithmic Interviews",
  "Build ATS-Defeating Resumes",
  "Supercharge Your LinkedIn",
  "Dominate Behavioral Interviews",
  "Discover High-Paying Roles",
  "Accelerate Career Trajectory",
  "Unlock Limitless Potential"
];

export function Hero() {
  const [currentWord, setCurrentWord] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [displayText, setDisplayText] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
    let timer: NodeJS.Timeout;
    
    const word = TYPEWRITER_WORDS[currentWord];
    
    if (isDeleting) {
      timer = setTimeout(() => {
        setDisplayText(word.substring(0, displayText.length - 1));
        if (displayText.length <= 1) {
          setIsDeleting(false);
          setCurrentWord((prev) => (prev + 1) % TYPEWRITER_WORDS.length);
        }
      }, 30);
    } else {
      timer = setTimeout(() => {
        setDisplayText(word.substring(0, displayText.length + 1));
        if (displayText.length === word.length) {
          timer = setTimeout(() => setIsDeleting(true), 3500);
        }
      }, 70);
    }

    return () => clearTimeout(timer);
  }, [displayText, isDeleting, currentWord]);

  if (!isMounted) return null;

  return (
    <section 
      id="hero"
      ref={containerRef}
      className="relative w-full min-h-screen lg:h-screen flex flex-col justify-center pt-32 pb-20 lg:pt-24 lg:pb-8 px-6 lg:px-12 overflow-x-hidden bg-[#050505]"
    >
      {/* Video Background */}
      <div className="absolute inset-0 w-full h-full z-0 overflow-hidden">
        <video 
          autoPlay 
          loop 
          muted 
          playsInline
          className="absolute top-1/2 left-1/2 w-full h-full object-cover -translate-x-1/2 -translate-y-1/2 opacity-70 mix-blend-screen scale-105"
        >
          <source src="/videos/hero_background.mp4" type="video/mp4" />
        </video>
        
        {/* Heavy Gradient Overlays for readability and premium cinematic feel */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-black/40 z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-[#050505]/80 z-10" />
        <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay z-10" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.85%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }} />
      </div>

      {/* Main Content Layout */}
      <div className="w-full max-w-[1200px] mx-auto flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-16 z-20 relative">
        
        {/* Left Side: Typography */}
        <div className="w-full lg:w-[540px] flex flex-col items-center lg:items-start text-center lg:text-left relative z-10 shrink-0">
          
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-md shadow-2xl mb-5"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-400" strokeWidth={2} />
            <span className="text-xs font-semibold tracking-wide text-slate-200 uppercase letter-spacing-widest">Next-Gen Career Intelligence</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="text-4xl sm:text-5xl lg:text-[4.2rem] xl:text-[4.8rem] font-bold tracking-tight text-white leading-[1.05] mb-5 text-balance"
          >
            The Future of<br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-400 to-violet-400">Career Growth.</span>
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="h-12 sm:h-8 mb-6 flex items-center justify-center lg:justify-start w-full"
          >
            <span className="text-base sm:text-lg lg:text-2xl font-medium tracking-tight text-slate-300 border-r-[3px] border-indigo-500 pr-1">
              {displayText}
            </span>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="text-sm sm:text-base lg:text-lg text-slate-400 font-normal mb-8 lg:mb-10 leading-relaxed text-balance"
          >
            ResumeHive is the definitive AI-powered platform for ambitious professionals. Engineer ATS-defeating resumes, master algorithmic coding patterns, and dominate behavioral interviews within one seamlessly integrated, flagship ecosystem. Stop applying. Start getting hired.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto mb-8"
          >
            <Link
              href="/signup"
              className="group relative inline-flex items-center justify-center gap-3 px-8 h-[56px] bg-white text-black rounded-full font-bold overflow-hidden shadow-[0_0_40px_rgba(255,255,255,0.1)] transition-transform hover:scale-[1.03] active:scale-[0.98] w-full sm:w-auto"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-100 to-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-out" />
              <span className="relative z-10 text-[15px] tracking-wide">Launch Your Career</span>
              <ArrowRight className="relative z-10 w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
            </Link>

            <button className="group relative inline-flex items-center justify-center gap-3 px-8 h-[56px] bg-white/5 backdrop-blur-md rounded-full font-semibold text-white border border-white/10 transition-all hover:bg-white/10 active:scale-[0.98] w-full sm:w-auto overflow-hidden">
              <Play className="w-4 h-4 fill-white group-hover:fill-blue-400 group-hover:text-blue-400 transition-colors duration-300" />
              <span className="text-[15px] tracking-wide">Experience the Platform</span>
            </button>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="flex flex-wrap items-center justify-center lg:justify-start gap-x-5 gap-y-3 w-full"
          >
            {["Ultimate Precision", "AI-Powered Intelligence", "Unmatched Success Rate"].map((badge, i) => (
              <div key={i} className="flex items-center gap-2 opacity-80 hover:opacity-100 transition-opacity">
                <CheckCircle2 className="w-4 h-4 text-indigo-400" />
                <span className="text-[10px] sm:text-xs font-semibold text-slate-300 uppercase tracking-widest">{badge}</span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Right Side: Slideshow */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1.2, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-[400px] sm:max-w-[450px] lg:max-w-[500px] xl:max-w-[550px] relative z-20 flex justify-center shrink-0"
        >
          <HeroSlideshow />
        </motion.div>
      </div>

      {/* Subtle Scroll Indicator */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2, delay: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-20 opacity-50 hidden lg:flex"
      >
        <span className="text-[10px] text-white/50 uppercase tracking-[0.2em]">Scroll</span>
        <motion.div 
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <ChevronDown className="w-4 h-4 text-white/50" />
        </motion.div>
      </motion.div>
    </section>
  );
}
