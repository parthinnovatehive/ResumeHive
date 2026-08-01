"use client";

import { motion, AnimatePresence } from "framer-motion";
import { FileText, BarChart, Globe, Briefcase, Video, Code } from "lucide-react";
import Image from "next/image";
import { useState, useEffect } from "react";

const FEATURES = [
  { 
    title: "AI Resume Builder", 
    description: "Generate ATS-optimized resumes in seconds. Our engine instantly formats and structures your experience.", 
    icon: FileText, 
    size: "col-span-1 md:col-span-2 row-span-1 min-h-[180px]", 
    color: "from-blue-500 to-indigo-500", 
    glow: "group-hover:shadow-[0_0_30px_rgba(59,130,246,0.3)]",
    link: "#resume-builder",
    image: "/images/hero_slideshow/slide1.jpg"
  },
  { 
    title: "ATS Analyzer", 
    description: "Real-time parsing & keyword matching. Know your score before a human recruiter even sees it.", 
    icon: BarChart, 
    size: "col-span-1 md:col-span-1 row-span-1 min-h-[180px]", 
    color: "from-emerald-400 to-teal-500", 
    glow: "group-hover:shadow-[0_0_30px_rgba(16,185,129,0.3)]",
    link: "#ats-analyzer",
    image: "/images/hero_slideshow/slide2.jpg"
  },
  { 
    title: "LinkedIn Optimizer", 
    description: "Sync and upgrade your profile instantly. Turn your page into a magnet for top recruiters.", 
    icon: Globe, 
    size: "col-span-1 md:col-span-1 row-span-1 min-h-[180px]", 
    color: "from-blue-400 to-cyan-500", 
    glow: "group-hover:shadow-[0_0_30px_rgba(56,189,248,0.3)]",
    link: "#linkedin",
    image: "/images/hero_slideshow/slide3.jpg"
  },
  { 
    title: "Coding Practice", 
    description: "Ace technical rounds with AI. Master the algorithms and data structures that top tech companies ask.", 
    icon: Code, 
    size: "col-span-1 md:col-span-1 row-span-1 min-h-[180px]", 
    color: "from-slate-600 to-slate-800", 
    glow: "group-hover:shadow-[0_0_30px_rgba(100,116,139,0.3)]",
    link: "#practice",
    image: "/images/hero_slideshow/slide4.jpg"
  },
  { 
    title: "Mock Interview", 
    description: "Practice with realistic AI voice recruiters. Get real-time feedback on confidence, clarity, and tone.", 
    icon: Video, 
    size: "col-span-1 md:col-span-1 row-span-1 min-h-[180px]", 
    color: "from-rose-400 to-red-500", 
    glow: "group-hover:shadow-[0_0_30px_rgba(244,63,94,0.3)]",
    link: "#interview",
    image: "/images/hero_slideshow/slide5.jpg"
  },
  { 
    title: "Career Dashboard", 
    description: "Find matched roles and track your potential. Your entire professional trajectory managed in one place.", 
    icon: Briefcase, 
    size: "col-span-1 md:col-span-2 row-span-1 min-h-[180px]", 
    color: "from-amber-400 to-orange-500", 
    glow: "group-hover:shadow-[0_0_30px_rgba(245,158,11,0.3)]",
    link: "#jobs",
    image: "/images/hero_slideshow/slide6.jpg"
  },
];

const TYPEWRITER_WORDS = ["Everything", "You", "Need.", "Powered", "By", "Intelligence."];

export function FeaturesBento() {
  const [displayedWords, setDisplayedWords] = useState<string[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isTyping && displayedWords.length === 0) {
          setIsTyping(true);
        }
      },
      { threshold: 0.5 }
    );

    const titleElement = document.getElementById("bento-title");
    if (titleElement) observer.observe(titleElement);

    return () => observer.disconnect();
  }, [displayedWords.length, isTyping]);

  useEffect(() => {
    if (!isTyping) return;
    
    let currentIdx = 0;
    const interval = setInterval(() => {
      if (currentIdx < TYPEWRITER_WORDS.length) {
        setDisplayedWords(prev => {
          if (prev.length < TYPEWRITER_WORDS.length) {
            return [...prev, TYPEWRITER_WORDS[currentIdx]];
          }
          return prev;
        });
        currentIdx++;
      } else {
        clearInterval(interval);
      }
    }, 250); // Word by word typing speed

    return () => clearInterval(interval);
  }, [isTyping]);

  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith("#")) {
      e.preventDefault();
      const targetId = href.substring(1);
      const element = document.getElementById(targetId);
      if (element) {
        window.scrollTo({
          top: element.offsetTop - 100,
          behavior: "smooth"
        });
      }
    }
  };

  return (
    <section id="features" className="pt-12 pb-16 px-6 relative z-10 max-w-7xl mx-auto">
      <div className="text-center mb-12 h-[100px] flex flex-col items-center justify-center" id="bento-title">
        <motion.h2 
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-tight"
        >
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-[length:200%_auto] animate-shimmer drop-shadow-sm">
            {displayedWords.join(" ")}
          </span>
          {isTyping && (
            <span className="inline-block w-[3px] h-[0.9em] bg-blue-500 ml-2 animate-pulse align-middle rounded-full" />
          )}
        </motion.h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 auto-rows-fr">
        {FEATURES.map((feature, idx) => (
          <motion.a
            href={feature.link}
            onClick={(e) => handleSmoothScroll(e, feature.link)}
            key={feature.title}
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
            className={`group relative overflow-hidden rounded-[1.2rem] p-4 lg:p-5 flex flex-col justify-between ${feature.size} cursor-pointer shadow-sm bg-white dark:bg-slate-900/80 backdrop-blur-md border border-slate-200 dark:border-white/10 transition-all duration-300 hover:-translate-y-1 block ${feature.glow}`}
          >
            {/* Soft Glowing Aura inside the card on hover */}
            <div className={`absolute -right-20 -top-20 w-64 h-64 bg-gradient-to-br ${feature.color} rounded-full blur-[80px] opacity-0 group-hover:opacity-20 dark:group-hover:opacity-30 transition-opacity duration-700 pointer-events-none`} />

            {/* Top Text Content */}
            <div className="relative z-10 flex flex-col mb-3">
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br ${feature.color} shadow-md group-hover:scale-110 transition-transform duration-500 shrink-0`}>
                  <feature.icon className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-lg md:text-xl font-black text-slate-900 dark:text-white tracking-tight font-sans group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-slate-900 group-hover:to-slate-500 dark:group-hover:from-white dark:group-hover:to-slate-400 transition-all leading-tight line-clamp-1">
                  {feature.title}
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed line-clamp-2">
                {feature.description}
              </p>
            </div>

            {/* Image Container - Panoramic Crop */}
            <div className="relative w-full rounded-lg overflow-hidden border border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-black/30 group-hover:shadow-[0_10px_20px_rgba(0,0,0,0.1)] dark:group-hover:shadow-[0_10px_20px_rgba(0,0,0,0.3)] transition-all duration-500 mt-auto shrink-0">
              <div className="relative w-full h-[60px] sm:h-[80px]">
                <Image
                  src={feature.image}
                  alt={feature.title}
                  fill
                  className="object-cover object-center opacity-80 group-hover:opacity-100 group-hover:scale-[1.05] transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] filter saturate-50 group-hover:saturate-100"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent mix-blend-overlay" />
              </div>
            </div>
          </motion.a>
        ))}
      </div>
    </section>
  );
}
