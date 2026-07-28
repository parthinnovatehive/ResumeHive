"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { Briefcase, CheckCircle2, MapPin, DollarSign, Building, Sparkles } from "lucide-react";
import { MagneticWrapper } from "../ui/MagneticWrapper";

const MOCK_JOBS = [
  { role: "Senior Frontend Engineer", company: "Vercel", location: "Remote", salary: "$160k - $200k", match: 98, color: "emerald" },
  { role: "Full Stack Developer", company: "Linear", location: "San Francisco", salary: "$150k - $180k", match: 94, color: "blue" },
  { role: "React Engineer", company: "OpenAI", location: "Remote", salary: "$170k - $220k", match: 91, color: "purple" }
];

export function JobSearchSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-20%" });
  const [hoveredJob, setHoveredJob] = useState<number | null>(null);

  return (
    <section id="jobs" className="py-32 relative overflow-hidden bg-slate-50 dark:bg-slate-900/30" ref={containerRef}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col-reverse lg:flex-row items-center gap-16">
          
          {/* Left Showcase */}
          <div className="flex-1 w-full max-w-2xl lg:max-w-none relative perspective-1000">
            <motion.div 
              initial={{ opacity: 0, rotateY: -20, scale: 0.9 }}
              whileInView={{ opacity: 1, rotateY: 0, scale: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1, type: "spring", bounce: 0.2 }}
              className="relative w-full aspect-[4/3] rounded-2xl glass-card overflow-hidden shadow-2xl border border-white/50 dark:border-slate-700/50 p-8 flex flex-col justify-center"
            >
              
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-premium-purple/10 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-premium-purple" />
                  </div>
                  <span className="font-semibold text-slate-900 dark:text-white">AI Job Matches</span>
                </div>
                <span className="text-xs font-medium px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-md text-slate-500">Based on your resume</span>
              </div>

              <div className="space-y-4 relative z-10">
                {MOCK_JOBS.map((job, idx) => {
                  const isHovered = hoveredJob === idx;
                  const isNotHovered = hoveredJob !== null && hoveredJob !== idx;
                  
                  return (
                    <motion.div
                      key={idx}
                      onHoverStart={() => setHoveredJob(idx)}
                      onHoverEnd={() => setHoveredJob(null)}
                      initial={{ opacity: 0, y: 20 }}
                      animate={isInView ? { opacity: isNotHovered ? 0.4 : 1, y: 0, scale: isHovered ? 1.02 : 1 } : {}}
                      transition={{ duration: 0.4, delay: isInView ? idx * 0.1 : 0 }}
                      className="w-full bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm cursor-pointer relative overflow-hidden group"
                    >
                      {/* Match Score Badge */}
                      <div className="absolute top-4 right-4 flex items-center gap-1 px-2 py-1 rounded-md bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/50">
                        <span className="text-xs font-bold">{job.match}% Match</span>
                      </div>

                      <div className="flex gap-4">
                        <div className="w-12 h-12 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                          <Building className="w-6 h-6 text-slate-400" />
                        </div>
                        <div className="flex-1 pt-1">
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-premium-purple transition-colors">{job.role}</h4>
                          <p className="text-xs text-slate-500 font-medium">{job.company}</p>
                          
                          {/* Expanded Details */}
                          <motion.div 
                            initial={{ height: 0, opacity: 0, marginTop: 0 }}
                            animate={{ 
                              height: isHovered ? "auto" : 0, 
                              opacity: isHovered ? 1 : 0,
                              marginTop: isHovered ? 12 : 0
                            }}
                            className="overflow-hidden flex items-center gap-4"
                          >
                            <div className="flex items-center gap-1 text-[10px] text-slate-500 font-medium bg-slate-50 dark:bg-slate-800/50 px-2 py-1 rounded">
                              <MapPin className="w-3 h-3" /> {job.location}
                            </div>
                            <div className="flex items-center gap-1 text-[10px] text-slate-500 font-medium bg-slate-50 dark:bg-slate-800/50 px-2 py-1 rounded">
                              <DollarSign className="w-3 h-3" /> {job.salary}
                            </div>
                          </motion.div>
                        </div>
                      </div>

                      {/* Hover Apply Button Overlay */}
                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: isHovered ? 1 : 0, x: isHovered ? 0 : 20 }}
                        className="absolute right-4 bottom-4"
                      >
                        <MagneticWrapper strength={10}>
                          <button className="px-4 py-1.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold rounded-lg hover:shadow-premium-hover transition-all">
                            Apply 1-Click
                          </button>
                        </MagneticWrapper>
                      </motion.div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Decorative Mesh */}
              <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-premium-purple/20 blur-[100px] rounded-full pointer-events-none" />
            </motion.div>
          </div>

          {/* Right Text */}
          <div className="flex-1 space-y-8">
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-premium-purple/10 text-premium-purple font-semibold text-sm"
            >
              <Briefcase className="w-4 h-4" /> AI Job Matching
            </motion.div>
            
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ delay: 0.1 }}
              className="text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white"
            >
              Find jobs where you actually fit.
            </motion.h2>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ delay: 0.2 }}
              className="text-lg text-slate-600 dark:text-slate-400 max-w-xl"
            >
              Stop endlessly scrolling job boards. Our AI analyzes your optimized resume and automatically curates a feed of high-probability matches.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ delay: 0.3 }}
              className="space-y-4 pt-4"
            >
              {[
                "Match percentage scored against ATS requirements",
                "1-click applications directly from the platform",
                "Real-time alerts for highly compatible roles"
              ].map((text, i) => (
                <div key={i} className="flex items-center gap-3 text-slate-700 dark:text-slate-300 font-medium">
                  <CheckCircle2 className="w-5 h-5 text-premium-purple shrink-0" />
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
