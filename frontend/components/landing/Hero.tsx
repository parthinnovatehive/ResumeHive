"use client";

import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { ArrowRight, Play } from "lucide-react";
import { MagneticWrapper } from "../ui/MagneticWrapper";
import { FloatingWorkflow } from "./FloatingWorkflow";

const TYPEWRITER_WORDS = [
  "Resume Builder",
  "ATS Analyzer",
  "AI Resume Writer",
  "Job Search",
  "LinkedIn Optimizer",
  "Mock Interview",
  "Career Coach"
];

export function Hero() {
  const [currentWord, setCurrentWord] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Parallax on scroll
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 1000], [0, 150]);
  const opacity = useTransform(scrollY, [0, 500], [1, 0]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWord((prev) => (prev + 1) % TYPEWRITER_WORDS.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section 
      id="hero"
      ref={containerRef}
      className="relative min-h-screen flex flex-col justify-center pt-32 pb-20 px-6 overflow-hidden perspective-1000"
    >
      <motion.div 
        style={{ y: y1, opacity }}
        className="w-full max-w-[1400px] mx-auto flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-8 z-10"
      >
        {/* Left Text Content (50%) */}
        <div className="w-full lg:w-1/2 flex flex-col items-center lg:items-start text-center lg:text-left z-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-pill mb-8"
          >
            <span className="flex h-2 w-2 rounded-full bg-premium-emerald animate-pulse" />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">ResumeHive Premium 1.0 is Live</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="text-5xl lg:text-6xl xl:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.1] mb-6 text-balance"
          >
            Build ATS-Friendly Resumes with AI.<br />
            <span className="block mt-2">Land Your Dream Job Faster.</span>
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="text-xl lg:text-2xl text-slate-600 dark:text-slate-300 font-medium mb-10 h-10 flex items-center gap-2 overflow-hidden justify-center lg:justify-start"
          >
            One Platform.
            <div className="relative w-[280px] h-full flex items-center">
              <AnimatePresence mode="popLayout">
                <motion.span
                  key={currentWord}
                  initial={{ y: 40, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -40, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className="absolute left-0 text-gradient font-bold whitespace-nowrap"
                >
                  {TYPEWRITER_WORDS[currentWord]}.
                </motion.span>
              </AnimatePresence>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
          >
            <MagneticWrapper strength={20}>
              <Link
                href="/signup"
                className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full font-semibold overflow-hidden shadow-premium hover:shadow-premium-hover transition-all w-full sm:w-auto"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-premium-blue to-premium-purple opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-out" />
                <span className="relative z-10 group-hover:text-white transition-colors duration-300">Start Building Free</span>
                <ArrowRight className="relative z-10 w-5 h-5 group-hover:translate-x-1 group-hover:text-white transition-all duration-300" />
              </Link>
            </MagneticWrapper>

            <MagneticWrapper strength={15}>
              <button className="group inline-flex items-center justify-center gap-3 px-8 py-4 glass-card rounded-full font-semibold text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white hover:-translate-y-0.5 transition-all w-full sm:w-auto shadow-sm hover:shadow-md border border-slate-200/50 dark:border-slate-700/50">
                <Play className="w-5 h-5 fill-slate-700 dark:fill-slate-200 group-hover:fill-slate-900 dark:group-hover:fill-white transition-colors" />
                Watch Demo
              </button>
            </MagneticWrapper>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="mt-12 flex items-center gap-8 justify-center lg:justify-start"
          >
            <div className="flex flex-col">
              <span className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">1M+</span>
              <span className="text-sm font-medium text-slate-500">Resumes Generated</span>
            </div>
            <div className="w-[1px] h-10 bg-slate-200 dark:bg-slate-800" />
            <div className="flex flex-col">
              <span className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">98%</span>
              <span className="text-sm font-medium text-slate-500">ATS Success Rate</span>
            </div>
          </motion.div>
        </div>

        {/* Right 50% Visual Concept (Floating Workflow) */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="w-full lg:w-1/2 relative h-[500px] lg:h-[650px] z-10 hidden sm:flex"
        >
          <FloatingWorkflow />
        </motion.div>
      </motion.div>
      
      {/* Scroll Down Indicator */}
      <motion.div 
        animate={{ y: [0, 10, 0], opacity: [0.3, 1, 0.3] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 hidden lg:flex"
      >
        <div className="w-[1px] h-12 bg-gradient-to-b from-transparent via-slate-400 dark:via-slate-500 to-transparent" />
      </motion.div>
    </section>
  );
}
