"use client";

import { motion } from "framer-motion";

const TECH_STACK = [
  { name: "React", color: "#61DAFB" },
  { name: "Next.js", color: "#000000", darkColor: "#FFFFFF" },
  { name: "TypeScript", color: "#3178C6" },
  { name: "Python", color: "#3776AB" },
  { name: "FastAPI", color: "#009688" },
  { name: "Supabase", color: "#3ECF8E" },
  { name: "PostgreSQL", color: "#4169E1" },
  { name: "OpenAI", color: "#412991", darkColor: "#FFFFFF" },
  { name: "Ollama", color: "#000000", darkColor: "#FFFFFF" },
  { name: "Framer Motion", color: "#0055FF" },
  { name: "GitHub", color: "#181717", darkColor: "#FFFFFF" },
  { name: "Vercel", color: "#000000", darkColor: "#FFFFFF" }
];

// Duplicate for seamless infinite scrolling
const MARQUEE_ITEMS = [...TECH_STACK, ...TECH_STACK];

export function TrustedBy() {
  return (
    <section className="relative py-24 overflow-hidden border-y border-slate-200/50 dark:border-slate-800/50 bg-white/30 dark:bg-slate-900/30 backdrop-blur-md">
      <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-background z-10 pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-6 mb-12 relative z-20">
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-center text-sm font-semibold tracking-wider text-slate-500 uppercase"
        >
          Powered by World-Class Technology
        </motion.p>
      </div>

      <div className="flex group relative w-full overflow-hidden">
        <div className="flex animate-marquee group-hover:[animation-play-state:paused] items-center gap-12 sm:gap-24 pl-12 sm:pl-24">
          {MARQUEE_ITEMS.map((tech, idx) => (
            <div 
              key={`${tech.name}-${idx}`} 
              className="flex items-center gap-3 grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-300 cursor-default"
            >
              {/* Abstract Icon Representation */}
              <div 
                className="w-8 h-8 rounded-lg flex items-center justify-center opacity-80" 
                style={{ backgroundColor: `${tech.color}15` }}
              >
                <div 
                  className="w-4 h-4 rounded-sm" 
                  style={{ backgroundColor: tech.color }} 
                />
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-800 dark:text-slate-200 whitespace-nowrap">
                {tech.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
