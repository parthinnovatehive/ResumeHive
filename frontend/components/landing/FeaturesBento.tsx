"use client";

import { motion } from "framer-motion";
import { FileText, BarChart, Zap, Search, Globe, Edit, Briefcase, Video, Code, Layout } from "lucide-react";
import { MagneticWrapper } from "../ui/MagneticWrapper";

const FEATURES = [
  { title: "AI Resume Builder", description: "Generate ATS-optimized resumes in seconds.", icon: FileText, size: "col-span-1 md:col-span-2 row-span-2", color: "from-premium-blue to-premium-indigo", link: "#resume-builder" },
  { title: "ATS Score", description: "Real-time parsing and keyword match.", icon: BarChart, size: "col-span-1 md:col-span-1 row-span-1", color: "from-premium-emerald to-teal-500", link: "#ats-analyzer" },
  { title: "AI Rewrite", description: "Enhance bullet points instantly.", icon: Edit, size: "col-span-1 md:col-span-1 row-span-1", color: "from-premium-purple to-pink-500", link: "#resume-builder" },
  { title: "LinkedIn Optimizer", description: "Sync and upgrade your profile.", icon: Globe, size: "col-span-1 md:col-span-1 row-span-2", color: "from-blue-500 to-cyan-500", link: "#linkedin" },
  { title: "Job Search", description: "Find the best matched roles.", icon: Briefcase, size: "col-span-1 md:col-span-2 row-span-1", color: "from-premium-amber to-orange-500", link: "#jobs" },
  { title: "Mock Interview", description: "Practice with AI recruiters.", icon: Video, size: "col-span-1 md:col-span-1 row-span-1", color: "from-premium-rose to-red-500", link: "#interview" },
  { title: "Coding Practice", description: "Ace technical rounds.", icon: Code, size: "col-span-1 md:col-span-1 row-span-1", color: "from-slate-700 to-slate-900", link: "#practice" },
  { title: "Portfolio Builder", description: "Showcase your best projects.", icon: Layout, size: "col-span-1 md:col-span-2 row-span-1", color: "from-indigo-400 to-purple-400", link: "#features" },
];

export function FeaturesBento() {
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
    <section id="features" className="py-32 px-6 relative z-10 max-w-7xl mx-auto">
      <div className="text-center mb-20">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-4"
        >
          Everything you need.<br/>
          <span className="text-gradient">Powered by Intelligence.</span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto font-medium"
        >
          An integrated suite of career tools designed to get you hired faster. From resume building to technical interviews.
        </motion.p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 auto-rows-[180px]">
        {FEATURES.map((feature, idx) => (
          <motion.a
            href={feature.link}
            onClick={(e) => handleSmoothScroll(e, feature.link)}
            key={feature.title}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: idx * 0.05, ease: [0.16, 1, 0.3, 1] }}
            whileHover={{ scale: 1.02, y: -5, zIndex: 10 }}
            className={`group relative overflow-hidden rounded-3xl glass-card p-6 flex flex-col justify-between ${feature.size} cursor-pointer shadow-sm hover:shadow-2xl transition-all duration-300 block`}
          >
            {/* Hover Gradient Glow background */}
            <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-[0.03] dark:group-hover:opacity-[0.1] transition-opacity duration-500`} />
            
            {/* Animated Gradient Border using pseudo element approach */}
            <div className="absolute inset-0 rounded-3xl border-2 border-transparent group-hover:border-white/20 transition-colors duration-500 pointer-events-none" />

            <div className="relative z-10 flex justify-between items-start">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br ${feature.color} shadow-premium-hover`}>
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center -translate-x-2 group-hover:translate-x-0">
                <span className="text-slate-500 dark:text-slate-400">→</span>
              </div>
            </div>
            
            <div className="relative z-10 mt-4">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-slate-900 group-hover:to-slate-600 dark:group-hover:from-white dark:group-hover:to-slate-300 transition-all">
                {feature.title}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                {feature.description}
              </p>
            </div>
          </motion.a>
        ))}
      </div>
    </section>
  );
}
