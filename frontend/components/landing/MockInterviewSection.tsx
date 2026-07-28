"use client";

import { motion, useInView, AnimatePresence } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { Video, CheckCircle2, Mic, User, Sparkles, Activity } from "lucide-react";

export function MockInterviewSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-20%" });
  const [activeSpeaker, setActiveSpeaker] = useState<'ai' | 'user' | null>(null);

  useEffect(() => {
    if (isInView) {
      const sequence = async () => {
        // AI asks question
        setActiveSpeaker('ai');
        await new Promise(r => setTimeout(r, 2000));
        
        // Pause
        setActiveSpeaker(null);
        await new Promise(r => setTimeout(r, 500));
        
        // User answers
        setActiveSpeaker('user');
        await new Promise(r => setTimeout(r, 3000));
        
        // Loop
        setActiveSpeaker(null);
      };
      
      sequence();
      const interval = setInterval(sequence, 6000);
      return () => clearInterval(interval);
    }
  }, [isInView]);

  return (
    <section id="interview" className="py-32 relative overflow-hidden" ref={containerRef}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          
          {/* Left Text */}
          <div className="flex-1 space-y-8">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-premium-rose/10 text-premium-rose font-semibold text-sm"
            >
              <Video className="w-4 h-4" /> AI Mock Interview
            </motion.div>
            
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ delay: 0.1 }}
              className="text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white"
            >
              Practice until you're perfect.
            </motion.h2>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ delay: 0.2 }}
              className="text-lg text-slate-600 dark:text-slate-400 max-w-xl"
            >
              Nervous about the big day? Simulate realistic technical and behavioral interviews with our conversational AI coach.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ delay: 0.3 }}
              className="space-y-4 pt-4"
            >
              {[
                "Real-time voice and speech pace analysis",
                "Questions tailored to the specific job description",
                "Instant feedback on confidence and clarity"
              ].map((text, i) => (
                <div key={i} className="flex items-center gap-3 text-slate-700 dark:text-slate-300 font-medium">
                  <CheckCircle2 className="w-5 h-5 text-premium-rose shrink-0" />
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
              className="relative w-full aspect-[4/3] rounded-2xl glass-card overflow-hidden shadow-2xl border border-white/50 dark:border-slate-700/50 bg-slate-950 flex flex-col"
            >
              
              {/* Header */}
              <div className="h-14 border-b border-white/10 flex items-center justify-between px-6 bg-white/5">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">Recording Session</span>
                </div>
                <div className="text-xs text-white/50 font-mono">14:23</div>
              </div>

              {/* Video Grid */}
              <div className="flex-1 p-4 grid grid-cols-2 gap-4">
                
                {/* AI Interviewer */}
                <div className={`relative rounded-xl overflow-hidden bg-slate-900 border-2 transition-colors duration-300 ${activeSpeaker === 'ai' ? 'border-premium-blue' : 'border-white/5'}`}>
                  {/* Fake Video Feed (AI Avatar) */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-premium-blue to-purple-600 flex items-center justify-center shadow-[0_0_30px_rgba(15,82,186,0.5)]">
                      <Sparkles className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  
                  {/* Name Tag */}
                  <div className="absolute bottom-3 left-3 px-3 py-1.5 rounded-lg bg-black/50 backdrop-blur-md text-white text-xs font-medium flex items-center gap-2">
                    Hive AI <span className="text-white/50">(Interviewer)</span>
                  </div>

                  {/* Audio Waves */}
                  {activeSpeaker === 'ai' && (
                    <div className="absolute top-3 right-3 flex items-center gap-1">
                      {[1, 2, 3].map(i => (
                        <motion.div
                          key={i}
                          animate={{ height: ["4px", "16px", "4px"] }}
                          transition={{ repeat: Infinity, duration: 0.5, delay: i * 0.1 }}
                          className="w-1 bg-premium-blue rounded-full"
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* User */}
                <div className={`relative rounded-xl overflow-hidden bg-slate-800 border-2 transition-colors duration-300 ${activeSpeaker === 'user' ? 'border-premium-emerald' : 'border-white/5'}`}>
                  <div className="absolute inset-0 flex items-center justify-center opacity-30">
                    <User className="w-24 h-24 text-white" />
                  </div>
                  
                  {/* Face Mesh Overlay (Fake) */}
                  <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                  
                  <div className="absolute bottom-3 left-3 px-3 py-1.5 rounded-lg bg-black/50 backdrop-blur-md text-white text-xs font-medium flex items-center gap-2">
                    You <Mic className="w-3 h-3 text-emerald-400" />
                  </div>

                  {/* Live Feedback Score */}
                  <div className="absolute top-3 right-3 px-2 py-1 rounded-md bg-black/50 backdrop-blur-md border border-white/10 flex items-center gap-2">
                    <Activity className="w-3 h-3 text-emerald-400" />
                    <span className="text-xs font-bold text-white">94% Clarity</span>
                  </div>

                  {/* Audio Waves */}
                  {activeSpeaker === 'user' && (
                    <div className="absolute bottom-3 right-3 flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map(i => (
                        <motion.div
                          key={i}
                          animate={{ height: ["4px", `${Math.random() * 16 + 8}px`, "4px"] }}
                          transition={{ repeat: Infinity, duration: 0.4, delay: i * 0.1 }}
                          className="w-1 bg-premium-emerald rounded-full"
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Subtitles Area */}
              <div className="h-20 border-t border-white/10 p-4 flex items-center justify-center text-center">
                <AnimatePresence mode="wait">
                  {activeSpeaker === 'ai' && (
                    <motion.p 
                      key="ai"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="text-sm font-medium text-white max-w-[80%]"
                    >
                      "Can you tell me about a time you optimized a slow React application?"
                    </motion.p>
                  )}
                  {activeSpeaker === 'user' && (
                    <motion.p 
                      key="user"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="text-sm text-slate-300 max-w-[80%]"
                    >
                      "Yes, at my previous role, I noticed the initial load time was over 4 seconds..."
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}
