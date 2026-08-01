"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { Globe, CheckCircle2, ChevronRight, ChevronLeft } from "lucide-react";

export function LinkedInOptimizerSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-20%" });
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);

  const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging || !sliderRef.current) return;
    
    // Type casting to handle both MouseEvent and TouchEvent correctly
    let clientX = 0;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
    } else {
      clientX = (e as React.MouseEvent).clientX;
    }

    const rect = sliderRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    setSliderPosition((x / rect.width) * 100);
  };

  return (
    <section id="linkedin" className="pt-8 pb-16 relative overflow-hidden" ref={containerRef}>
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
          <div className="flex-1 w-full max-w-2xl lg:max-w-none relative perspective-1200 group">
            {/* Glowing Aura Effect */}
            <div className="absolute inset-0 bg-gradient-to-tr from-[#0077b5]/20 via-cyan-500/20 to-blue-600/20 blur-3xl rounded-full opacity-50 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

            <motion.div 
              ref={sliderRef}
              initial={{ opacity: 0, rotateY: 15, scale: 0.95 }}
              whileInView={{ opacity: 1, rotateY: 0, scale: 1 }}
              whileHover={{ rotateY: -5, rotateX: 5, scale: 1.02 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, type: "spring", bounce: 0.3 }}
              className="relative w-full aspect-[4/3] rounded-2xl glass-card overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.3)] group-hover:shadow-[0_30px_60px_rgba(0,119,181,0.25)] border border-white/50 dark:border-slate-700/50 cursor-ew-resize select-none transition-shadow duration-500"
              onMouseDown={() => setIsDragging(true)}
              onMouseUp={() => setIsDragging(false)}
              onMouseLeave={() => setIsDragging(false)}
              onMouseMove={handleMouseMove}
              onTouchStart={() => setIsDragging(true)}
              onTouchEnd={() => setIsDragging(false)}
              onTouchMove={handleMouseMove}
            >
              {/* After State (Underneath) */}
              <div className="absolute inset-0 bg-white dark:bg-slate-900 p-8 flex flex-col pt-12 font-sans overflow-hidden">
                <div className="absolute top-4 right-4 bg-[#0077b5]/10 text-[#0077b5] text-[10px] font-bold px-3 py-1.5 rounded-full z-20 shadow-sm border border-[#0077b5]/20 backdrop-blur-md">✨ AI Optimized</div>
                
                {/* Cover Photo */}
                <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-r from-blue-900 via-[#0077b5] to-cyan-500 opacity-90">
                   <div className="absolute inset-0 opacity-20 mix-blend-overlay" style={{ backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', backgroundSize: '10px 10px' }}></div>
                </div>
                
                <div className="flex gap-4 relative z-10 mt-2">
                  <div className="w-20 h-20 rounded-full overflow-hidden shrink-0 border-4 border-white dark:border-slate-900 shadow-xl relative">
                     <img src="https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=200&auto=format&fit=crop" alt="Client Photo" className="w-full h-full object-cover" draggable={false} />
                  </div>
                  <div className="pt-2">
                    <div className="flex items-center gap-2">
                       <div className="text-xl font-black text-slate-900 dark:text-white leading-none">Jonathan Doe</div>
                       <CheckCircle2 className="w-3.5 h-3.5 text-[#0077b5]" />
                    </div>
                    {/* Optimized Headline */}
                    <div className="text-[11px] font-bold text-slate-700 dark:text-slate-300 leading-snug mt-1.5 max-w-md">
                      <span className="text-[#0077b5]">Senior Backend Engineer</span> | Scalable Cloud Architectures | Go & Node.js Expert | 2x Startup Exits
                    </div>
                    <div className="text-[9px] text-slate-500 dark:text-slate-400 mt-1 font-medium flex items-center gap-2">
                      San Francisco, CA • <span className="text-[#0077b5] font-bold">500+ connections</span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 relative z-10 space-y-4">
                  {/* About Section */}
                  <div>
                    <h2 className="text-[11px] font-black text-slate-800 dark:text-slate-200 tracking-wide mb-1.5">About</h2>
                    <div className="text-[10px] text-slate-700 dark:text-slate-300 leading-relaxed font-medium bg-slate-50 dark:bg-slate-800/80 p-3 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm relative">
                      <div className="absolute -left-1 top-3 w-1 h-6 bg-[#0077b5] rounded-r-md"></div>
                      I architect highly scalable, resilient cloud infrastructure that empowers millions of active users. Passionate about building distributed systems in <span className="font-bold text-[#0077b5]">Go</span> and <span className="font-bold text-[#0077b5]">Node.js</span>. Led microservices migration reducing costs by 40%.
                    </div>
                  </div>

                  {/* Top Skills */}
                  <div>
                    <h2 className="text-[11px] font-black text-slate-800 dark:text-slate-200 tracking-wide mb-1.5">Top Skills</h2>
                    <div className="flex flex-wrap gap-2">
                      {['System Architecture', 'Golang', 'Node.js', 'AWS', 'Kubernetes'].map((skill, i) => (
                        <span key={i} className="px-2 py-1 text-[9px] font-bold text-[#0077b5] bg-[#0077b5]/10 rounded border border-[#0077b5]/20">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Experience */}
                  <div>
                    <h2 className="text-[11px] font-black text-slate-800 dark:text-slate-200 tracking-wide mb-1.5">Experience</h2>
                    <div className="flex gap-3 items-start">
                      <div className="w-8 h-8 rounded bg-slate-800 shrink-0 flex items-center justify-center text-white font-bold text-[10px]">TC</div>
                      <div>
                        <div className="text-[11px] font-bold text-slate-900 dark:text-white leading-tight">Lead Backend Engineer</div>
                        <div className="text-[9px] font-medium text-slate-600 dark:text-slate-400 mt-0.5">TechCorp • Full-time</div>
                        <div className="text-[9px] text-slate-500 mt-0.5">Jan 2021 - Present • 3 yrs 7 mos</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Before State (Clipped on top) */}
              <div 
                className="absolute inset-y-0 left-0 bg-slate-100 dark:bg-slate-950 p-8 flex flex-col pt-12 border-r-2 border-white/80 dark:border-slate-700/80 overflow-hidden shadow-[20px_0_50px_rgba(0,0,0,0.15)] font-sans z-30"
                style={{ width: `${sliderPosition}%` }}
              >
                <div className="absolute top-4 right-4 bg-slate-200 dark:bg-slate-800 text-slate-500 text-[10px] font-bold px-3 py-1.5 rounded-full whitespace-nowrap z-20">Original Profile</div>
                
                {/* Cover Photo - Empty */}
                <div className="absolute top-0 left-0 right-0 h-28 bg-slate-200 dark:bg-slate-800 flex items-center justify-center">
                   <div className="text-slate-400 dark:text-slate-600 text-[10px] font-bold tracking-widest uppercase opacity-50">No Cover Photo</div>
                </div>
                
                <div className="flex gap-4 w-[600px] relative z-10 mt-4">
                  <div className="w-24 h-24 rounded-full overflow-hidden shrink-0 border-4 border-slate-100 dark:border-slate-950 bg-slate-300">
                     <img src="https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=200&auto=format&fit=crop" alt="Client Photo" className="w-full h-full object-cover" draggable={false} />
                  </div>
                  <div className="pt-5">
                    <div className="text-2xl font-bold text-slate-800 dark:text-slate-200 leading-none">Jonathan Doe</div>
                    {/* Boring Headline */}
                    <div className="text-[13px] text-slate-500 dark:text-slate-400 mt-1.5">
                      Looking for job...
                    </div>
                  </div>
                </div>

                <div className="mt-8 w-[600px] relative z-10">
                  <div className="text-[12px] text-slate-400 dark:text-slate-600 leading-relaxed bg-slate-50 dark:bg-slate-900/50 p-4 rounded border border-dashed border-slate-300 dark:border-slate-800 italic text-center py-8">
                    (No About Section provided. Profile is 40% complete.)
                  </div>
                </div>
              </div>

              {/* Slider Handle */}
              <div 
                className="absolute inset-y-0 w-1.5 bg-white shadow-[0_0_15px_rgba(0,0,0,0.5)] z-40 flex items-center justify-center -ml-[3px]"
                style={{ left: `${sliderPosition}%` }}
              >
                <div className="w-12 h-12 rounded-full bg-white shadow-2xl flex items-center justify-center gap-0 text-[#0077b5] absolute border-2 border-slate-100 transition-transform group-hover:scale-110 group-active:scale-95">
                  <ChevronLeft className="w-6 h-6" />
                  <ChevronRight className="w-6 h-6 -ml-2" />
                </div>
              </div>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}
