"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, 
  ArrowRight, 
  ArrowLeft, 
  MousePointer2, 
  CheckCircle2, 
  AlertTriangle, 
  HelpCircle, 
  Target, 
  ChevronDown, 
  Download, 
  Briefcase, 
  Search, 
  MessageSquare,
  Home,
  Users,
  Bell,
  Globe,
  Grid,
  Camera,
  Pencil,
  Check,
  Bookmark,
  Activity,
  Info,
  TrendingUp,
  Eye,
  BarChart2,
  Lock,
  Send
} from "lucide-react";
import confetti from "canvas-confetti";

export interface LinkedInOnboardingProps {
  onComplete: () => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const STEPS = [
  {
    id: "open",
    title: "1. Open LinkedIn",
    instruction: "Go to linkedin.com in your web browser and log into your account to reach your Home Feed.",
    tip: "Ensure you are signed into the LinkedIn account you want to export.",
    url: "https://www.linkedin.com/feed/"
  },
  {
    id: "profile",
    title: "2. Go to Your Profile",
    instruction: "Click on your profile picture icon ('Me') in the top navigation bar and select 'View Profile'.",
    tip: "This opens your main public profile page.",
    url: "https://www.linkedin.com/feed/"
  },
  {
    id: "resources",
    title: "3. Click Resources Button",
    instruction: "On your profile header card, locate and click the 'Resources' button next to 'Enhance profile'.",
    tip: "The Resources button is located right below your headline and location.",
    url: "https://www.linkedin.com/in/arjun-sharma"
  },
  {
    id: "save",
    title: "4. Click Save to PDF",
    instruction: "From the dropdown menu that appears, click 'Save to PDF'.\nLinkedIn will automatically generate and download your profile PDF file.",
    tip: "Once downloaded, upload the PDF directly into ResumeHive!",
    url: "https://www.linkedin.com/in/arjun-sharma"
  }
];

export function LinkedInOnboarding({ onComplete, isOpen, setIsOpen }: LinkedInOnboardingProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [showSkipModal, setShowSkipModal] = useState(false);
  const [completed, setCompleted] = useState(false);

  // Close with ESC or Keyboard Shortcuts
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
      colors: ["#0A66C2", "#3b82f6", "#8b5cf6", "#10b981"]
    });
    
    setTimeout(() => {
      setIsOpen(false);
      localStorage.setItem("linkedinTutorialCompleted", "true");
      onComplete();
    }, 2200);
  };

  if (!isOpen || !mounted) return null;

  const currentStep = STEPS[currentStepIndex];

  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[99999] flex items-center justify-center bg-slate-950/85 backdrop-blur-2xl p-4 md:p-6 select-none"
      >
        {/* Ambient Background Glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
          <motion.div 
            animate={{ rotate: 360 }} 
            transition={{ duration: 100, repeat: Infinity, ease: "linear" }}
            className="absolute top-1/4 left-1/4 w-[700px] h-[700px] rounded-full bg-blue-600/20 blur-[160px]" 
          />
          <motion.div 
            animate={{ rotate: -360 }} 
            transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
            className="absolute bottom-1/4 right-1/4 w-[700px] h-[700px] rounded-full bg-indigo-600/20 blur-[160px]" 
          />
        </div>

        <div className="relative w-full max-w-[1340px] h-[90vh] flex flex-col lg:flex-row gap-6">
          
          {/* Sidebar Step Tracker */}
          <div className="hidden lg:flex w-72 flex-col bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 shadow-2xl text-white justify-between shrink-0">
            <div>
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#0A66C2] flex items-center justify-center text-white font-black shadow-md text-base">
                    in
                  </div>
                  <div>
                    <h2 className="font-extrabold text-sm text-white">LinkedIn PDF Guide</h2>
                    <p className="text-[10px] text-slate-400">4 Simple Export Steps</p>
                  </div>
                </div>
              </div>

              {/* Steps List */}
              <div className="space-y-6 relative">
                <div className="absolute left-3.5 top-3 bottom-3 w-0.5 bg-slate-800 z-0" />
                {STEPS.map((step, idx) => {
                  const isActive = idx === currentStepIndex;
                  const isPassed = idx < currentStepIndex;
                  return (
                    <button
                      key={step.id}
                      onClick={() => setCurrentStepIndex(idx)}
                      className={`relative flex items-start gap-3.5 z-10 w-full text-left transition-all group ${
                        isActive ? 'opacity-100' : 'opacity-60 hover:opacity-90'
                      }`}
                    >
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 shrink-0 ${
                        isPassed 
                          ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/50' 
                          : isActive 
                          ? 'bg-[#0A66C2] text-white ring-4 ring-[#0A66C2]/30 shadow-md shadow-[#0A66C2]/50' 
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}>
                        {isPassed ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                      </div>
                      <div className="pt-0.5">
                        <span className={`block font-extrabold text-xs transition-colors ${
                          isActive ? 'text-white' : isPassed ? 'text-slate-200' : 'text-slate-400'
                        }`}>
                          {step.title}
                        </span>
                        <span className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">
                          {step.tip}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Sidebar Footer */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5"><HelpCircle className="w-3.5 h-3.5" /> 30 Sec Tutorial</span>
              <button 
                onClick={handleSkip} 
                className="hover:text-white transition-colors font-bold text-xs"
              >
                Skip Tutorial
              </button>
            </div>
          </div>

          {/* Main Display Container */}
          <div className="flex-1 flex flex-col relative h-full min-w-0">
            
            {/* Simulated Browser Frame */}
            <div className="flex-1 relative w-full rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 shadow-2xl flex flex-col">
              
              {/* Chrome Address Bar */}
              <div className="h-11 bg-slate-950 border-b border-slate-800/80 flex items-center px-4 shrink-0 z-30 justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                </div>
                
                {/* Dynamic Address Bar URL */}
                <div className={`h-7 w-1/2 max-w-md bg-slate-900 rounded-xl flex items-center justify-center px-3 border transition-all text-[11px] font-mono ${
                  currentStepIndex === 0 
                    ? 'border-blue-500 text-blue-300 ring-2 ring-blue-500/30' 
                    : 'border-slate-800 text-slate-400'
                }`}>
                  <span className="truncate">{currentStep.url}</span>
                </div>

                <button
                  onClick={handleSkip}
                  className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
                  title="Close Guide"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Celebration Overlay */}
              <AnimatePresence>
                {completed && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-slate-950/90 backdrop-blur-md text-white"
                  >
                    <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mb-4 ring-8 ring-emerald-500/10 border border-emerald-500/30">
                      <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                    </div>
                    <h2 className="text-3xl font-black mb-2">Tutorial Completed!</h2>
                    <p className="text-slate-300 text-sm max-w-sm text-center mb-6">
                      You are now ready to export your LinkedIn PDF and upload it into ResumeHive.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Exact Simulated LinkedIn UI Viewport */}
              <div className="flex-1 relative overflow-hidden bg-[#f4f2ee]">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentStepIndex}
                    initial={{ opacity: 0, scale: 0.99 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.01 }}
                    transition={{ duration: 0.2 }}
                    className="w-full h-full relative flex flex-col"
                  >
                    <LinkedInMockupView stepIndex={currentStepIndex} />
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            {/* Bottom Step Instruction Bar */}
            <div className="mt-4 flex flex-col sm:flex-row items-center gap-4 bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-5 shadow-xl text-white">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-black uppercase text-[#0A66C2] tracking-wider">
                    Step {currentStepIndex + 1} of {STEPS.length}
                  </span>
                  <span className="text-slate-600">•</span>
                  <h3 className="text-base font-extrabold text-white">{currentStep.title}</h3>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-medium whitespace-pre-line">
                  {currentStep.instruction}
                </p>
              </div>

              {/* Navigation Controls */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handlePrev}
                  disabled={currentStepIndex === 0}
                  className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40 transition-all border border-slate-700"
                  title="Previous Step"
                >
                  <ArrowLeft size={16} />
                </button>

                <button
                  type="button"
                  onClick={currentStepIndex === STEPS.length - 1 ? handleComplete : handleNext}
                  className="px-5 py-3 rounded-xl bg-gradient-to-r from-[#0A66C2] to-blue-600 hover:from-blue-600 hover:to-indigo-600 text-white font-extrabold text-xs shadow-lg shadow-[#0A66C2]/30 hover:scale-[1.02] transition-all flex items-center gap-2"
                >
                  <span>{currentStepIndex === STEPS.length - 1 ? 'Finish Guide' : 'Next Step'}</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>

          </div>

        </div>

        {/* Skip Modal */}
        <AnimatePresence>
          {showSkipModal && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-[99999] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4"
            >
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-sm w-full shadow-2xl text-center text-white"
              >
                <div className="w-14 h-14 bg-amber-950/80 border border-amber-600/40 text-amber-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle size={26} />
                </div>
                <h3 className="text-lg font-black mb-1">Skip Guide?</h3>
                <p className="text-slate-400 text-xs mb-6 leading-relaxed">
                  You can rewatch this guide anytime by clicking &quot;Watch Tutorial Again&quot;.
                </p>
                <div className="flex gap-3">
                  <button 
                    onClick={() => setShowSkipModal(false)}
                    className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-colors border border-slate-700"
                  >
                    Continue Guide
                  </button>
                  <button 
                    onClick={confirmSkip}
                    className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-colors shadow-md"
                  >
                    Skip
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

/* -------------------------------------------------------------------------- */
/*       Vector Simulated LinkedIn UI Component (Generic Indian Sample)       */
/* -------------------------------------------------------------------------- */

function LinkedInMockupView({ stepIndex }: { stepIndex: number }) {
  return (
    <div className="w-full h-full flex flex-col bg-[#f4f2ee] text-slate-800 font-sans text-xs overflow-hidden select-none">
      
      {/* 1. LinkedIn Top Navigation Bar */}
      <div className="h-12 bg-white border-b border-slate-200 px-4 md:px-8 flex items-center justify-between shrink-0 z-20 shadow-xs">
        <div className="flex items-center gap-2">
          {/* LinkedIn Logo */}
          <div className="w-7 h-7 rounded bg-[#0A66C2] text-white flex items-center justify-center font-black text-base tracking-tighter">
            in
          </div>
          {/* Search Box */}
          <div className="hidden sm:flex items-center gap-2 bg-[#edf3f8] px-3 py-1.5 rounded-full border border-slate-200 w-60 text-slate-500">
            <Search size={13} className="text-slate-600" />
            <span className="text-[11px] text-slate-500">Search</span>
          </div>
        </div>

        {/* Navigation Actions */}
        <div className="flex items-center gap-5 text-slate-600 text-[10px]">
          
          {/* Home */}
          <div className={`flex flex-col items-center cursor-pointer py-1 border-b-2 ${
            stepIndex <= 1 ? 'border-black text-black font-bold' : 'border-transparent hover:text-black'
          }`}>
            <Home size={17} />
            <span>Home</span>
          </div>

          {/* My Network */}
          <div className="flex flex-col items-center cursor-pointer hover:text-black py-1 relative">
            <div className="relative">
              <Users size={17} />
              <span className="absolute -top-1 -right-1.5 bg-rose-600 text-white text-[8px] font-bold px-1 rounded-full">1</span>
            </div>
            <span>My Network</span>
          </div>

          {/* Jobs */}
          <div className="flex flex-col items-center cursor-pointer hover:text-black py-1">
            <Briefcase size={17} />
            <span>Jobs</span>
          </div>

          {/* Messaging */}
          <div className="flex flex-col items-center cursor-pointer hover:text-black py-1">
            <MessageSquare size={17} />
            <span>Messaging</span>
          </div>

          {/* Notifications */}
          <div className="flex flex-col items-center cursor-pointer hover:text-black py-1 relative">
            <div className="relative">
              <Bell size={17} />
              <span className="absolute -top-1 -right-2 bg-rose-600 text-white text-[8px] font-bold px-1 rounded-full">25</span>
            </div>
            <span>Notifications</span>
          </div>

          {/* "Me" Profile Icon (STEP 2 TARGET) */}
          <div className="relative">
            <div className={`flex flex-col items-center cursor-pointer px-1.5 py-0.5 rounded transition-all ${
              stepIndex === 1 ? 'text-[#0A66C2] bg-blue-50 font-bold' : stepIndex >= 2 ? 'border-b-2 border-black text-black' : 'hover:text-black'
            }`}>
              <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-blue-700 to-indigo-600 text-white flex items-center justify-center font-bold text-[9px] shadow-sm">
                AS
              </div>
              <span className="flex items-center gap-0.5 text-[9px]">
                Me <ChevronDown size={9} />
              </span>
            </div>

            {/* STEP 2 TARGET HIGHLIGHT & DROPDOWN */}
            {stepIndex === 1 && (
              <>
                <motion.div 
                  initial={{ opacity: 0, scale: 1.1 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute -inset-1 border-3 border-blue-500 rounded-lg shadow-[0_0_20px_rgba(59,130,246,0.8)] pointer-events-none z-30"
                />

                <motion.div 
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-2xl border border-slate-200 p-3 z-40"
                >
                  <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-700 to-indigo-600 text-white font-black flex items-center justify-center text-sm shadow-sm">
                      AS
                    </div>
                    <div>
                      <h4 className="font-extrabold text-xs text-slate-900 flex items-center gap-1">
                        Arjun Sharma <Check className="w-3 h-3 text-blue-600" />
                      </h4>
                      <p className="text-[10px] text-slate-500 line-clamp-1">Building NextGen Tech | Full Stack...</p>
                    </div>
                  </div>

                  <div className="pt-2 relative">
                    <button className="w-full py-1 rounded-full border border-[#0A66C2] text-[#0A66C2] font-bold text-xs hover:bg-blue-50 transition-colors shadow-xs">
                      View Profile
                    </button>

                    <motion.div 
                      initial={{ opacity: 0, scale: 1.05 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="absolute -inset-1 border-3 border-blue-500 rounded-full shadow-[0_0_25px_rgba(59,130,246,0.9)] pointer-events-none z-30"
                    >
                      <motion.div 
                        animate={{ opacity: [0.1, 0.4, 0.1] }} 
                        transition={{ repeat: Infinity, duration: 1.5 }}
                        className="absolute inset-0 bg-blue-500/20 rounded-full"
                      />
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap bg-blue-600 text-white text-[10px] font-black px-2 py-0.5 rounded shadow flex items-center gap-1">
                        <Target className="w-3 h-3 text-white" />
                        <span>Click View Profile</span>
                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 border-4 border-transparent border-t-blue-600" />
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ x: 30, y: 30, opacity: 0 }}
                      animate={{ x: 10, y: 8, opacity: 1 }}
                      transition={{ duration: 0.8, type: "spring" }}
                      className="absolute right-4 bottom-0 z-40 pointer-events-none drop-shadow-xl"
                    >
                      <MousePointer2 className="w-6 h-6 text-white fill-blue-600 -rotate-12" />
                      <motion.div 
                        initial={{ scale: 0, opacity: 1 }}
                        animate={{ scale: 3, opacity: 0 }}
                        transition={{ delay: 0.9, duration: 0.8, repeat: Infinity, repeatDelay: 1 }}
                        className="absolute -top-1 -left-1 w-5 h-5 border-2 border-blue-400 rounded-full"
                      />
                    </motion.div>
                  </div>
                </motion.div>
              </>
            )}
          </div>

          {/* Business & Premium */}
          <div className="hidden lg:flex items-center gap-3 border-l border-slate-200 pl-4">
            <div className="flex flex-col items-center cursor-pointer hover:text-black">
              <Grid size={17} />
              <span className="flex items-center gap-0.5 text-[9px]">For Business <ChevronDown size={8} /></span>
            </div>
            <span className="text-[9px] text-amber-700 font-semibold underline cursor-pointer">
              Reactivate Premium: 50% Off
            </span>
          </div>

        </div>
      </div>

      {/* 2. Main Content Container */}
      <div className="flex-1 overflow-y-auto p-3 md:p-5 flex justify-center">
        
        {/* ========================================================================= */}
        {/* STEP 1 & STEP 2 VIEW: LINKEDIN HOME FEED (SAMPLE INDIAN USER)             */}
        {/* ========================================================================= */}
        {stepIndex <= 1 ? (
          <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
            
            {/* Left Column: Arjun Sharma Profile Widget */}
            <div className="md:col-span-3 space-y-3">
              
              {/* Profile Card */}
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
                <div className="h-14 bg-[#a0b4b7]" />
                <div className="px-3 pb-3 pt-0 text-left relative">
                  <div className="w-14 h-14 rounded-full border-2 border-white bg-gradient-to-tr from-blue-700 to-indigo-600 text-white font-black text-sm flex items-center justify-center -mt-7 shadow-sm">
                    AS
                  </div>
                  <h3 className="font-bold text-xs text-slate-900 mt-2 flex items-center gap-1">
                    Arjun Sharma <Check className="w-3 h-3 text-blue-600 shrink-0" />
                  </h3>
                  <p className="text-[10px] text-slate-600 leading-tight mt-0.5 line-clamp-3">
                    Building NextGen Tech | Full Stack Web Developer | Artificial Intelligence &amp; Cloud
                  </p>
                  <p className="text-[9px] text-slate-400 mt-1">Bengaluru Area, India</p>
                  <p className="text-[9px] text-slate-500 font-medium flex items-center gap-1 mt-1">
                    <span className="w-3 h-3 rounded bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-[8px]">I</span>
                    InnovateTech Solutions
                  </p>
                  
                  <div className="mt-3 pt-3 border-t border-slate-100 space-y-1 text-[10px]">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Profile viewers</span>
                      <span className="font-bold text-blue-600">142</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Post impressions</span>
                      <span className="font-bold text-blue-600">520</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* My Pages Box */}
              <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-xs space-y-2 text-[10px]">
                <span className="font-semibold text-slate-500 block">My pages (2)</span>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-800">InnovateTech</span>
                  <span className="text-blue-600 font-bold">0</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-800">DevHub</span>
                  <span className="text-blue-600 font-bold">0</span>
                </div>
              </div>

            </div>

            {/* Middle Column: Feed Content */}
            <div className="md:col-span-6 space-y-3">
              
              {/* Premium Promo Banner */}
              <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex items-center justify-between relative">
                <div className="space-y-1 max-w-sm">
                  <h4 className="font-bold text-xs text-slate-900">
                    80% of professionals find networking key to career success.
                  </h4>
                  <p className="text-[10px] text-slate-500">Grow your connections with Premium.</p>
                  <button className="mt-2 px-3 py-1 bg-amber-400 hover:bg-amber-500 text-slate-900 rounded-full font-bold text-[10px] shadow-xs">
                    Try Premium
                  </button>
                </div>
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-700 to-indigo-600 text-white font-black flex items-center justify-center text-xs shrink-0">
                  AS
                </div>
              </div>

              {/* Start a Post Box */}
              <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-xs">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-700 to-indigo-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                    AS
                  </div>
                  <div className="flex-1 bg-white rounded-full py-2 px-4 text-slate-600 text-xs border border-slate-300 font-medium">
                    Start a post
                  </div>
                </div>
                <div className="flex justify-around text-[10px] text-slate-600 font-bold pt-1">
                  <span className="flex items-center gap-1 text-emerald-700"><Camera size={13} /> Video</span>
                  <span className="flex items-center gap-1 text-blue-600"><Camera size={13} /> Photo</span>
                  <span className="flex items-center gap-1 text-amber-700"><Pencil size={13} /> Write article</span>
                </div>
              </div>

              {/* Post Item: Neha Deshmukh */}
              <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-full bg-purple-900 text-white font-bold text-xs flex items-center justify-center">
                      ND
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-slate-900 flex items-center gap-1">
                        Neha Deshmukh <Check className="w-3 h-3 text-blue-600" />
                        <span className="text-[10px] font-normal text-slate-400">• 1st</span>
                      </h4>
                      <p className="text-[9px] text-slate-500 line-clamp-1">
                        Software Engineer | AI Developer @ TechCorp India ...
                      </p>
                      <p className="text-[9px] text-slate-400 flex items-center gap-1">
                        3h • <Globe size={9} />
                      </p>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-800 leading-snug mb-3">
                  Happy to share that our engineering team just deployed our new AI pipeline for developer tooling! ⚡🎓 ...<span className="text-slate-400 cursor-pointer">more</span>
                </p>

                {/* Post Event Image Banner */}
                <div className="h-44 bg-slate-900 rounded-xl flex flex-col items-center justify-center text-white p-4 text-center border border-slate-800">
                  <div className="flex gap-4 mb-2 text-xs font-bold text-blue-400">
                    <span>#AI</span>
                    <span>#Engineering</span>
                    <span>#TechIndia</span>
                  </div>
                  <span className="font-bold text-sm">AI Developer Innovation Summit 2026</span>
                  <span className="text-[10px] text-slate-400 mt-1">Bengaluru Technology Campus</span>
                </div>
              </div>

            </div>

            {/* Right Column: LinkedIn News & Puzzles */}
            <div className="md:col-span-3 space-y-3">
              
              {/* LinkedIn News */}
              <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-xs">
                <h3 className="font-bold text-xs text-slate-900 mb-2 flex items-center justify-between">
                  LinkedIn News <Info size={12} className="text-slate-500" />
                </h3>
                <span className="text-[10px] font-bold text-slate-500 block mb-2">Top stories</span>
                
                <div className="space-y-2 text-[10px]">
                  <div>
                    <p className="font-bold text-slate-800 line-clamp-1">The sports conversations to join this week</p>
                    <p className="text-[9px] text-slate-400">3h ago • 18,938 readers</p>
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 line-clamp-1">Top finance experts to follow</p>
                    <p className="text-[9px] text-slate-400">2h ago • 1,852 readers</p>
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 line-clamp-1">EV push sparks the next job boom</p>
                    <p className="text-[9px] text-slate-400">4h ago • 682 readers</p>
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 line-clamp-1">India&apos;s drones get their own brains</p>
                    <p className="text-[9px] text-slate-400">4h ago • 405 readers</p>
                  </div>
                </div>
              </div>

              {/* Today's Puzzles */}
              <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-xs text-[10px] space-y-2">
                <h3 className="font-bold text-xs text-slate-900">Today&apos;s puzzles</h3>
                <div className="flex justify-between items-center py-1 border-b border-slate-100">
                  <div>
                    <p className="font-bold text-slate-800">Zip #508</p>
                    <p className="text-[9px] text-slate-400">7 connections played</p>
                  </div>
                  <ChevronDown size={14} className="-rotate-90 text-slate-400" />
                </div>
                <div className="flex justify-between items-center py-1">
                  <div>
                    <p className="font-bold text-slate-800">Tango #60</p>
                    <p className="text-[9px] text-slate-400">3 connections played</p>
                  </div>
                  <ChevronDown size={14} className="-rotate-90 text-slate-400" />
                </div>
              </div>

            </div>

          </div>
        ) : (
          
          /* ========================================================================= */
          /* STEP 3 & STEP 4 VIEW: ARJUN SHARMA PROFILE PAGE                           */
          /* ========================================================================= */
          <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
            
            {/* Left Main Profile Section */}
            <div className="md:col-span-8 space-y-3">
              
              {/* Profile Header Card */}
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs relative">
                
                {/* Dual-Arc Light Teal Banner */}
                <div className="h-28 bg-[#a0b4b7] relative overflow-hidden">
                  <div className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/80 flex items-center justify-center text-slate-700">
                    <Camera size={14} />
                  </div>
                </div>

                {/* Profile Details */}
                <div className="pt-10 px-5 pb-5 relative">
                  
                  {/* Arjun Sharma Avatar Circle */}
                  <div className="absolute -top-14 left-5 w-24 h-24 rounded-full border-4 border-white bg-gradient-to-tr from-blue-700 to-indigo-600 text-white font-black text-xl flex items-center justify-center shadow-md">
                    AS
                  </div>

                  {/* Edit Pencil Icon on top right */}
                  <div className="absolute top-3 right-5 text-slate-600 hover:text-black cursor-pointer">
                    <Pencil size={18} />
                  </div>

                  <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                    <div>
                      <h2 className="text-lg font-bold text-slate-900 flex items-center gap-1.5">
                        Arjun Sharma <Check className="w-4 h-4 text-blue-600" />
                        <span className="text-xs font-normal text-slate-500">He/Him</span>
                      </h2>
                      <p className="text-xs text-slate-700 font-medium mt-1 leading-snug max-w-lg">
                        Building NextGen Tech | Full Stack Web Developer | Artificial Intelligence &amp; Cloud
                      </p>
                      <p className="text-[11px] text-slate-500 mt-1">
                        Bengaluru Area, India • <span className="text-blue-600 font-bold cursor-pointer hover:underline">Contact info</span>
                      </p>
                      <p className="text-[11px] text-blue-600 font-bold mt-1">
                        500+ connections
                      </p>
                    </div>

                    {/* Orgs on right side of profile header */}
                    <div className="hidden sm:block space-y-2 text-[10px] text-slate-800 font-bold">
                      <div className="flex items-center gap-1.5">
                        <div className="w-4 h-4 rounded bg-blue-100 text-blue-700 font-extrabold flex items-center justify-center text-[8px]">I</div>
                        <span>InnovateTech Solutions</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-600 font-normal">
                        <div className="w-4 h-4 rounded bg-amber-100 text-amber-700 font-extrabold flex items-center justify-center text-[8px]">T</div>
                        <span>Tech Academy Institute</span>
                      </div>
                    </div>
                  </div>

                  {/* ACTION BUTTONS ROW */}
                  <div className="mt-4 flex flex-wrap items-center gap-2 relative">
                    <button className="px-4 py-1 rounded-full bg-[#0A66C2] text-white font-bold text-xs shadow-xs hover:bg-blue-700 transition-colors">
                      Open to
                    </button>
                    <button className="px-4 py-1 rounded-full border border-[#0A66C2] text-[#0A66C2] font-bold text-xs hover:bg-blue-50 transition-colors">
                      Add section
                    </button>
                    <button className="px-4 py-1 rounded-full border border-[#0A66C2] text-[#0A66C2] font-bold text-xs hover:bg-blue-50 transition-colors">
                      Enhance profile
                    </button>

                    {/* RESOURCES BUTTON CONTAINER (STEP 3 & STEP 4 TARGET) */}
                    <div className="relative">
                      <button className={`px-4 py-1 rounded-full border text-xs font-bold transition-all ${
                        stepIndex >= 2 
                          ? 'border-slate-700 bg-slate-100 text-slate-900 ring-2 ring-blue-500/30' 
                          : 'border-slate-500 text-slate-700 hover:bg-slate-100'
                      }`}>
                        Resources
                      </button>

                      {/* STEP 3 TARGET HIGHLIGHT ON "RESOURCES" BUTTON */}
                      {stepIndex === 2 && (
                        <>
                          <motion.div 
                            initial={{ opacity: 0, scale: 1.1 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="absolute -inset-1.5 border-3 border-blue-500 rounded-full shadow-[0_0_25px_rgba(59,130,246,0.9)] pointer-events-none z-30"
                          >
                            <motion.div 
                              animate={{ opacity: [0.1, 0.5, 0.1] }} 
                              transition={{ repeat: Infinity, duration: 1.5 }}
                              className="absolute inset-0 bg-blue-500/20 rounded-full"
                            />
                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap bg-blue-600 text-white text-[10px] font-black px-2 py-0.5 rounded shadow flex items-center gap-1">
                              <Target className="w-3 h-3 text-white" />
                              <span>Click Resources</span>
                              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 border-4 border-transparent border-t-blue-600" />
                            </div>
                          </motion.div>

                          <motion.div
                            initial={{ x: 35, y: 35, opacity: 0 }}
                            animate={{ x: 12, y: 10, opacity: 1 }}
                            transition={{ duration: 0.8, type: "spring" }}
                            className="absolute right-1 bottom-0 z-40 pointer-events-none drop-shadow-xl"
                          >
                            <MousePointer2 className="w-6 h-6 text-white fill-blue-600 -rotate-12" />
                            <motion.div 
                              initial={{ scale: 0, opacity: 1 }}
                              animate={{ scale: 3, opacity: 0 }}
                              transition={{ delay: 0.9, duration: 0.8, repeat: Infinity, repeatDelay: 1 }}
                              className="absolute -top-1 -left-1 w-5 h-5 border-2 border-blue-400 rounded-full"
                            />
                          </motion.div>
                        </>
                      )}

                      {/* STEP 4 TARGET: EXACT DROPDOWN MENU */}
                      {stepIndex === 3 && (
                        <motion.div 
                          initial={{ opacity: 0, y: -6 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="absolute left-0 bottom-full mb-2 w-60 bg-white rounded-xl shadow-2xl border border-slate-200 py-1.5 z-40 overflow-hidden"
                        >
                          {/* Item 1: Send profile in a message */}
                          <div className="px-3.5 py-2 text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 cursor-pointer text-xs">
                            <Send size={14} className="text-slate-600" />
                            <span className="font-medium">Send profile in a message</span>
                          </div>

                          {/* ITEM 2: SAVE TO PDF (TARGET) */}
                          <div className="relative">
                            <div className="px-3.5 py-2 bg-blue-50 text-blue-700 font-bold flex items-center gap-2.5 cursor-pointer text-xs border-l-3 border-[#0A66C2]">
                              <Download size={14} className="text-blue-700" />
                              <span>Save to PDF</span>
                            </div>

                            {/* STEP 4 TARGET HIGHLIGHT */}
                            <motion.div 
                              initial={{ opacity: 0, scale: 1.03 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className="absolute -inset-1 border-3 border-blue-500 rounded-lg shadow-[0_0_20px_rgba(59,130,246,0.9)] pointer-events-none z-30"
                            >
                              <motion.div 
                                animate={{ opacity: [0.15, 0.45, 0.15] }} 
                                transition={{ repeat: Infinity, duration: 1.5 }}
                                className="absolute inset-0 bg-blue-500/20 rounded-md"
                              />
                              <div className="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap bg-blue-600 text-white text-[10px] font-black px-2 py-0.5 rounded shadow flex items-center gap-1">
                                <Target className="w-3 h-3 text-white" />
                                <span>Click Save to PDF</span>
                                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 border-4 border-transparent border-t-blue-600" />
                              </div>
                            </motion.div>

                            {/* Pointer Cursor */}
                            <motion.div
                              initial={{ x: 40, y: 30, opacity: 0 }}
                              animate={{ x: 15, y: 8, opacity: 1 }}
                              transition={{ duration: 0.8, type: "spring" }}
                              className="absolute right-4 bottom-1 z-40 pointer-events-none drop-shadow-xl"
                            >
                              <MousePointer2 className="w-6 h-6 text-white fill-blue-600 -rotate-12" />
                              <motion.div 
                                initial={{ scale: 0, opacity: 1 }}
                                animate={{ scale: 3, opacity: 0 }}
                                transition={{ delay: 0.9, duration: 0.8, repeat: Infinity, repeatDelay: 1 }}
                                className="absolute -top-1 -left-1 w-5 h-5 border-2 border-blue-400 rounded-full"
                              />
                            </motion.div>
                          </div>

                          {/* Item 3: Saved items */}
                          <div className="px-3.5 py-2 text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 cursor-pointer text-xs">
                            <Bookmark size={14} className="text-slate-600" />
                            <span className="font-medium">Saved items</span>
                          </div>

                          {/* Item 4: Activity */}
                          <div className="px-3.5 py-2 text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 cursor-pointer text-xs">
                            <Activity size={14} className="text-slate-600" />
                            <span className="font-medium">Activity</span>
                          </div>

                          {/* Item 5: About this member */}
                          <div className="px-3.5 py-2 text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 cursor-pointer text-xs">
                            <Info size={14} className="text-slate-600" />
                            <span className="font-medium">About this member</span>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </div>

                </div>

              </div>

              {/* Analytics Card */}
              <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-xs text-slate-900">Analytics</h3>
                  <span className="text-[10px] text-slate-500 flex items-center gap-1"><Lock size={10} /> Private to you</span>
                </div>
                
                <div className="grid grid-cols-3 gap-3 pt-2 text-[10px]">
                  <div className="flex items-start gap-2">
                    <Eye size={16} className="text-slate-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-900 block text-xs">142 profile views</span>
                      <span className="text-[9px] text-slate-500">Discover who&apos;s viewed your profile.</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <BarChart2 size={16} className="text-slate-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-900 block text-xs">520 post impressions</span>
                      <span className="text-[9px] text-slate-500">Check out who&apos;s engaging with your posts.</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <TrendingUp size={16} className="text-slate-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-900 block text-xs">18 search appearances</span>
                      <span className="text-[9px] text-slate-500">See how often you appear in search results.</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Right Column: Profile Language & Public Profile Box */}
            <div className="md:col-span-4 space-y-3">
              
              <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3 text-xs">
                <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                  <div>
                    <h4 className="font-bold text-slate-900">Profile language</h4>
                    <p className="text-[10px] text-slate-500">English</p>
                  </div>
                  <Pencil size={14} className="text-slate-600" />
                </div>

                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-slate-900">Public profile &amp; URL</h4>
                    <p className="text-[10px] text-slate-500 font-mono">www.linkedin.com/in/arjun-sharma</p>
                  </div>
                  <Pencil size={14} className="text-slate-600" />
                </div>
              </div>

              {/* Who your viewers also viewed */}
              <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3 text-xs">
                <h4 className="font-bold text-slate-900">Who your viewers also viewed</h4>
                <p className="text-[9px] text-slate-400">Private to you</p>
                
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex items-center justify-between gap-2 py-1">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-slate-300 shrink-0" />
                      <div>
                        <p className="font-bold text-[10px] text-slate-800 line-clamp-1">Someone in Engineering...</p>
                      </div>
                    </div>
                    <button className="px-2.5 py-0.5 rounded-full border border-slate-400 text-slate-700 text-[10px] font-bold">
                      View
                    </button>
                  </div>
                ))}
              </div>

            </div>

          </div>
        )}

      </div>
    </div>
  );
}
