"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, CheckCircle2, LayoutTemplate, X, Check } from "lucide-react";
import type { TemplateName } from "@/types/resume";
import { TEMPLATE_CONFIG } from "@/types/resume";
import type { ResumeFormData } from "@/lib/validations/resume.schema";
import { TemplateRenderer } from "./templates/TemplateRenderer";

const MOCK_DATA: ResumeFormData = {
  full_name: "John Anderson",
  email: "john.anderson@example.com",
  phone: "+1 (555) 123-4567",
  location: "San Francisco, CA",
  linkedin_url: "linkedin.com/in/johndoe",
  summary: "Senior Software Engineer with 8+ years of experience building scalable distributed systems and leading high-performance teams at top tech companies. Passionate about machine learning and cloud architecture.",
  education: [
    { institution: "Stanford University", degree: "M.S.", field_of_study: "Computer Science", start_date: "Sep 2016", end_date: "May 2018", gpa: "3.9" }
  ],
  experience: [
    { company: "Google", title: "Senior Software Engineer", start_date: "Jun 2018", end_date: "Present", is_current: true, description: "Led development of core ML infrastructure scaling to millions of requests per second. Mentored junior engineers." },
    { company: "Microsoft", title: "Software Engineer Intern", start_date: "Jun 2017", end_date: "Sep 2017", is_current: false, description: "Developed internal dashboard tools." }
  ],
  projects: [
    { name: "Distributed Cache", technologies: "Go, Redis", link: "github.com", description: "Built an open-source distributed caching system." }
  ],
  skills: ["Python", "Go", "React", "AWS", "Kubernetes", "Machine Learning", "System Design"],
  certifications: ["AWS Certified Solutions Architect"],
  section_order: ["summary", "experience", "education", "skills", "projects", "certifications"]
};

interface PremiumTemplateGalleryProps {
  onClose: () => void;
  onApply: (baseTemplate: TemplateName) => void;
  currentTemplate: TemplateName;
}

const TEMPLATES: { id: TemplateName; name: string; atsScore: number; bestFor: string; description: string; badge?: string }[] = [
  { id: "classic", name: "Harvard Standard", atsScore: 99, bestFor: "Finance & Academia", description: "Traditional serif layout optimized for readability and prestige.", badge: "Top ATS Pick" },
  { id: "modern", name: "Tech Lead", atsScore: 98, bestFor: "Software Engineers", description: "Sleek sans-serif with subtle accents, perfect for tech roles.", badge: "Most Popular" },
  { id: "professional", name: "Executive Elite", atsScore: 99, bestFor: "C-Level & Management", description: "Elegant fonts and strong structural dividers for seasoned leaders." },
  { id: "minimal", name: "Creative Minimalist", atsScore: 100, bestFor: "Designers & UX", description: "Whitespace-optimized, extreme clarity with zero fluff." },
  { id: "compact", name: "High-Density Compact", atsScore: 97, bestFor: "Senior Professionals", description: "Engineered to fit extensive career history onto a single page." },
  { id: "silicon", name: "Silicon Valley", atsScore: 98, bestFor: "Founders & Startups", description: "Bold, modern tech-focused layout with highly scannable sections.", badge: "New" },
];

export function PremiumTemplateGallery({ onClose, onApply, currentTemplate }: PremiumTemplateGalleryProps) {
  const [hoveredId, setHoveredId] = useState<TemplateName | null>(null);

  const handleApply = (t: TemplateName) => {
    onApply(t);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 md:p-8 overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white w-full max-w-6xl rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
      >
        {/* HEADER */}
        <div className="shrink-0 px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-indigo-500" /> Premium Templates
            </h2>
            <p className="text-slate-500 text-sm mt-1">Select from our 6 highly-curated, 100% ATS-friendly formats proven to land interviews.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            <X className="w-6 h-6 text-slate-400" />
          </button>
        </div>

        {/* GALLERY GRID */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-slate-50">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {TEMPLATES.map((t) => {
              const isActive = currentTemplate === t.id;
              const isHovered = hoveredId === t.id;
              
              return (
                <motion.div
                  key={t.id}
                  layoutId={`template-card-${t.id}`}
                  onHoverStart={() => setHoveredId(t.id)}
                  onHoverEnd={() => setHoveredId(null)}
                  onClick={() => handleApply(t.id)}
                  whileHover={{ y: -5 }}
                  className={`relative group cursor-pointer rounded-2xl bg-white border-2 transition-all duration-300 flex flex-col overflow-hidden ${
                    isActive ? 'border-indigo-600 shadow-xl ring-4 ring-indigo-600/10' : 'border-slate-200 shadow-sm hover:shadow-xl hover:border-indigo-300'
                  }`}
                >
                  {/* Badge */}
                  {t.badge && (
                    <div className="absolute top-4 left-4 z-10 px-3 py-1 bg-indigo-600 text-white text-[10px] font-bold uppercase tracking-wider rounded-full shadow-md">
                      {t.badge}
                    </div>
                  )}

                  {/* Actual Template Live Thumbnail */}
                  <div className="relative aspect-[1/1.414] w-full bg-slate-200 overflow-hidden border-b border-slate-100 flex items-start justify-center p-2">
                    <div className={`w-full h-full transition-transform duration-500 origin-top shadow-md ${isHovered ? 'scale-[1.03]' : 'scale-100'}`}>
                      <svg viewBox="0 0 794 1123" preserveAspectRatio="xMidYMin meet" className="w-full h-full pointer-events-none bg-white">
                        <foreignObject width="794" height="1123">
                          {/* Apply standard A4 margins (approx 48px/0.5in) to the preview wrapper */}
                          <div className="w-[794px] h-[1123px] bg-white text-left p-[48px]">
                            <TemplateRenderer template={t.id} data={MOCK_DATA} />
                          </div>
                        </foreignObject>
                      </svg>
                    </div>
                    
                    {/* Hover Overlay */}
                    <AnimatePresence>
                      {isHovered && !isActive && (
                        <motion.div 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="absolute inset-0 bg-indigo-900/10 backdrop-blur-[2px] flex items-center justify-center"
                        >
                          <div className="bg-white text-indigo-600 font-bold px-6 py-2.5 rounded-full shadow-lg flex items-center gap-2 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                            <CheckCircle2 className="w-5 h-5" /> Use Template
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {isActive && (
                      <div className="absolute inset-0 bg-indigo-600/10 backdrop-blur-[1px] flex items-center justify-center">
                        <div className="bg-indigo-600 text-white font-bold px-6 py-2.5 rounded-full shadow-lg flex items-center gap-2">
                          <Check className="w-5 h-5" /> Active
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Template Meta */}
                  <div className="p-5 flex flex-col grow">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-slate-900 text-lg">{t.name}</h3>
                      <div className="flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded text-xs font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5" /> ATS {t.atsScore}
                      </div>
                    </div>
                    <div className="text-xs font-semibold text-indigo-600 mb-3">{t.bestFor}</div>
                    <p className="text-sm text-slate-500 leading-relaxed">{t.description}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

      </motion.div>
    </div>
  );
}
