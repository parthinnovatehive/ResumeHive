"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { Layout, Wand2, Type, CheckCircle2, MousePointer2, Briefcase, GraduationCap } from "lucide-react";

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
        setTimeout(() => setTypingStep(0), 8000), // Loop the animation!
      ];
      return () => timers.forEach(clearTimeout);
    }
  }, [isInView, typingStep]);

  return (
    <section id="resume-builder" className="pt-8 pb-16 relative overflow-hidden" ref={containerRef}>
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
          <div className="flex-1 w-full max-w-2xl lg:max-w-none relative perspective-1200 group">
            {/* Background Glow */}
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/20 via-indigo-500/20 to-purple-500/20 blur-3xl rounded-full opacity-50 group-hover:opacity-100 transition-opacity duration-700" />

            <motion.div 
              initial={{ opacity: 0, rotateY: 15, scale: 0.95 }}
              whileInView={{ opacity: 1, rotateY: 0, scale: 1 }}
              whileHover={{ rotateY: -5, rotateX: 5, scale: 1.02 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, type: "spring", bounce: 0.3 }}
              className="relative w-full aspect-[4/3] rounded-2xl glass-card overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.3)] group-hover:shadow-[0_30px_60px_rgba(59,130,246,0.25)] border border-white/50 dark:border-slate-700/50 bg-slate-900/40 backdrop-blur-xl transition-shadow duration-500"
            >
              {/* Shimmer effect on hover */}
              <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/20 to-white/0 -translate-x-[150%] group-hover:translate-x-[150%] transition-transform duration-1000 ease-in-out z-20 pointer-events-none" />

              {/* App UI Header */}
              <div className="h-12 border-b border-slate-200/50 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-800/80 flex items-center px-4 gap-4 relative z-10">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-amber-400" />
                  <div className="w-3 h-3 rounded-full bg-emerald-400" />
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="w-1/2 h-6 bg-white dark:bg-slate-900 rounded-md shadow-inner border border-slate-200 dark:border-slate-700 flex items-center px-3 gap-2">
                    <Layout className="w-3 h-3 text-slate-400" />
                    <span className="text-[10px] text-slate-500 font-medium">Executive Template</span>
                  </div>
                </div>
              </div>

              {/* Editor Workspace */}
              <div className="flex h-[calc(100%-3rem)] bg-slate-100/50 dark:bg-slate-950/50 relative z-10">
                {/* Sidebar */}
                <div className="w-1/3 border-r border-slate-200/50 dark:border-slate-800/50 p-4 space-y-4 bg-white/40 dark:bg-slate-900/40">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Resume AI Tools</div>
                  <div className="space-y-3">
                    <div className="h-10 w-full bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 flex items-center px-3 gap-2 group/tool cursor-pointer">
                      <div className="w-5 h-5 rounded flex items-center justify-center bg-blue-500/10 group-hover/tool:bg-blue-500/20 transition-colors">
                        <Layout className="w-3 h-3 text-blue-500" />
                      </div>
                      <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300">Layout & Spacing</span>
                    </div>
                    
                    {/* Active AI Rewrite Tool */}
                    <div className="h-12 w-full bg-blue-50 dark:bg-blue-900/20 rounded-lg shadow-sm border border-blue-300 dark:border-blue-500/50 flex flex-col justify-center px-3 gap-1 relative overflow-hidden">
                      <div className="flex items-center gap-2">
                        <Wand2 className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                        <span className="text-[11px] font-bold text-blue-700 dark:text-blue-300">AI Rewrite</span>
                      </div>
                      <span className="text-[9px] text-blue-600/70 dark:text-blue-400/70">Optimizing for 'Senior Dev'</span>
                      <motion.div 
                        initial={{ x: "-100%" }}
                        animate={{ x: "200%" }}
                        transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-blue-400/20 to-transparent skew-x-12 pointer-events-none"
                      />
                    </div>

                    <div className="h-10 w-full bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 flex items-center px-3 gap-2 group/tool cursor-pointer">
                      <div className="w-5 h-5 rounded flex items-center justify-center bg-purple-500/10 group-hover/tool:bg-purple-500/20 transition-colors">
                        <Type className="w-3 h-3 text-purple-500" />
                      </div>
                      <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300">Typography</span>
                    </div>
                  </div>
                </div>

                {/* Main Preview (The Resume) */}
                <div className="flex-1 p-6 relative overflow-hidden flex justify-center bg-slate-200/50 dark:bg-black/20">
                  
                  {/* Animated Cursor */}
                  <motion.div
                    initial={{ x: 200, y: 250, opacity: 0 }}
                    animate={
                      typingStep === 0 ? { x: 150, y: 200, opacity: 1 } :
                      typingStep === 1 ? { x: 45, y: 150, opacity: 1, scale: 0.9 } : // Moves to bullet point and clicks
                      typingStep === 2 ? { x: 45, y: 150, opacity: 1, scale: 1 } :   // Typing
                      typingStep >= 3 ? { x: 150, y: 250, opacity: 0 } :             // Moves away
                      { x: 150, y: 250, opacity: 0 }
                    }
                    transition={{ duration: 0.8, ease: "easeInOut" }}
                    className="absolute z-50 text-slate-900 dark:text-white drop-shadow-xl pointer-events-none"
                  >
                    <MousePointer2 className="w-7 h-7 fill-black dark:fill-white text-white dark:text-black" />
                    {/* Click Ripple Effect */}
                    {typingStep === 1 && (
                      <motion.div 
                        initial={{ scale: 0, opacity: 0.8 }}
                        animate={{ scale: 2.5, opacity: 0 }}
                        transition={{ duration: 0.5 }}
                        className="absolute top-1 left-1 w-4 h-4 bg-blue-500 rounded-full mix-blend-screen"
                      />
                    )}
                  </motion.div>

                  <div className="w-full max-w-[400px] h-full bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 p-6 shadow-md flex flex-col gap-4 relative font-sans">
                    
                    {/* Header Section with Photo & Real Text */}
                    <div className="flex items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
                      <div className="w-14 h-14 rounded-full overflow-hidden shrink-0 border-2 border-slate-200 dark:border-slate-700 shadow-sm">
                        <img 
                          src="https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=200&auto=format&fit=crop" 
                          alt="Client Photo" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex flex-col justify-center">
                        <h1 className="text-[14px] font-bold text-slate-900 dark:text-white leading-tight">Jonathan Doe</h1>
                        <p className="text-[10px] text-premium-blue font-medium mb-1">Senior Software Engineer</p>
                        <p className="text-[9px] text-slate-500 dark:text-slate-400">San Francisco, CA • jonathan@example.com</p>
                      </div>
                    </div>

                    {/* Experience Section */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-1.5 mb-2">
                        <Briefcase className="w-3 h-3 text-slate-400" />
                        <h2 className="text-[11px] font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide">Professional Experience</h2>
                      </div>
                      
                      <div>
                        <div className="flex justify-between items-baseline mb-1">
                          <h3 className="text-[11px] font-bold text-slate-900 dark:text-white">TechFlow Solutions Inc.</h3>
                          <span className="text-[9px] font-medium text-slate-500">2020 - Present</span>
                        </div>
                        <p className="text-[10px] font-medium text-slate-600 dark:text-slate-300 mb-1.5 italic">Lead Full-Stack Developer</p>
                        
                        {/* Bullet Points */}
                        <div className="space-y-2 pl-3 border-l-2 border-slate-200 dark:border-slate-700">
                          <div className="flex items-start gap-1.5">
                            <div className="w-1 h-1 rounded-full bg-slate-400 mt-[5px] shrink-0" />
                            <p className="text-[9px] text-slate-600 dark:text-slate-400 leading-snug">Architected and deployed a highly scalable microservices infrastructure serving 2M+ active users.</p>
                          </div>
                          
                          {/* The AI Magic Replacement happens here */}
                          <div className="flex items-start gap-1.5 relative p-1 rounded-md transition-colors">
                            {typingStep >= 1 && (
                              <motion.div 
                                layoutId="ai-highlight"
                                className="absolute inset-0 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-500/30 rounded-md -z-10" 
                              />
                            )}
                            <div className={`w-1 h-1 rounded-full mt-[5px] shrink-0 ${typingStep >= 1 ? 'bg-blue-500' : 'bg-slate-400'}`} />
                            
                            <div className="flex-1">
                              {/* Old boring text */}
                              {typingStep === 0 && (
                                <p className="text-[9px] text-slate-600 dark:text-slate-400 leading-snug">Made the app faster and fixed a lot of bugs in the database code.</p>
                              )}
                              
                              {/* AI Processing */}
                              {typingStep === 1 && (
                                <div className="space-y-1 mt-1">
                                  <motion.div initial={{ width: "10%" }} animate={{ width: "100%" }} className="h-1.5 bg-blue-200/50 dark:bg-blue-900/50 rounded overflow-hidden">
                                    <div className="w-full h-full bg-blue-400/50 animate-pulse" />
                                  </motion.div>
                                  <motion.div initial={{ width: "10%" }} animate={{ width: "60%" }} className="h-1.5 bg-blue-200/50 dark:bg-blue-900/50 rounded overflow-hidden delay-100">
                                    <div className="w-full h-full bg-blue-400/50 animate-pulse" />
                                  </motion.div>
                                </div>
                              )}

                              {/* AI Typing the new brilliant text */}
                              {typingStep >= 2 && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative">
                                  <p className="text-[9.5px] font-semibold text-blue-700 dark:text-blue-300 leading-snug inline">
                                    Optimized database indexing and caching strategies, reducing API response times by 40%.
                                  </p>
                                  {typingStep === 2 && (
                                    <motion.span 
                                      className="inline-block w-1 h-[0.9em] bg-blue-500 ml-0.5 align-middle"
                                      animate={{ opacity: [1, 0, 1] }}
                                      transition={{ repeat: Infinity, duration: 0.6 }}
                                    />
                                  )}
                                </motion.div>
                              )}
                            </div>
                          </div>

                          <div className="flex items-start gap-1.5">
                            <div className="w-1 h-1 rounded-full bg-slate-400 mt-[5px] shrink-0" />
                            <p className="text-[9px] text-slate-600 dark:text-slate-400 leading-snug">Mentored a team of 5 junior developers, improving code review velocity by 25%.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* AI Sparkles Decorator */}
                  {typingStep >= 1 && typingStep <= 3 && (
                    <motion.div 
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-blue-500/20 blur-3xl rounded-full mix-blend-screen pointer-events-none"
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
