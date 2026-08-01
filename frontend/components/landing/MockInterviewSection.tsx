"use client";

import { motion, useInView, AnimatePresence } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { Sparkles, CheckCircle2, User, Mic, Activity, MessageSquare } from "lucide-react";

const INTERVIEW_SEQUENCE = [
  { id: 1, speaker: 'ai', text: "Hi, hello! Ready for your mock interview?", delay: 1000, duration: 3000 },
  { id: 2, speaker: 'user', text: "Yes, I'm ready. Let's do this!", delay: 4000, duration: 2500 },
  { id: 3, speaker: 'ai', text: "Great! Tell me about a time you optimized a slow React application.", delay: 7000, duration: 4000 },
  { id: 4, speaker: 'user', text: "I reduced initial load time by 40% by implementing code splitting and memoization.", delay: 11500, duration: 4000 },
  { id: 5, speaker: 'ai', text: "Excellent approach! How did you measure the performance gains?", delay: 16000, duration: 4000 },
];

export function MockInterviewSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-20%" });
  
  const [activeMessageId, setActiveMessageId] = useState<number | null>(null);

  useEffect(() => {
    if (!isInView) return;
    
    const timeouts: NodeJS.Timeout[] = [];
    
    const runSequence = () => {
      INTERVIEW_SEQUENCE.forEach((msg) => {
        timeouts.push(
          setTimeout(() => {
            setActiveMessageId(msg.id);
          }, msg.delay)
        );
      });
      
      // Loop the sequence
      timeouts.push(
        setTimeout(() => {
          runSequence();
        }, 21000)
      );
    };
    
    runSequence();
    
    return () => {
      timeouts.forEach(clearTimeout);
    };
  }, [isInView]);

  const currentMessage = INTERVIEW_SEQUENCE.find(m => m.id === activeMessageId);

  return (
    <section id="interview" className="pt-8 pb-16 relative overflow-hidden bg-slate-900" ref={containerRef}>
      
      {/* Attractive Glowing Background Theme */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-rose-500/10 rounded-full blur-[120px] mix-blend-screen animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px] mix-blend-screen"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          
          {/* Left Text */}
          <div className="flex-1 space-y-8">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-premium-rose/10 text-premium-rose font-semibold text-sm border border-premium-rose/20"
            >
              <MessageSquare className="w-4 h-4" /> AI Voice Coach
            </motion.div>
            
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ delay: 0.1 }}
              className="text-4xl lg:text-5xl font-extrabold tracking-tight text-white"
            >
              Practice until you're perfect.
            </motion.h2>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ delay: 0.2 }}
              className="text-lg text-slate-400 max-w-xl"
            >
              Nervous about the big day? Simulate realistic technical and behavioral interviews with our conversational AI coach. It talks to you, listens, and adapts.
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
                <div key={i} className="flex items-center gap-3 text-slate-300 font-medium">
                  <CheckCircle2 className="w-5 h-5 text-premium-rose shrink-0" />
                  {text}
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right Showcase: Interactive Interview Animation */}
          <div className="flex-1 w-full max-w-2xl lg:max-w-none relative perspective-1200 h-[500px] flex items-center justify-center">
            
            {/* Main Glowing Card */}
            <motion.div 
              initial={{ opacity: 0, rotateY: 20, scale: 0.9 }}
              whileInView={{ opacity: 1, rotateY: 0, scale: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1, type: "spring", bounce: 0.2 }}
              className="relative w-full max-w-[600px] rounded-3xl bg-slate-900/80 backdrop-blur-xl border border-white/10 p-8 shadow-[0_0_80px_rgba(225,29,72,0.15)] flex flex-col justify-between h-full max-h-[400px]"
            >
              
              {/* Outer Animated Glow */}
              <motion.div 
                className="absolute -inset-[1px] rounded-3xl bg-gradient-to-r from-premium-rose via-purple-500 to-blue-500 opacity-30 blur-sm -z-10"
                animate={{ opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              />

              {/* Top Header */}
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse shadow-[0_0_10px_rgba(244,63,94,0.8)]" />
                  <span className="text-xs font-bold text-white uppercase tracking-widest">Live Session</span>
                </div>
                <div className="flex gap-1">
                  {[1, 2, 3].map(i => (
                    <motion.div
                      key={i}
                      animate={{ height: ["4px", "12px", "4px"] }}
                      transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.15 }}
                      className="w-1 bg-premium-rose rounded-full"
                    />
                  ))}
                </div>
              </div>

              {/* Center Interview Stage */}
              <div className="flex-1 relative flex items-center justify-between px-4 mt-8">
                
                {/* AI Node (Left) */}
                <div className="flex flex-col items-center gap-4 relative z-20">
                  <div className={`relative w-20 h-20 rounded-full flex items-center justify-center transition-all duration-500 ${currentMessage?.speaker === 'ai' ? 'shadow-[0_0_40px_rgba(59,130,246,0.6)] scale-110' : 'shadow-none scale-100'}`}>
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full opacity-20 animate-ping" />
                    <div className="w-full h-full bg-gradient-to-br from-blue-600 to-purple-700 rounded-full flex items-center justify-center relative z-10 border-2 border-white/20">
                      <Sparkles className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <span className="text-xs font-bold text-white uppercase tracking-wider bg-black/50 px-3 py-1 rounded-full">Hive AI</span>
                </div>

                {/* Flying Chat Bubbles (Center) */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
                  <AnimatePresence mode="wait">
                    {currentMessage && (
                      <motion.div
                        key={currentMessage.id}
                        initial={
                          currentMessage.speaker === 'ai'
                            ? { x: -100, y: 0, scale: 0.5, opacity: 0 }
                            : { x: 100, y: 0, scale: 0.5, opacity: 0 }
                        }
                        animate={
                          currentMessage.speaker === 'ai'
                            ? { x: 20, y: -10, scale: 1, opacity: 1 }
                            : { x: -20, y: -10, scale: 1, opacity: 1 }
                        }
                        exit={{ opacity: 0, scale: 0.8, y: -40 }}
                        transition={{ duration: 1.5, type: "spring", bounce: 0.4 }}
                        className={`absolute max-w-[220px] p-4 rounded-2xl shadow-2xl backdrop-blur-md border ${
                          currentMessage.speaker === 'ai' 
                            ? 'bg-blue-500/20 border-blue-500/30 text-blue-100 rounded-tl-sm left-1/3' 
                            : 'bg-emerald-500/20 border-emerald-500/30 text-emerald-100 rounded-tr-sm right-1/3'
                        }`}
                      >
                        <p className="text-sm font-semibold leading-snug">"{currentMessage.text}"</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* User Node (Right) */}
                <div className="flex flex-col items-center gap-4 relative z-20">
                  <div className={`relative w-20 h-20 rounded-full flex items-center justify-center transition-all duration-500 ${currentMessage?.speaker === 'user' ? 'shadow-[0_0_40px_rgba(16,185,129,0.6)] scale-110' : 'shadow-none scale-100'}`}>
                    {currentMessage?.speaker === 'user' && (
                      <div className="absolute inset-0 bg-emerald-500/30 rounded-full animate-ping" />
                    )}
                    <div className="w-full h-full bg-slate-800 rounded-full overflow-hidden border-2 border-white/20 relative z-10 flex items-center justify-center">
                       <User className="w-10 h-10 text-slate-400" />
                    </div>
                    {/* Live Feedback Score */}
                    {currentMessage?.speaker === 'user' && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute -bottom-2 -left-8 px-2 py-1 rounded-md bg-emerald-500 text-white text-[10px] font-bold flex items-center gap-1 shadow-lg whitespace-nowrap"
                      >
                        <Activity className="w-3 h-3" /> 94% Clarity
                      </motion.div>
                    )}
                  </div>
                  <span className="text-xs font-bold text-white uppercase tracking-wider bg-black/50 px-3 py-1 rounded-full flex items-center gap-1">
                    You <Mic className={`w-3 h-3 ${currentMessage?.speaker === 'user' ? 'text-emerald-400' : 'text-slate-400'}`} />
                  </span>
                </div>

              </div>

            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}
