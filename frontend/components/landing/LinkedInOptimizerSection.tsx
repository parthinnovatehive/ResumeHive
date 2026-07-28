"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { Globe, CheckCircle2, ChevronRight, ChevronLeft } from "lucide-react";

export function LinkedInOptimizerSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-20%" });
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);

  const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging || !containerRef.current) return;
    
    // Type casting to handle both MouseEvent and TouchEvent correctly
    let clientX = 0;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
    } else {
      clientX = (e as React.MouseEvent).clientX;
    }

    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    setSliderPosition((x / rect.width) * 100);
  };

  return (
    <section id="linkedin" className="py-32 relative overflow-hidden" ref={containerRef}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          
          {/* Left Text */}
          <div className="flex-1 space-y-8">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0077b5]/10 text-[#0077b5] font-semibold text-sm"
            >
              <Globe className="w-4 h-4" /> LinkedIn Optimizer
            </motion.div>
            
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ delay: 0.1 }}
              className="text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white"
            >
              Turn your profile into a recruiter magnet.
            </motion.h2>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ delay: 0.2 }}
              className="text-lg text-slate-600 dark:text-slate-400 max-w-xl"
            >
              Transform generic headlines and empty summaries into highly-searchable, compelling copy that makes recruiters reach out to you first.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ delay: 0.3 }}
              className="space-y-4 pt-4"
            >
              {[
                "AI-crafted headlines optimized for search ranking",
                "Compelling 'About' sections that tell your story",
                "One-click sync with your optimized resume data"
              ].map((text, i) => (
                <div key={i} className="flex items-center gap-3 text-slate-700 dark:text-slate-300 font-medium">
                  <CheckCircle2 className="w-5 h-5 text-[#0077b5] shrink-0" />
                  {text}
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right Showcase: Before/After Slider */}
          <div className="flex-1 w-full max-w-2xl lg:max-w-none relative perspective-1000">
            <motion.div 
              initial={{ opacity: 0, rotateY: 20, scale: 0.9 }}
              whileInView={{ opacity: 1, rotateY: 0, scale: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1, type: "spring", bounce: 0.2 }}
              className="relative w-full aspect-[4/3] rounded-2xl glass-card overflow-hidden shadow-2xl border border-white/50 dark:border-slate-700/50 cursor-ew-resize select-none"
              onMouseDown={() => setIsDragging(true)}
              onMouseUp={() => setIsDragging(false)}
              onMouseLeave={() => setIsDragging(false)}
              onMouseMove={handleMouseMove}
              onTouchStart={() => setIsDragging(true)}
              onTouchEnd={() => setIsDragging(false)}
              onTouchMove={handleMouseMove}
            >
              {/* After State (Underneath) */}
              <div className="absolute inset-0 bg-white dark:bg-slate-900 p-8 flex flex-col pt-12">
                <div className="absolute top-4 right-4 bg-premium-emerald/10 text-premium-emerald text-[10px] font-bold px-2 py-1 rounded-md">Optimized by AI</div>
                
                <div className="flex gap-4">
                  <div className="w-16 h-16 rounded-full bg-slate-200 dark:bg-slate-800 relative overflow-hidden shrink-0 border-2 border-white dark:border-slate-900 shadow-md">
                    <div className="absolute inset-0 bg-gradient-to-tr from-premium-blue to-purple-500 opacity-20" />
                  </div>
                  <div className="pt-2">
                    <div className="h-5 w-40 bg-slate-800 dark:bg-slate-200 rounded mb-2" />
                    {/* Optimized Headline */}
                    <div className="text-sm font-medium text-slate-900 dark:text-white leading-relaxed line-clamp-2">
                      Senior Frontend Engineer | React & Next.js Expert | Building highly scalable SaaS architectures | Ex-Google
                    </div>
                    <div className="text-xs text-slate-500 mt-2">San Francisco, CA • 500+ connections</div>
                  </div>
                </div>

                <div className="mt-8">
                  <div className="h-4 w-20 bg-slate-200 dark:bg-slate-700 rounded mb-4" />
                  <div className="space-y-2">
                    <div className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                      Passionate software engineer with 8+ years of experience architecting high-performance web applications. I specialize in the React ecosystem (Next.js, TypeScript) and have a proven track record of reducing load times by 40% and leading cross-functional teams of 10+ developers.
                    </div>
                  </div>
                </div>
              </div>

              {/* Before State (Clipped on top) */}
              <div 
                className="absolute inset-y-0 left-0 bg-slate-50 dark:bg-slate-950 p-8 flex flex-col pt-12 border-r-2 border-white/50 overflow-hidden shadow-[20px_0_50px_rgba(0,0,0,0.1)]"
                style={{ width: `${sliderPosition}%` }}
              >
                <div className="absolute top-4 right-4 bg-slate-200 dark:bg-slate-800 text-slate-500 text-[10px] font-bold px-2 py-1 rounded-md whitespace-nowrap">Original Profile</div>
                
                <div className="flex gap-4 w-[600px]">
                  <div className="w-16 h-16 rounded-full bg-slate-200 dark:bg-slate-800 relative overflow-hidden shrink-0" />
                  <div className="pt-2">
                    <div className="h-5 w-40 bg-slate-800 dark:bg-slate-200 rounded mb-2" />
                    {/* Boring Headline */}
                    <div className="text-sm text-slate-500">
                      Software Developer
                    </div>
                    <div className="text-xs text-slate-500 mt-2">San Francisco, CA</div>
                  </div>
                </div>

                <div className="mt-8 w-[600px]">
                  <div className="h-4 w-20 bg-slate-200 dark:bg-slate-700 rounded mb-4" />
                  <div className="space-y-2">
                    <div className="text-xs text-slate-500 leading-relaxed">
                      I am a programmer looking for new opportunities. I know React and Javascript and can make websites.
                    </div>
                  </div>
                </div>
              </div>

              {/* Slider Handle */}
              <div 
                className="absolute inset-y-0 w-1 bg-white shadow-[0_0_10px_rgba(0,0,0,0.3)] z-10 flex items-center justify-center -ml-0.5"
                style={{ left: `${sliderPosition}%` }}
              >
                <div className="w-8 h-8 rounded-full bg-white shadow-xl flex items-center justify-center gap-0.5 text-slate-400 absolute">
                  <ChevronLeft className="w-4 h-4" />
                  <ChevronRight className="w-4 h-4 -ml-2" />
                </div>
              </div>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}
