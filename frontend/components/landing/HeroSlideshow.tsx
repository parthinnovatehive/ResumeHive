"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import Image from "next/image";

const SLIDES = [
  { id: 1, src: "/images/hero_slideshow/slide1.jpg", alt: "Resume Builder Visualization" },
  { id: 2, src: "/images/hero_slideshow/slide2.jpg", alt: "ATS Analyzer Visualization" },
  { id: 3, src: "/images/hero_slideshow/slide3.jpg", alt: "LinkedIn Optimizer Visualization" },
  { id: 4, src: "/images/hero_slideshow/slide4.jpg", alt: "Coding Practice Visualization" },
  { id: 5, src: "/images/hero_slideshow/slide5.jpg", alt: "Mock Interview Visualization" },
  { id: 6, src: "/images/hero_slideshow/slide6.jpg", alt: "Career Dashboard Visualization" },
];

export function HeroSlideshow() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    // Preload images to prevent flicker
    SLIDES.forEach((slide) => {
      const img = new window.Image();
      img.src = slide.src;
    });

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % SLIDES.length);
    }, 7000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full max-w-[550px] lg:max-w-[650px] aspect-square flex items-center justify-center">
      
      {/* Animated Multi-Color Glow Effect */}
      <div className="absolute inset-[-15px] sm:inset-[-30px] z-0 rounded-[4rem] bg-gradient-to-r from-pink-500 via-red-400 to-blue-500 blur-3xl opacity-60 animate-[pulse_4s_cubic-bezier(0.4,0,0.6,1)_infinite] mix-blend-screen" />
      <div className="absolute inset-[-10px] sm:inset-[-20px] z-0 rounded-[3rem] bg-gradient-to-tr from-blue-500 via-white to-pink-500 blur-2xl opacity-70 animate-[pulse_3s_ease-in-out_infinite_reverse] mix-blend-screen" />
      <div className="absolute inset-0 z-0 rounded-[2rem] bg-white blur-xl opacity-30 mix-blend-overlay" />

      <div className="relative z-10 w-full h-full rounded-[2rem] overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.8)] border border-white/20 bg-black/60 p-4 lg:p-6 backdrop-blur-xl">
        {/* Inner Image Container with rounded corners */}
        <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-inner bg-black/80">
          <AnimatePresence mode="sync">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1, ease: "easeInOut" }}
              className="absolute inset-0 w-full h-full"
            >
              <Image
                src={SLIDES[currentIndex].src}
                alt={SLIDES[currentIndex].alt}
                fill
                priority
                className="object-contain"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </motion.div>
          </AnimatePresence>
        </div>
        
        {/* Subtle indicator dots */}
        <div className="absolute bottom-8 lg:bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-2.5 z-20">
          {SLIDES.map((_, i) => (
            <div 
              key={i} 
              className={`h-1.5 rounded-full transition-all duration-1000 ${i === currentIndex ? 'w-6 bg-white shadow-[0_0_15px_rgba(255,255,255,1)]' : 'w-2 bg-white/40'}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
