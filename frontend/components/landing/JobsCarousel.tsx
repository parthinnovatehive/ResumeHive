"use client";

import { motion } from "framer-motion";
import { Building2, MapPin, DollarSign, ExternalLink } from "lucide-react";
import { MagneticWrapper } from "../ui/MagneticWrapper";

const CATEGORIES = [
  "Software", "AI", "Machine Learning", "Cyber Security", "Data Science", "Web", "Android", "Cloud", "DevOps", "Remote", "Internships"
];

const JOBS = [
  { company: "TechNova", role: "Senior Frontend Engineer", salary: "$140k - $180k", location: "San Francisco, CA", type: "Hybrid", logoColor: "bg-blue-500" },
  { company: "AI Dynamics", role: "Machine Learning Researcher", salary: "$160k - $220k", location: "Remote", type: "Full-time", logoColor: "bg-purple-500" },
  { company: "CloudScale", role: "DevOps Architect", salary: "$150k - $190k", location: "New York, NY", type: "On-site", logoColor: "bg-emerald-500" },
  { company: "FinTech Global", role: "Full Stack Developer", salary: "$130k - $170k", location: "London, UK", type: "Hybrid", logoColor: "bg-amber-500" },
  { company: "HealthSync", role: "Data Scientist", salary: "$145k - $185k", location: "Remote", type: "Full-time", logoColor: "bg-rose-500" },
];

const CAROUSEL_JOBS = [...JOBS, ...JOBS];

export function JobsCarousel() {
  return (
    <section className="py-32 relative z-10 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 mb-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div>
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-4"
            >
              Curated Opportunities.
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="text-lg text-slate-600 dark:text-slate-400 font-medium"
            >
              Get matched with roles perfectly aligned to your new ATS-optimized resume.
            </motion.p>
          </div>
          <MagneticWrapper strength={10}>
            <button className="px-6 py-3 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors shrink-0">
              View All Jobs
            </button>
          </MagneticWrapper>
        </div>
      </div>

      {/* Categories Marquee */}
      <div className="flex overflow-hidden mb-12 mask-linear-faded">
        <div className="flex animate-marquee items-center gap-4 pl-4 whitespace-nowrap">
          {[...CATEGORIES, ...CATEGORIES].map((category, idx) => (
            <div 
              key={idx} 
              className="px-6 py-2 rounded-full glass-pill text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-600 cursor-pointer transition-colors"
            >
              {category}
            </div>
          ))}
        </div>
      </div>

      {/* Jobs Marquee */}
      <div className="flex group relative overflow-hidden -mx-4 px-4 py-8">
        <div className="flex animate-marquee group-hover:[animation-play-state:paused] items-center gap-6 pl-6">
          {CAROUSEL_JOBS.map((job, idx) => (
            <motion.div 
              key={`${job.company}-${idx}`}
              whileHover={{ y: -10 }}
              className="w-[350px] shrink-0 glass-card rounded-3xl p-6 relative group/card cursor-pointer"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/0 to-white/0 group-hover/card:from-white/40 group-hover/card:to-transparent dark:group-hover/card:from-white/5 transition-colors duration-500 rounded-3xl pointer-events-none" />
              
              <div className="flex justify-between items-start mb-6 relative z-10">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-xl ${job.logoColor} shadow-md`}>
                    {job.company.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white">{job.company}</h4>
                    <span className="text-xs font-semibold text-premium-blue bg-premium-blue/10 px-2 py-1 rounded-md">{job.type}</span>
                  </div>
                </div>
                <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-opacity -translate-x-2 group-hover/card:translate-x-0 duration-300">
                  <ExternalLink className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                </div>
              </div>
              
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mb-4 relative z-10">{job.role}</h3>
              
              <div className="space-y-3 relative z-10">
                <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400 font-medium">
                  <MapPin className="w-4 h-4" /> {job.location}
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400 font-medium">
                  <DollarSign className="w-4 h-4" /> {job.salary}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
