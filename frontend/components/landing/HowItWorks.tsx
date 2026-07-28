"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { Upload, Cpu, Zap, Briefcase, GraduationCap } from "lucide-react";

const STEPS = [
  { title: "Upload or Start Fresh", description: "Import your LinkedIn profile, existing resume, or start from scratch.", icon: Upload },
  { title: "AI Analysis", description: "Our engine scans your content against millions of successful resumes and ATS algorithms.", icon: Cpu },
  { title: "Instant Optimization", description: "Get one-click rewrites, keyword suggestions, and formatting fixes.", icon: Zap },
  { title: "Targeted Applications", description: "Match your new resume with top job openings in your industry.", icon: Briefcase },
  { title: "Ace the Interview", description: "Use our mock interview AI to practice answering questions with confidence.", icon: GraduationCap }
];

export function HowItWorks() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end center"]
  });

  const pathLength = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <section className="py-32 relative z-10" ref={containerRef}>
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-24">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-4"
          >
            How it works
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="text-lg text-slate-600 dark:text-slate-400 font-medium"
          >
            A seamless journey from empty page to signed offer.
          </motion.p>
        </div>

        <div className="relative">
          {/* SVG Animated Path */}
          <div className="absolute left-[39px] top-0 bottom-0 w-0.5 md:left-1/2 md:-ml-[1px]">
            <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none">
              <line 
                x1="0" y1="0" x2="0" y2="100%" 
                className="stroke-slate-200 dark:stroke-slate-800" 
                strokeWidth="2" 
              />
              <motion.line 
                x1="0" y1="0" x2="0" y2="100%" 
                className="stroke-premium-blue" 
                strokeWidth="4"
                style={{ pathLength }}
              />
            </svg>
          </div>

          <div className="space-y-24">
            {STEPS.map((step, idx) => {
              const isEven = idx % 2 === 0;
              return (
                <div key={step.title} className={`relative flex items-center ${isEven ? 'md:flex-row-reverse' : 'md:flex-row'} gap-8 md:gap-16`}>
                  
                  {/* Icon Node */}
                  <div className="absolute left-0 md:left-1/2 -translate-x-1/2 flex items-center justify-center w-20 h-20 bg-background z-10">
                    <motion.div 
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      viewport={{ once: true, margin: "-100px" }}
                      transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.2 }}
                      className="w-16 h-16 rounded-full glass-card flex items-center justify-center shadow-premium relative overflow-hidden group"
                    >
                      <div className="absolute inset-0 bg-premium-blue/10 scale-0 group-hover:scale-100 transition-transform duration-300 rounded-full" />
                      <step.icon className="w-6 h-6 text-slate-700 dark:text-slate-200 relative z-10" />
                    </motion.div>
                  </div>

                  {/* Empty space for alternating layout */}
                  <div className="hidden md:block flex-1" />

                  {/* Content Card */}
                  <motion.div 
                    initial={{ opacity: 0, x: isEven ? -20 : 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    className="flex-1 pl-28 md:pl-0"
                  >
                    <div className="glass-card rounded-3xl p-8 hover:-translate-y-1 transition-transform duration-300 relative overflow-hidden group">
                      <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-premium-blue to-premium-purple opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <div className="text-sm font-bold text-premium-blue tracking-widest uppercase mb-2">Step {idx + 1}</div>
                      <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3 tracking-tight">{step.title}</h3>
                      <p className="text-slate-600 dark:text-slate-400 font-medium leading-relaxed">{step.description}</p>
                    </div>
                  </motion.div>

                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
