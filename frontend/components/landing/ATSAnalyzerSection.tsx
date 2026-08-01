"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { BarChart3, ScanLine, CheckCircle2, AlertCircle, TrendingUp, Target } from "lucide-react";

export function ATSAnalyzerSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-20%" });
  const [scanProgress, setScanProgress] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    
    let current = 0;
    let isWaiting = false;
    
    const interval = setInterval(() => {
      if (isWaiting) return;
      
      current += 1.5;
      if (current <= 100) {
        setScanProgress(current);
      } else {
        isWaiting = true;
        setTimeout(() => {
          current = 0;
          setScanProgress(0);
          isWaiting = false;
        }, 3000);
      }
    }, 50);
    
    return () => clearInterval(interval);
  }, [isInView]);

  return (
    <section id="ats-analyzer" className="pt-8 pb-16 relative overflow-hidden bg-slate-50 dark:bg-slate-900/30" ref={containerRef}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col-reverse lg:flex-row items-center gap-16">
          
          {/* Left Showcase */}
          <div className="flex-1 w-full max-w-2xl lg:max-w-none relative perspective-1200 group">
            {/* Background Glow */}
            <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/20 via-teal-500/20 to-cyan-500/20 blur-3xl rounded-full opacity-50 group-hover:opacity-100 transition-opacity duration-700" />

            <motion.div 
              initial={{ opacity: 0, rotateY: -15, scale: 0.95 }}
              whileInView={{ opacity: 1, rotateY: 0, scale: 1 }}
              whileHover={{ rotateY: 5, rotateX: -5, scale: 1.02 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, type: "spring", bounce: 0.3 }}
              className="relative w-full aspect-[4/3] rounded-2xl glass-card overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.3)] group-hover:shadow-[0_30px_60px_rgba(16,185,129,0.25)] border border-white/50 dark:border-slate-700/50 flex transition-shadow duration-500"
            >
              {/* Shimmer effect on hover */}
              <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/20 to-white/0 -translate-x-[150%] group-hover:translate-x-[150%] transition-transform duration-1000 ease-in-out z-30 pointer-events-none" />

              {/* Left Column: ATS Document */}
              <div className="w-1/2 h-full bg-white dark:bg-slate-950 p-6 relative overflow-hidden border-r border-slate-200/50 dark:border-slate-800/50 font-sans">
                
                {/* Mock Document Content with Real Text */}
                <div className="space-y-4 opacity-80">
                  <div className="border-b border-slate-200 dark:border-slate-800 pb-3 mb-4">
                     <h1 className="text-[14px] font-bold text-slate-900 dark:text-white leading-tight mb-1">Sarah Jenkins</h1>
                     <p className="text-[9px] text-slate-500 dark:text-slate-400">Data Scientist • sarah.j@example.com • (555) 123-4567</p>
                  </div>
                  
                  <div className="space-y-1">
                    <h2 className="text-[11px] font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide">Experience</h2>
                    <h3 className="text-[10px] font-bold text-slate-900 dark:text-white mt-2">Senior Data Analyst | TechCorp</h3>
                  </div>

                  <div className="space-y-2 pt-2">
                    {scanProgress > 40 ? (
                      <motion.div initial={{ opacity: 0, backgroundColor: "transparent" }} animate={{ opacity: 1, backgroundColor: "rgba(16, 185, 129, 0.15)" }} className="p-1 rounded relative overflow-hidden">
                        <div className="absolute inset-0 border border-emerald-500/50 rounded" />
                        <p className="text-[9px] text-emerald-800 dark:text-emerald-300 font-medium leading-snug relative z-10">
                           Implemented machine learning models using Python and TensorFlow, increasing predictive accuracy by 24%.
                        </p>
                      </motion.div>
                    ) : (
                      <p className="text-[9px] text-slate-600 dark:text-slate-400 leading-snug px-1">
                         Implemented machine learning models using Python and TensorFlow, increasing predictive accuracy by 24%.
                      </p>
                    )}
                  </div>
                  
                  <div className="space-y-2 pt-2">
                    {scanProgress > 70 ? (
                      <motion.div initial={{ opacity: 0, backgroundColor: "transparent" }} animate={{ opacity: 1, backgroundColor: "rgba(239, 68, 68, 0.1)" }} className="p-1 rounded relative overflow-hidden">
                        <div className="absolute inset-0 border border-red-500/50 rounded" />
                        <p className="text-[9px] text-red-800 dark:text-red-300 font-medium leading-snug relative z-10">
                           Helped with the database team to organize data for the new marketing campaign.
                        </p>
                      </motion.div>
                    ) : (
                      <p className="text-[9px] text-slate-600 dark:text-slate-400 leading-snug px-1">
                         Helped with the database team to organize data for the new marketing campaign.
                      </p>
                    )}
                  </div>
                  
                  <div className="space-y-2 pt-2">
                     <p className="text-[9px] text-slate-600 dark:text-slate-400 leading-snug px-1">
                         Designed automated ETL pipelines to process 500GB+ of daily telemetry data.
                     </p>
                  </div>
                </div>

                {/* Laser Scan Effect */}
                {scanProgress > 0 && scanProgress < 100 && (
                  <div 
                    className="absolute left-0 right-0 h-1 bg-emerald-400 shadow-[0_0_20px_4px_rgba(52,211,153,0.7)] z-20"
                    style={{ top: `${scanProgress}%` }}
                  />
                )}
                {scanProgress > 0 && scanProgress < 100 && (
                  <div 
                    className="absolute left-0 right-0 top-0 bg-emerald-500/10 z-10 mix-blend-overlay"
                    style={{ height: `${scanProgress}%` }}
                  />
                )}
              </div>

              {/* Right Column: ATS Dashboard */}
              <div className="w-1/2 h-full bg-slate-50 dark:bg-slate-900 p-6 flex flex-col items-center justify-center relative overflow-hidden">
                
                {/* Background Decorator */}
                <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-emerald-500/10 blur-[80px] rounded-full pointer-events-none" />
                
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-6 flex items-center gap-2 w-full">
                  <ScanLine className="w-4 h-4 text-emerald-500" /> Live ATS Scan
                </div>
                
                {/* Circular Progress */}
                <div className="relative w-28 h-28 flex items-center justify-center mb-6 drop-shadow-lg">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="56" cy="56" r="48" className="stroke-slate-200 dark:stroke-slate-800" strokeWidth="10" fill="none" />
                    <motion.circle 
                      cx="56" cy="56" r="48" 
                      className="stroke-emerald-500" 
                      strokeWidth="10" fill="none" 
                      strokeLinecap="round"
                      strokeDasharray="301.59"
                      strokeDashoffset={301.59 - (301.59 * (scanProgress * 0.99)) / 100}
                      transition={{ duration: 0.1 }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">
                      {Math.floor(scanProgress * 0.99)}
                    </span>
                    <span className="text-[9px] font-bold text-emerald-500 tracking-widest uppercase mt-[-4px]">Score</span>
                  </div>
                </div>

                {/* Feedback List */}
                <div className="w-full space-y-3 relative z-10">
                  
                  {/* Match 1 */}
                  <div className={`p-2.5 rounded-lg border flex items-center gap-3 transition-all duration-500 transform ${scanProgress > 40 ? 'opacity-100 translate-y-0 border-emerald-200 dark:border-emerald-500/30 bg-emerald-50/80 dark:bg-emerald-500/10 shadow-sm' : 'opacity-0 translate-y-2'}`}>
                    <div className="w-7 h-7 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center shrink-0">
                      <Target className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <div className="text-[11px] font-bold text-slate-900 dark:text-white leading-none mb-1">Hard Skills Found</div>
                      <div className="text-[9px] text-emerald-700 dark:text-emerald-400 font-medium">Python, TensorFlow, ETL</div>
                    </div>
                  </div>
                  
                  {/* Match 2 */}
                  <div className={`p-2.5 rounded-lg border flex items-center gap-3 transition-all duration-500 transform ${scanProgress > 70 ? 'opacity-100 translate-y-0 border-red-200 dark:border-red-500/30 bg-red-50/80 dark:bg-red-500/10 shadow-sm' : 'opacity-0 translate-y-2'}`}>
                    <div className="w-7 h-7 rounded-full bg-red-100 dark:bg-red-500/20 flex items-center justify-center shrink-0">
                      <TrendingUp className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
                    </div>
                    <div>
                      <div className="text-[11px] font-bold text-slate-900 dark:text-white leading-none mb-1">Weak Impact Verb</div>
                      <div className="text-[9px] text-red-700 dark:text-red-400 font-medium">Change 'Helped with' to 'Spearheaded'</div>
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
