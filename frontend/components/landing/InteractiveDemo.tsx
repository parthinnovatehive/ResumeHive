"use client";

import { motion } from "framer-motion";
import { MousePointer2, CheckCircle, BarChart3, Star, LayoutTemplate } from "lucide-react";

export function InteractiveDemo() {
  return (
    <section className="py-32 relative z-10 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 text-center mb-16">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-4"
        >
          Build resumes that actually work.
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="text-lg text-slate-600 dark:text-slate-400 font-medium max-w-2xl mx-auto"
        >
          Experience our intelligent editor. Real-time feedback, ATS optimization, and beautiful templates instantly.
        </motion.p>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="relative rounded-2xl glass-card p-2 sm:p-4 shadow-premium-hover border border-white/60 dark:border-white/10 mx-auto aspect-[16/10] sm:aspect-video overflow-hidden bg-slate-100/50 dark:bg-slate-900/50"
        >
          {/* Mac Window Controls */}
          <div className="flex items-center gap-2 mb-4 px-2">
            <div className="w-3 h-3 rounded-full bg-red-400" />
            <div className="w-3 h-3 rounded-full bg-amber-400" />
            <div className="w-3 h-3 rounded-full bg-green-400" />
          </div>

          <div className="flex gap-4 h-[calc(100%-2rem)]">
            {/* Editor Sidebar */}
            <div className="w-1/3 hidden md:flex flex-col gap-4 rounded-xl glass-panel p-4 overflow-hidden relative">
              <div className="h-6 w-32 bg-slate-200 dark:bg-slate-700 rounded mb-4" />
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 w-full bg-slate-200/60 dark:bg-slate-800/60 rounded" />
                  <div className="h-10 w-full bg-slate-200 dark:bg-slate-700 rounded-lg" />
                </div>
              ))}
              
              {/* ATS Score Pop-in */}
              <motion.div 
                animate={{ scale: [0.9, 1, 0.9] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute bottom-4 left-4 right-4 bg-white dark:bg-slate-800 rounded-xl p-4 shadow-premium border border-premium-emerald/20"
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">ATS Score</span>
                  <span className="text-premium-emerald font-bold">98%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: "60%" }}
                    animate={{ width: ["60%", "98%", "60%"] }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                    className="h-full bg-gradient-to-r from-premium-blue to-premium-emerald"
                  />
                </div>
              </motion.div>
            </div>

            {/* Resume Preview */}
            <div className="flex-1 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-10 overflow-hidden relative flex flex-col gap-6">
              
              {/* Fake Resume Content */}
              <div className="space-y-2 mb-4">
                <div className="h-8 w-48 bg-slate-800 dark:bg-slate-100 rounded mb-1" />
                <div className="h-4 w-64 bg-slate-400 dark:bg-slate-500 rounded" />
              </div>
              
              <div className="space-y-4">
                <div className="h-5 w-32 bg-slate-300 dark:bg-slate-700 rounded" />
                <div className="space-y-2 pl-4 border-l-2 border-slate-200 dark:border-slate-800">
                  <div className="h-4 w-3/4 bg-slate-200 dark:bg-slate-800 rounded" />
                  <div className="h-4 w-5/6 bg-slate-200 dark:bg-slate-800 rounded relative overflow-hidden">
                    {/* Highlight Animation */}
                    <motion.div 
                      animate={{ x: ["-100%", "200%"] }}
                      transition={{ duration: 2, repeat: Infinity, delay: 1, ease: "linear" }}
                      className="absolute inset-0 bg-premium-emerald/30 skew-x-12"
                    />
                  </div>
                  <div className="h-4 w-4/5 bg-slate-200 dark:bg-slate-800 rounded" />
                </div>
              </div>

              {/* Fake AI Rewrite Context Menu */}
              <motion.div 
                animate={{ opacity: [0, 1, 1, 0], y: [10, 0, 0, -10] }}
                transition={{ duration: 8, repeat: Infinity, times: [0, 0.1, 0.8, 1] }}
                className="absolute top-1/2 left-1/3 glass-pill p-2 rounded-xl flex items-center gap-2"
              >
                <div className="bg-premium-purple/10 p-1.5 rounded-lg">
                  <Star className="w-4 h-4 text-premium-purple" />
                </div>
                <span className="text-xs font-medium text-slate-800 dark:text-slate-200 pr-2">AI Rewriting...</span>
              </motion.div>
            </div>

            {/* Animated Cursor */}
            <motion.div 
              animate={{ 
                x: [50, 300, 300, 50],
                y: [50, 150, 300, 50]
              }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
              className="absolute z-50 pointer-events-none"
            >
              <MousePointer2 className="w-8 h-8 text-slate-900 dark:text-white drop-shadow-md" fill="currentColor" />
              <div className="w-6 h-6 rounded-full bg-premium-blue/20 blur-md absolute -top-1 -left-1" />
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
