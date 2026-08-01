"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { Sparkles, Briefcase, CheckCircle2, MapPin, DollarSign, Building, Zap, ChevronRight } from "lucide-react";

const PREMIUM_JOBS = [
  {
    company: "Google",
    logo: "/google_logo.png",
    role: "Senior AI Engineer",
    location: "Mountain View, CA",
    salary: "$180k - $250k",
    type: "Full-time",
    workStyle: "Hybrid",
    match: 98,
    analysis: "Your background in distributed systems and 5+ years of Python expertise makes you a perfect match. 12 exact keyword matches found.",
    skills: ["Distributed Systems", "Python", "ML Infra"],
    color: "blue-500"
  },
  {
    company: "Spotify",
    logo: "https://upload.wikimedia.org/wikipedia/commons/1/19/Spotify_logo_without_text.svg",
    role: "Full Stack Engineer",
    location: "New York, NY",
    salary: "$160k - $210k",
    type: "Full-time",
    workStyle: "Hybrid",
    match: 94,
    analysis: "Your deep expertise in React internals and Node.js performance optimization perfectly aligns with this core infrastructure role.",
    skills: ["React", "Node.js", "Performance"],
    color: "emerald-500"
  },
  {
    company: "Netflix",
    logo: "/netflix_logo.png",
    role: "Senior Backend Engineer",
    location: "Los Gatos, CA",
    salary: "$200k - $280k",
    type: "Full-time",
    workStyle: "On-site",
    match: 91,
    analysis: "Strong alignment with your experience in high-throughput video streaming systems and rigorous API design principles.",
    skills: ["Golang", "API Design", "Streaming"],
    color: "red-500"
  }
];

export function JobSearchSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-20%" });
  
  const [activeIndex, setActiveIndex] = useState(0);
  const [typedText, setTypedText] = useState("");

  // Side text typing effect
  const sideFullText = "Stop endlessly scrolling job boards. Our AI analyzes your optimized resume and automatically curates a feed of high-probability matches from top tech companies.";
  const [sideTypedText, setSideTypedText] = useState("");
  const [isSideTypingComplete, setIsSideTypingComplete] = useState(false);

  // Cycle through cards
  useEffect(() => {
    if (!isInView) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % PREMIUM_JOBS.length);
    }, 5000); // 5 seconds per card
    return () => clearInterval(interval);
  }, [isInView]);

  // Typing effect for the active card
  useEffect(() => {
    if (!isInView) return;
    
    setTypedText("");
    const fullText = PREMIUM_JOBS[activeIndex].analysis;
    let i = 0;
    
    // Quick typing animation
    const interval = setInterval(() => {
      setTypedText(fullText.substring(0, i));
      i++;
      if (i > fullText.length) clearInterval(interval);
    }, 25);
    
    return () => clearInterval(interval);
  }, [activeIndex, isInView]);

  // Typing effect for the side text
  useEffect(() => {
    if (!isInView) return;
    let i = 0;
    const interval = setInterval(() => {
      setSideTypedText(sideFullText.substring(0, i));
      i++;
      if (i > sideFullText.length) {
        clearInterval(interval);
        setIsSideTypingComplete(true);
      }
    }, 15);
    return () => clearInterval(interval);
  }, [isInView]);

  return (
    <section id="jobs" className="pt-8 pb-16 relative overflow-hidden bg-slate-50 dark:bg-slate-900/30" ref={containerRef}>
      {/* Background Glowing Orbs */}
      <div className="absolute top-0 left-0 w-[800px] h-[800px] bg-blue-500/10 dark:bg-blue-500/5 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-lighten pointer-events-none -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-purple-500/10 dark:bg-purple-500/5 rounded-full blur-[100px] mix-blend-multiply dark:mix-blend-lighten pointer-events-none translate-x-1/3 translate-y-1/3"></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="flex flex-col-reverse lg:flex-row items-center gap-16">
          
          {/* Left Showcase: 3D Card Carousel */}
          <div className="flex-1 w-full max-w-2xl lg:max-w-none relative perspective-1200 h-[600px] lg:h-[550px] flex items-center justify-center">
            
            {PREMIUM_JOBS.map((job, idx) => {
              // Calculate relative position: 0 is front, 1 is middle, 2 is back
              const offset = (idx - activeIndex + PREMIUM_JOBS.length) % PREMIUM_JOBS.length;
              const isFront = offset === 0;
              
              return (
                <motion.div 
                  key={job.company}
                  initial={false}
                  animate={{
                    y: offset * 35, // Stacking offset downwards
                    scale: 1 - offset * 0.06, // Scale down the back cards
                    zIndex: 30 - offset * 10, // Ensure front card is on top
                    opacity: offset === 2 ? 0.3 : (offset === 1 ? 0.7 : 1),
                    rotateX: offset * 5, // Slight tilt for depth
                  }}
                  transition={{ duration: 0.7, type: "spring", bounce: 0.3 }}
                  className={`absolute w-full max-w-[480px] rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700/80 group transition-all duration-300`}
                  style={{ transformOrigin: 'top center' }}
                >
                  
                  {/* Outer Animated Glowing Border (Only visible on front card) */}
                  {isFront && (
                    <motion.div 
                      className="absolute -inset-[2px] rounded-3xl bg-gradient-to-r from-premium-purple via-pink-500 to-blue-500 opacity-70 blur-[8px] -z-10"
                      animate={{ 
                        opacity: [0.4, 0.8, 0.4],
                        scale: [1, 1.02, 1]
                      }}
                      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    />
                  )}

                  {/* Inner Card Content */}
                  <div className="relative w-full h-full bg-white dark:bg-slate-900 rounded-3xl p-8 overflow-hidden z-10">
                    {/* Premium Top Bar */}
                    <div className="flex items-start justify-between mb-8">
                      <div className="flex items-center gap-4">
                        {/* Logo Box */}
                        <div className="relative">
                          <div className={`absolute -inset-2 bg-${job.color}/20 blur-xl rounded-full`} />
                          <div className="w-16 h-16 rounded-2xl bg-white shadow-lg border border-slate-100 flex items-center justify-center relative z-10 overflow-hidden p-3">
                            <img src={job.logo} alt={job.company} className="w-full h-full object-contain" />
                          </div>
                        </div>
                        <div>
                          <h3 className="text-2xl font-black text-slate-900 dark:text-white leading-tight">{job.role}</h3>
                          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2">
                            <Building className="w-3.5 h-3.5" /> {job.company}
                            <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600"></span>
                            <MapPin className="w-3.5 h-3.5 ml-1" /> {job.location}
                          </p>
                        </div>
                      </div>

                      {/* Animated Match Ring */}
                      <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
                        <div className="absolute inset-0 bg-premium-purple/10 rounded-full animate-ping opacity-75" />
                        <svg className="w-full h-full transform -rotate-90 relative z-10">
                          <circle cx="32" cy="32" r="28" className="stroke-slate-100 dark:stroke-slate-800" strokeWidth="6" fill="none" />
                          <motion.circle 
                            cx="32" cy="32" r="28" 
                            className="stroke-premium-purple" 
                            strokeWidth="6" fill="none" 
                            strokeLinecap="round"
                            strokeDasharray="175.9"
                            initial={{ strokeDashoffset: 175.9 }}
                            animate={{ strokeDashoffset: isFront ? 175.9 - (175.9 * (job.match / 100)) : 175.9 }}
                            transition={{ duration: 1.2, delay: 0.2, ease: "easeOut" }}
                          />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
                          <span className="text-[15px] font-black text-slate-900 dark:text-white leading-none">{job.match}%</span>
                        </div>
                      </div>
                    </div>

                    {/* Salary & Details Tags */}
                    <div className="flex flex-wrap gap-2 mb-8">
                      <div className="px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-1 border border-emerald-100 dark:border-emerald-900/50">
                        <DollarSign className="w-3.5 h-3.5" /> {job.salary}
                      </div>
                      <div className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold flex items-center gap-1 border border-slate-200 dark:border-slate-700">
                        {job.type}
                      </div>
                      <div className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold flex items-center gap-1 border border-slate-200 dark:border-slate-700">
                        {job.workStyle}
                      </div>
                    </div>

                    {/* AI Analysis Box */}
                    <div className="bg-premium-purple/5 dark:bg-premium-purple/10 border border-premium-purple/20 rounded-xl p-5 mb-8 relative">
                      <div className="absolute -top-3 left-4 bg-premium-purple text-white text-[10px] font-black px-2 py-0.5 rounded shadow-sm flex items-center gap-1">
                        <Zap className="w-3 h-3" /> AI MATCH REASON
                      </div>
                      <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium min-h-[60px]">
                        {isFront ? typedText : job.analysis}
                        {isFront && (
                          <motion.span 
                            animate={{ opacity: [1, 0] }} 
                            transition={{ repeat: Infinity, duration: 0.8 }}
                            className="inline-block w-1.5 h-4 bg-premium-purple ml-1 align-middle"
                          />
                        )}
                      </p>
                      <div className="mt-4 flex gap-2">
                        {job.skills.map((skill, i) => (
                          <span key={i} className="px-2 py-1 bg-white dark:bg-slate-800 text-premium-purple text-[10px] font-bold rounded shadow-sm border border-premium-purple/10">✓ {skill}</span>
                        ))}
                      </div>
                    </div>

                    {/* 1-Click Apply Button */}
                    <div className="relative cursor-pointer">
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-premium-purple to-pink-500 rounded-xl blur opacity-30 group-hover:opacity-70 transition duration-500"></div>
                      <button className="relative w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-transform active:scale-95">
                        <Sparkles className="w-5 h-5 text-premium-purple dark:text-premium-purple" />
                        Apply with 1-Click
                        <ChevronRight className="w-5 h-5 opacity-50" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
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
            
            {/* Typing Effect for the side text */}
            <motion.p 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-lg text-slate-600 dark:text-slate-400 max-w-xl min-h-[84px]"
            >
              {sideTypedText}
              {!isSideTypingComplete && (
                <motion.span 
                  animate={{ opacity: [1, 0] }} 
                  transition={{ repeat: Infinity, duration: 0.8 }}
                  className="inline-block w-2 h-5 bg-premium-purple ml-1 align-middle"
                />
              )}
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
