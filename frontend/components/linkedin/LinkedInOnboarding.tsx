"use client";

import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight, ArrowLeft, MousePointer2, Info, Lightbulb, CheckCircle2, AlertTriangle, HelpCircle, Loader2, Target } from "lucide-react";
import confetti from "canvas-confetti";

export interface LinkedInOnboardingProps {
  onComplete: () => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const STEPS = [
  {
    id: "welcome",
    title: "Welcome",
    instruction: "Welcome to the LinkedIn Optimizer.",
    tip: "Keep your LinkedIn updated before exporting.",
  },
  {
    id: "open",
    title: "Open LinkedIn",
    instruction: "Go to your LinkedIn account and open your public profile page.",
    tip: "Make sure you are logged in.",
  },
  {
    id: "resources",
    title: "Resources",
    instruction: "Locate the Resources button.\nIt appears beside the Open To, Add Section, and Enhance Profile buttons.\nClick it.",
    tip: "It's usually near the top of your profile.",
  },
  {
    id: "save",
    title: "Save PDF",
    instruction: "The Resources menu opens.\nClick 'Save to PDF'.\nLinkedIn will automatically generate and download your profile PDF.",
    tip: "The PDF contains your Experience, Education, Skills, and Projects.",
  },
  {
    id: "upload",
    title: "Upload",
    instruction: "Return to ResumeHive.\nClick 'Upload LinkedIn Export'.\nChoose the downloaded PDF.",
    tip: "ResumeHive automatically extracts the information.",
  }
];

export function LinkedInOnboarding({ onComplete, isOpen, setIsOpen }: LinkedInOnboardingProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [showSkipModal, setShowSkipModal] = useState(false);
  const [completed, setCompleted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close with ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "Escape") setShowSkipModal(true);
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "Enter") {
        if (currentStepIndex === STEPS.length - 1) handleComplete();
        else handleNext();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, currentStepIndex]);

  const handleNext = () => {
    if (currentStepIndex < STEPS.length - 1) setCurrentStepIndex(i => i + 1);
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) setCurrentStepIndex(i => i - 1);
  };

  const handleSkip = () => {
    setShowSkipModal(true);
  };

  const confirmSkip = () => {
    setShowSkipModal(false);
    setIsOpen(false);
    localStorage.setItem("linkedinTutorialCompleted", "true");
  };

  const handleComplete = () => {
    setCompleted(true);
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#3b82f6", "#8b5cf6", "#ec4899", "#10b981"]
    });
    
    setTimeout(() => {
      setIsOpen(false);
      localStorage.setItem("linkedinTutorialCompleted", "true");
      onComplete();
    }, 2500);
  };

  if (!isOpen) return null;

  const currentStep = STEPS[currentStepIndex];

  // Map steps to images and spotlight coordinates (approximate based on standard layout)
  // These coords are relative to a 1000x700 viewport container holding the image
  const stepConfigs = [
    { zoom: 1, x: 0, y: 0, showCursor: false }, // Welcome (No Image, just text or placeholder)
    { image: "/images/linkedin-step1.png", zoom: 1, x: 0, y: 0, showCursor: true, cursorTo: {x: 50, y: 40}, highlight: null }, // Open LinkedIn
    { image: "/images/linkedin-step1.png", zoom: 1.3, x: -5, y: -25, showCursor: true, cursorTo: {x: 50, y: 74}, click: true, highlight: {x: 44.5, y: 72, w: 13, h: 7} }, // Resources (Red box approx X:45-57%, Y:72-79%)
    { image: "/images/linkedin-step3.png", zoom: 1.0, x: 0, y: 0, showCursor: true, cursorTo: {x: 40, y: 32}, click: true, highlight: {x: 2, y: 26, w: 96, h: 16} }, // Save PDF (Using step3.png which has the red box at top ~25%)
    { zoom: 1, x: 0, y: 0, showCursor: true, cursorTo: {x: 50, y: 50}, highlight: {x: 50, y: 50, w: 40, h: 30} }, // Upload (Mockup view)
  ];

  const config = stepConfigs[currentStepIndex];

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-2xl"
      >
        {/* Ambient Aurora Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
          <motion.div 
            animate={{ rotate: 360 }} 
            transition={{ duration: 100, repeat: Infinity, ease: "linear" }}
            className="absolute top-1/4 left-1/4 w-[800px] h-[800px] rounded-full bg-blue-500/20 blur-[150px]" 
          />
          <motion.div 
            animate={{ rotate: -360 }} 
            transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
            className="absolute bottom-1/4 right-1/4 w-[800px] h-[800px] rounded-full bg-purple-500/20 blur-[150px]" 
          />
        </div>

        <div className="relative w-full max-w-[1400px] h-[90vh] flex flex-col lg:flex-row gap-6 p-6">
          
          {/* Smart Progress Sidebar */}
          <div className="hidden lg:flex w-64 flex-col bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 shadow-2xl">
            <h2 className="text-white font-bold text-lg mb-8 flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400">
                <HelpCircle className="w-5 h-5" />
              </span>
              Tutorial
            </h2>
            <div className="flex-1 flex flex-col gap-6 relative">
              <div className="absolute left-3 top-2 bottom-2 w-px bg-white/10" />
              {STEPS.map((step, idx) => {
                const isActive = idx === currentStepIndex;
                const isPassed = idx < currentStepIndex;
                return (
                  <div key={step.id} className="relative flex items-center gap-4 z-10">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] transition-colors duration-500 ${isPassed ? 'bg-green-500 text-white shadow-[0_0_15px_rgba(34,197,94,0.5)]' : isActive ? 'bg-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.6)] ring-4 ring-blue-500/20' : 'bg-white/10 text-white/50 border border-white/20'}`}>
                      {isPassed ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                    </div>
                    <span className={`font-semibold text-sm transition-colors duration-500 ${isActive ? 'text-white' : isPassed ? 'text-white/80' : 'text-white/40'}`}>
                      {step.title}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="mt-auto pt-6 border-t border-white/10 flex items-center justify-between text-white/60 text-xs">
              <span className="flex items-center gap-1.5"><HelpCircle className="w-3.5 h-3.5"/> ~ 30 sec</span>
              <button onClick={handleSkip} className="hover:text-white transition-colors">Skip</button>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col relative h-full">
            
            {/* Device Frame / Spotlight Area */}
            <div className="flex-1 relative w-full rounded-3xl overflow-hidden bg-black border border-white/10 shadow-2xl flex items-center justify-center">
              
              {/* Fake Browser Chrome */}
              <div className="absolute top-0 left-0 right-0 h-12 bg-[#1e1e1e] border-b border-white/5 flex items-center px-4 z-20">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-green-500/80" />
                </div>
                <div className="mx-auto h-6 w-1/3 bg-white/5 rounded-md flex items-center justify-center border border-white/10">
                  <span className="text-[10px] font-medium text-white/40">linkedin.com/in/me</span>
                </div>
              </div>

              {/* Celebration Overlay */}
              <AnimatePresence>
                {completed && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/60 backdrop-blur-md"
                  >
                    <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mb-6 ring-8 ring-green-500/10">
                      <CheckCircle2 className="w-12 h-12 text-green-400" />
                    </div>
                    <h2 className="text-4xl font-bold text-white mb-2">Tutorial Completed</h2>
                    <p className="text-white/70 text-lg">You're ready to optimize your LinkedIn profile.</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Image / Viewport Content */}
              <div className="absolute top-12 left-0 right-0 bottom-0 overflow-hidden bg-[#f3f2ef]">
                <AnimatePresence mode="wait">
                  <motion.div 
                    key={currentStepIndex}
                    initial={{ opacity: 0, scale: 1.05 }}
                    animate={{ 
                      opacity: 1, 
                      scale: config.zoom, 
                      x: `${config.x}%`, 
                      y: `${config.y}%` 
                    }}
                    exit={{ opacity: 0 }}
                    transition={{ type: "spring", bounce: 0, duration: 1.2 }}
                    className="w-full h-full relative"
                  >
                    {config.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img 
                        src={config.image} 
                        alt={currentStep.title} 
                        className="w-full h-full object-contain origin-center"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
                        {currentStepIndex === 0 ? (
                          <div className="text-center p-10 bg-white rounded-2xl shadow-xl">
                            <h3 className="text-2xl font-bold text-slate-800">Ready to boost your profile?</h3>
                            <p className="text-slate-500 mt-2">Let's learn how to export your profile.</p>
                          </div>
                        ) : (
                          <div className="w-2/3 h-2/3 border-4 border-dashed border-slate-300 rounded-3xl flex items-center justify-center bg-white/50">
                            <div className="text-center">
                              <Target className="w-16 h-16 text-blue-500 mx-auto opacity-50" />
                              <p className="font-bold text-slate-600 mt-4 text-xl">Upload Area Highlighted</p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Spotlight Backdrop (dims everything else) */}
                    {config.highlight && (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8 }}
                        className="absolute inset-0 bg-black/40 pointer-events-none z-10"
                        style={{
                          clipPath: `polygon(0% 0%, 0% 100%, ${config.highlight.x}% 100%, ${config.highlight.x}% ${config.highlight.y}%, ${config.highlight.x + config.highlight.w}% ${config.highlight.y}%, ${config.highlight.x + config.highlight.w}% ${config.highlight.y + config.highlight.h}%, ${config.highlight.x}% ${config.highlight.y + config.highlight.h}%, ${config.highlight.x}% 100%, 100% 100%, 100% 0%)`
                        }}
                      />
                    )}

                    {/* Highlight Box */}
                    {config.highlight && (
                      <motion.div
                        initial={{ opacity: 0, scale: 1.2 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 1, type: "spring" }}
                        className="absolute z-20 border-4 border-blue-500 rounded-lg shadow-[0_0_30px_rgba(59,130,246,0.6)]"
                        style={{
                          left: `${config.highlight.x}%`,
                          top: `${config.highlight.y}%`,
                          width: `${config.highlight.w}%`,
                          height: `${config.highlight.h}%`
                        }}
                      >
                        <motion.div 
                          animate={{ opacity: [0, 0.5, 0] }} 
                          transition={{ repeat: Infinity, duration: 2 }}
                          className="absolute inset-0 bg-blue-500/20"
                        />
                        {/* Tooltip pointing to highlight */}
                        <div className="absolute -top-12 left-1/2 -translate-x-1/2 whitespace-nowrap bg-blue-600 text-white text-xs px-3 py-1.5 rounded-md shadow-xl flex items-center gap-1.5">
                          <Info className="w-3 h-3" /> Action Area
                          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 border-4 border-transparent border-t-blue-600" />
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                </AnimatePresence>

                {/* Animated Cursor */}
                {config.showCursor && config.cursorTo && (
                  <motion.div
                    key={`cursor-${currentStepIndex}`}
                    initial={{ left: "50%", top: "80%", opacity: 0 }}
                    animate={{ 
                      left: `${config.cursorTo.x}%`, 
                      top: `${config.cursorTo.y}%`,
                      opacity: 1
                    }}
                    transition={{ 
                      duration: 1.2, 
                      delay: 1.2, 
                      type: "spring", 
                      damping: 15, 
                      stiffness: 100 
                    }}
                    className="absolute z-30 pointer-events-none drop-shadow-2xl"
                  >
                    <MousePointer2 className="w-8 h-8 text-white fill-black drop-shadow-md -rotate-12" />
                    {/* Click Ripple effect */}
                    {config.click && (
                      <motion.div 
                        initial={{ scale: 0, opacity: 1 }}
                        animate={{ scale: 3, opacity: 0 }}
                        transition={{ delay: 2.5, duration: 0.6 }}
                        className="absolute top-1 left-1 w-6 h-6 border-2 border-blue-500 rounded-full"
                      />
                    )}
                  </motion.div>
                )}
              </div>
            </div>

            {/* Bottom Instruction Panel */}
            <div className="mt-6 flex gap-4 h-32">
              <div className="flex-1 bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 flex flex-col justify-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/4" />
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentStepIndex}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.4 }}
                  >
                    <h3 className="text-xl font-bold text-white mb-2">{currentStep.title}</h3>
                    <div className="text-white/70 text-sm whitespace-pre-line leading-relaxed">
                      {currentStep.instruction.split('\n').map((line, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.2 + 0.3 }}
                        >
                          {line}
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Controls */}
              <div className="w-64 bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-4 flex flex-col gap-3 justify-center">
                <div className="flex gap-2 w-full">
                  <button 
                    onClick={handlePrev}
                    disabled={currentStepIndex === 0}
                    className="flex-1 flex items-center justify-center py-3 rounded-xl bg-white/5 text-white hover:bg-white/10 transition-colors disabled:opacity-30 border border-white/10"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={currentStepIndex === STEPS.length - 1 ? handleComplete : handleNext}
                    className="flex-[3] flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_30px_rgba(59,130,246,0.5)] hover:-translate-y-0.5 transition-all"
                  >
                    {currentStepIndex === STEPS.length - 1 ? 'Finish' : 'Next Step'}
                    {currentStepIndex !== STEPS.length - 1 && <ArrowRight className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Floating Pro Tip */}
        <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-xl border border-white/20 text-white text-xs px-4 py-2 rounded-full shadow-2xl flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-amber-400" />
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStepIndex}
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              className="overflow-hidden whitespace-nowrap"
            >
              {currentStep.tip}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Skip Confirmation Modal */}
        <AnimatePresence>
          {showSkipModal && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-[99999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
            >
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-[#1c1c1e] border border-white/10 rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center"
              >
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                  <AlertTriangle className="w-8 h-8 text-amber-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Skip Tutorial?</h3>
                <p className="text-white/50 text-sm mb-8">You can always rewatch this tutorial later by clicking the Help button in the bottom right corner.</p>
                
                <div className="flex flex-col gap-3">
                  <button onClick={() => setShowSkipModal(false)} className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-colors">
                    Continue Tutorial
                  </button>
                  <button onClick={confirmSkip} className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium transition-colors">
                    Skip Anyway
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </motion.div>
    </AnimatePresence>,
    document.body
  );
}
