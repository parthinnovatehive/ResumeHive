"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { BarChart3, ScanLine, CheckCircle2, AlertCircle } from "lucide-react";

export function ATSAnalyzerSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-20%" });
  const [scanProgress, setScanProgress] = useState(0);

  useEffect(() => {
    if (isInView) {
      let current = 0;
      const interval = setInterval(() => {
        current += 2;
        if (current <= 100) {
          setScanProgress(current);
        } else {
          clearInterval(interval);
        }
      }, 50);
      return () => clearInterval(interval);
    }
  }, [isInView]);

  return (
    <section id="ats-analyzer" className="py-32 relative overflow-hidden bg-slate-50 dark:bg-slate-900/30" ref={containerRef}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col-reverse lg:flex-row items-center gap-16">
          
          {/* Left Showcase */}
          <div className="flex-1 w-full max-w-2xl lg:max-w-none relative perspective-1000">
            <motion.div 
              initial={{ opacity: 0, rotateY: -20, scale: 0.9 }}
              whileInView={{ opacity: 1, rotateY: 0, scale: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1, type: "spring", bounce: 0.2 }}
              className="relative w-full aspect-[4/3] rounded-2xl glass-card overflow-hidden shadow-2xl border border-white/50 dark:border-slate-700/50 flex"
            >
              {/* Left Column: ATS Document */}
              <div className="w-1/2 h-full bg-slate-100 dark:bg-slate-950 p-6 relative overflow-hidden border-r border-slate-200/50 dark:border-slate-800/50">
                {/* Mock Document Content */}
                <div className="space-y-4 opacity-70">
                  <div className="h-6 w-3/4 bg-slate-300 dark:bg-slate-700 rounded" />
                  <div className="h-3 w-full bg-slate-200 dark:bg-slate-800 rounded" />
                  <div className="h-3 w-5/6 bg-slate-200 dark:bg-slate-800 rounded" />
                  <div className="space-y-2 pt-4">
                    <div className="h-4 w-1/2 bg-slate-300 dark:bg-slate-700 rounded" />
                    <div className="h-3 w-full bg-slate-200 dark:bg-slate-800 rounded" />
                    {scanProgress > 40 ? (
                      <motion.div initial={{ opacity: 0, backgroundColor: "transparent" }} animate={{ opacity: 1, backgroundColor: "rgba(16, 185, 129, 0.2)" }} className="h-3 w-4/5 rounded relative overflow-hidden">
                        <div className="absolute inset-0 border border-emerald-500/50 rounded" />
                      </motion.div>
                    ) : (
                      <div className="h-3 w-4/5 bg-slate-200 dark:bg-slate-800 rounded" />
                    )}
                  </div>
                  <div className="space-y-2 pt-4">
                    <div className="h-4 w-1/3 bg-slate-300 dark:bg-slate-700 rounded" />
                    <div className="h-3 w-full bg-slate-200 dark:bg-slate-800 rounded" />
                    {scanProgress > 70 ? (
                      <motion.div initial={{ opacity: 0, backgroundColor: "transparent" }} animate={{ opacity: 1, backgroundColor: "rgba(239, 68, 68, 0.1)" }} className="h-3 w-[90%] rounded relative overflow-hidden">
                        <div className="absolute inset-0 border border-red-500/50 rounded" />
                      </motion.div>
                    ) : (
                      <div className="h-3 w-[90%] bg-slate-200 dark:bg-slate-800 rounded" />
                    )}
                  </div>
                </div>

                {/* Laser Scan Effect */}
                {scanProgress < 100 && (
                  <div 
                    className="absolute left-0 right-0 h-1 bg-premium-emerald shadow-[0_0_15px_3px_rgba(16,185,129,0.5)] z-20"
                    style={{ top: `${scanProgress}%` }}
                  />
                )}
                {scanProgress < 100 && (
                  <div 
                    className="absolute left-0 right-0 top-0 bg-premium-emerald/10 z-10 mix-blend-overlay"
                    style={{ height: `${scanProgress}%` }}
                  />
                )}
              </div>

              {/* Right Column: ATS Dashboard */}
              <div className="w-1/2 h-full bg-white dark:bg-slate-900 p-6 flex flex-col items-center justify-center relative">
                <div className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-8 flex items-center gap-2">
                  <ScanLine className="w-4 h-4" /> System Scan
                </div>
                
                {/* Circular Progress */}
                <div className="relative w-32 h-32 flex items-center justify-center mb-8">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="64" cy="64" r="56" className="stroke-slate-100 dark:stroke-slate-800" strokeWidth="12" fill="none" />
                    <motion.circle 
                      cx="64" cy="64" r="56" 
                      className="stroke-premium-emerald" 
                      strokeWidth="12" fill="none" 
                      strokeLinecap="round"
                      strokeDasharray="351.86"
                      strokeDashoffset={351.86 - (351.86 * (scanProgress >= 100 ? 92 : Math.max(0, scanProgress - 10))) / 100}
                      transition={{ duration: 0.1 }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                      {scanProgress >= 100 ? '92' : Math.floor(scanProgress)}<span className="text-lg">%</span>
                    </span>
                  </div>
                </div>

                {/* Feedback List */}
                <div className="w-full space-y-3">
                  <div className={`p-3 rounded-xl border flex items-start gap-3 transition-opacity duration-300 ${scanProgress > 40 ? 'opacity-100 border-emerald-100 dark:border-emerald-900/30 bg-emerald-50 dark:bg-emerald-500/5' : 'opacity-0'}`}>
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white">Strong Keywords</div>
                      <div className="text-[10px] text-slate-500">React, TypeScript found.</div>
                    </div>
                  </div>
                  <div className={`p-3 rounded-xl border flex items-start gap-3 transition-opacity duration-300 ${scanProgress > 70 ? 'opacity-100 border-red-100 dark:border-red-900/30 bg-red-50 dark:bg-red-500/5' : 'opacity-0'}`}>
                    <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white">Missing Action Verbs</div>
                      <div className="text-[10px] text-slate-500">Replace "helped with" with "Spearheaded".</div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Text */}
          <div className="flex-1 space-y-8">
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-premium-emerald/10 text-premium-emerald font-semibold text-sm"
            >
              <BarChart3 className="w-4 h-4" /> ATS Analyzer
            </motion.div>
            
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ delay: 0.1 }}
              className="text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white"
            >
              Beat the bots every single time.
            </motion.h2>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ delay: 0.2 }}
              className="text-lg text-slate-600 dark:text-slate-400 max-w-xl"
            >
              Don't get rejected before a human even reads your resume. Our deep-scan technology parses your document exactly how enterprise HR systems do.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ delay: 0.3 }}
              className="space-y-4 pt-4"
            >
              {[
                "Real-time keyword matching against job descriptions",
                "Action verb detection and impact scoring",
                "Formatting checks to prevent parsing failures"
              ].map((text, i) => (
                <div key={i} className="flex items-center gap-3 text-slate-700 dark:text-slate-300 font-medium">
                  <CheckCircle2 className="w-5 h-5 text-premium-emerald shrink-0" />
                  {text}
                </div>
              ))}
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}
