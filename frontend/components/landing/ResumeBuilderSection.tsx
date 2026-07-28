"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { Layout, Wand2, Type, CheckCircle2 } from "lucide-react";

export function ResumeBuilderSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-20%" });
  const [typingStep, setTypingStep] = useState(0);

  useEffect(() => {
    if (isInView) {
      const timers = [
        setTimeout(() => setTypingStep(1), 1000),
        setTimeout(() => setTypingStep(2), 2500),
        setTimeout(() => setTypingStep(3), 4000),
        setTimeout(() => setTypingStep(4), 5500),
      ];
      return () => timers.forEach(clearTimeout);
    }
  }, [isInView]);

  return (
    <section id="resume-builder" className="py-32 relative overflow-hidden" ref={containerRef}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          
          {/* Left Text */}
          <div className="flex-1 space-y-8">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-premium-blue/10 text-premium-blue font-semibold text-sm"
            >
              <Wand2 className="w-4 h-4" /> AI Resume Builder
            </motion.div>
            
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ delay: 0.1 }}
              className="text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white"
            >
              Build a winning resume in minutes.
            </motion.h2>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ delay: 0.2 }}
              className="text-lg text-slate-600 dark:text-slate-400 max-w-xl"
            >
              Our AI engine writes compelling bullet points, fixes formatting, and structures your experience to bypass ATS filters effortlessly.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ delay: 0.3 }}
              className="space-y-4 pt-4"
            >
              {[
                "Auto-generated bullet points tailored to your role",
                "Instant professional formatting & templates",
                "Built-in grammar and tone correction"
              ].map((text, i) => (
                <div key={i} className="flex items-center gap-3 text-slate-700 dark:text-slate-300 font-medium">
                  <CheckCircle2 className="w-5 h-5 text-premium-emerald shrink-0" />
                  {text}
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right Showcase */}
          <div className="flex-1 w-full max-w-2xl lg:max-w-none relative perspective-1000">
            <motion.div 
              initial={{ opacity: 0, rotateY: 20, scale: 0.9 }}
              whileInView={{ opacity: 1, rotateY: 0, scale: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1, type: "spring", bounce: 0.2 }}
              className="relative w-full aspect-[4/3] rounded-2xl glass-card overflow-hidden shadow-2xl border border-white/50 dark:border-slate-700/50"
            >
              {/* App UI Header */}
              <div className="h-12 border-b border-slate-200/50 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-800/50 backdrop-blur-md flex items-center px-4 gap-4">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-amber-400" />
                  <div className="w-3 h-3 rounded-full bg-emerald-400" />
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="w-1/2 h-6 bg-white dark:bg-slate-900 rounded-md shadow-sm border border-slate-200 dark:border-slate-700 flex items-center px-3 gap-2">
                    <Layout className="w-3 h-3 text-slate-400" />
                    <span className="text-[10px] text-slate-500 font-medium">Professional Template</span>
                  </div>
                </div>
              </div>

              {/* Editor Workspace */}
              <div className="flex h-[calc(100%-3rem)] bg-white dark:bg-slate-950">
                {/* Sidebar */}
                <div className="w-1/3 border-r border-slate-100 dark:border-slate-800 p-4 space-y-4">
                  <div className="h-4 w-1/2 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
                  <div className="space-y-2">
                    <div className="h-8 w-full bg-slate-100 dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-800" />
                    <div className="h-8 w-full bg-slate-100 dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-800" />
                    <div className="h-8 w-full bg-premium-blue/10 rounded border border-premium-blue/30 relative overflow-hidden">
                      <motion.div 
                        initial={{ x: "-100%" }}
                        animate={{ x: "100%" }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-premium-blue/20 to-transparent skew-x-12"
                      />
                    </div>
                  </div>
                </div>

                {/* Main Preview (The Resume) */}
                <div className="flex-1 p-6 relative overflow-hidden">
                  <div className="w-full h-full bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 p-6 shadow-sm flex flex-col gap-6">
                    {/* Header Section */}
                    <div className="text-center border-b border-slate-200 dark:border-slate-700 pb-4">
                      <div className="h-6 w-1/2 bg-slate-800 dark:bg-slate-200 rounded mx-auto mb-2" />
                      <div className="h-3 w-3/4 bg-slate-300 dark:bg-slate-600 rounded mx-auto" />
                    </div>

                    {/* Experience Section */}
                    <div className="space-y-3">
                      <div className="h-4 w-1/4 bg-premium-blue/40 rounded mb-2" />
                      <div className="flex justify-between">
                        <div className="h-3 w-1/3 bg-slate-600 dark:bg-slate-400 rounded" />
                        <div className="h-3 w-1/5 bg-slate-300 dark:bg-slate-600 rounded" />
                      </div>
                      
                      {/* Typing Animation Area */}
                      <div className="space-y-2 pl-4 border-l-2 border-slate-200 dark:border-slate-700">
                        <div className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1 shrink-0" />
                          <div className="h-3 w-[90%] bg-slate-200 dark:bg-slate-800 rounded" />
                        </div>
                        
                        {/* The AI Magic happens here */}
                        <div className="flex items-start gap-2 relative">
                          <div className="w-1.5 h-1.5 rounded-full bg-premium-blue mt-1 shrink-0" />
                          
                          <div className="flex-1">
                            {typingStep === 0 && <div className="h-3 w-4 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />}
                            {typingStep === 1 && (
                              <motion.div initial={{ width: "10%" }} animate={{ width: "100%" }} className="h-3 bg-premium-blue/20 rounded overflow-hidden">
                                <div className="w-full h-full bg-premium-blue/40 animate-pulse" />
                              </motion.div>
                            )}
                            {typingStep >= 2 && (
                              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-3 w-[95%] bg-premium-blue/80 rounded relative">
                                {typingStep === 2 && (
                                  <motion.div 
                                    className="absolute -right-2 top-1/2 -translate-y-1/2"
                                    animate={{ opacity: [1, 0, 1] }}
                                    transition={{ repeat: Infinity, duration: 0.8 }}
                                  >
                                    <Type className="w-3 h-3 text-premium-blue" />
                                  </motion.div>
                                )}
                              </motion.div>
                            )}
                          </div>
                        </div>

                        {typingStep >= 3 && (
                          <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1 shrink-0" />
                            <div className="h-3 w-[85%] bg-slate-200 dark:bg-slate-800 rounded" />
                          </motion.div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* AI Sparkles Decorator */}
                  {typingStep >= 1 && typingStep <= 3 && (
                    <motion.div 
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-premium-blue/20 blur-3xl rounded-full mix-blend-screen pointer-events-none"
                    />
                  )}
                </div>
              </div>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}
