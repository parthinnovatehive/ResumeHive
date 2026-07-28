"use client";

import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Heart, Star, Sparkles, Filter, X, LayoutTemplate, CheckCircle2, Maximize2, Zap, LayoutGrid, Check, GitCompare, Clock, ChevronDown } from "lucide-react";
import type { TemplateName } from "@/types/resume";
import type { ResumeFormData } from "@/lib/validations/resume.schema";
import { TemplateRenderer } from "./templates";

/* ── MOCK DATA FOR REALISTIC WYSIWYG PREVIEWS ───────────────────── */

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

/* ── 25+ PREMIUM TEMPLATES REGISTRY ────────────────────────────── */

type TemplateCategory = "All" | "Featured" | "Executive" | "Modern" | "Minimal" | "Developers" | "AI & ML" | "Designers" | "Recently Used" | "Favorites";
type SortOption = "Recommended" | "Most Popular" | "Newest" | "Highest ATS" | "Most Downloaded";

interface PremiumTemplate {
  id: string;
  name: string;
  baseTemplate: TemplateName; 
  category: TemplateCategory;
  isFeatured?: boolean;
  isNew?: boolean;
  isPopular?: boolean;
  atsScore: number;
  downloads: number;
  bestFor: string;
  description: string;
}

const TEMPLATES: PremiumTemplate[] = [
  { id: "exec-elite", name: "Executive Elite", baseTemplate: "professional", category: "Executive", isFeatured: true, isPopular: true, atsScore: 98, downloads: 14500, bestFor: "C-Level, VP, Directors", description: "A prestigious, traditional serif layout perfect for seasoned leaders." },
  { id: "swe-pro", name: "Software Engineer Pro", baseTemplate: "classic", category: "Developers", isFeatured: true, atsScore: 99, downloads: 24000, bestFor: "Backend, Frontend, Fullstack", description: "Optimized for technical keywords and dense project information." },
  { id: "ai-ml", name: "AI & Machine Learning", baseTemplate: "modern", category: "AI & ML", isFeatured: true, isNew: true, atsScore: 97, downloads: 8400, bestFor: "Data Scientists, ML Engineers", description: "Highlights algorithms, research, and technical proficiencies." },
  { id: "min-ats", name: "Minimal ATS", baseTemplate: "minimal", category: "Minimal", isPopular: true, atsScore: 100, downloads: 35000, bestFor: "Anyone applying via ATS", description: "Zero fluff, 100% machine-readable minimal design." },
  { id: "corp-exec", name: "Corporate Executive", baseTemplate: "professional", category: "Executive", atsScore: 95, downloads: 12000, bestFor: "Finance, Consulting", description: "Navy accents with robust typography for corporate roles." },
  { id: "cyber-sec", name: "Cyber Security Pro", baseTemplate: "classic", category: "Developers", atsScore: 96, downloads: 7200, bestFor: "Security Analysts", description: "High-density technical layout." },
  { id: "cloud-eng", name: "Cloud Engineer", baseTemplate: "modern", category: "Developers", atsScore: 97, downloads: 9100, bestFor: "DevOps, SRE", description: "Blue accents to highlight cloud certifications and skills." },
  { id: "product-mgr", name: "Product Manager", baseTemplate: "minimal", category: "Modern", atsScore: 94, downloads: 11000, bestFor: "PMs, APMs", description: "Focuses on impact, metrics, and cross-functional leadership." },
  { id: "creative-des", name: "Creative Designer", baseTemplate: "modern", category: "Designers", isNew: true, atsScore: 92, downloads: 4000, bestFor: "UX/UI, Graphic Design", description: "Modern sans-serif typography with generous whitespace." },
  { id: "academic-cv", name: "Academic CV", baseTemplate: "compact", category: "All", atsScore: 99, downloads: 18000, bestFor: "Researchers, Professors", description: "Dense academic formatting for publications and research." },
  { id: "finance-exec", name: "Finance Executive", baseTemplate: "professional", category: "Executive", atsScore: 96, downloads: 10500, bestFor: "Banking, PE", description: "Strictly conservative finance formatting." },
  { id: "startup-founder", name: "Startup Founder", baseTemplate: "modern", category: "Modern", atsScore: 95, downloads: 6500, bestFor: "Founders, Entrepreneurs", description: "Bold headers and impact-focused bullet points." },
  { id: "tech-arch", name: "Technical Architect", baseTemplate: "compact", category: "Developers", isPopular: true, atsScore: 98, downloads: 16000, bestFor: "System Architects", description: "Fits massive technical experience onto one or two pages." },
  { id: "grad-fresher", name: "Graduate Fresher", baseTemplate: "classic", category: "Minimal", atsScore: 99, downloads: 22000, bestFor: "New Grads", description: "Puts education and projects at the forefront." },
  { id: "one-page-ats", name: "One Page ATS", baseTemplate: "compact", category: "All", isFeatured: true, atsScore: 100, downloads: 41000, bestFor: "General Purpose", description: "Squeezes everything cleanly into a single page." },
  { id: "devops-pro", name: "DevOps Professional", baseTemplate: "classic", category: "Developers", atsScore: 98, downloads: 8800, bestFor: "DevOps, SRE", description: "Focuses on infrastructure and tools." },
  { id: "business-cons", name: "Business Consultant", baseTemplate: "professional", category: "Executive", atsScore: 96, downloads: 9300, bestFor: "Consulting", description: "McKinsey/Bain style formatting." },
  { id: "research-scholar", name: "Research Scholar", baseTemplate: "minimal", category: "All", atsScore: 97, downloads: 5000, bestFor: "Academia", description: "Clean serif font for publications." },
  { id: "marketing-pro", name: "Marketing Professional", baseTemplate: "modern", category: "Modern", atsScore: 94, downloads: 13500, bestFor: "Marketing, PR", description: "Vibrant accent colors." },
  { id: "healthcare-pro", name: "Healthcare Professional", baseTemplate: "classic", category: "All", atsScore: 98, downloads: 7000, bestFor: "Medical, Nursing", description: "Traditional clear formatting." },
  { id: "student-pro", name: "Student Professional", baseTemplate: "compact", category: "Minimal", atsScore: 96, downloads: 19000, bestFor: "Students, Interns", description: "Maximizes minimal experience." },
  { id: "two-page-exec", name: "Two Page Executive", baseTemplate: "professional", category: "Executive", atsScore: 97, downloads: 15500, bestFor: "Senior Professionals", description: "Spacious layout meant for long careers." },
  { id: "intl-cv", name: "International CV", baseTemplate: "minimal", category: "All", atsScore: 95, downloads: 8000, bestFor: "Global Applications", description: "Standardized European/Global format." },
  { id: "data-scientist-elite", name: "Data Scientist Elite", baseTemplate: "modern", category: "AI & ML", isPopular: true, atsScore: 98, downloads: 12000, bestFor: "Data Science, Analytics", description: "Highlights statistical tools and impact metrics." },
  { id: "neo-pro", name: "Neo Professional", baseTemplate: "modern", category: "Modern", isNew: true, atsScore: 93, downloads: 2000, bestFor: "Tech Leadership", description: "Next-gen aesthetics with high readability." },
];

const CATEGORIES: TemplateCategory[] = ["All", "Recently Used", "Favorites", "Featured", "Executive", "Modern", "Minimal", "Developers", "AI & ML", "Designers"];

/* ── COMPONENTS ────────────────────────────────────────────────── */

interface PremiumTemplateGalleryProps {
  onClose: () => void;
  onApply: (baseTemplate: TemplateName) => void;
  currentTemplate: TemplateName;
}

export function PremiumTemplateGallery({ onClose, onApply, currentTemplate }: PremiumTemplateGalleryProps) {
  const [activeCategory, setActiveCategory] = useState<TemplateCategory>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [recentlyUsed, setRecentlyUsed] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>("Recommended");
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  
  // Modals / Overlays
  const [previewTemplate, setPreviewTemplate] = useState<PremiumTemplate | null>(null);
  const [compareMode, setCompareMode] = useState(false);
  const [compareTemplates, setCompareTemplates] = useState<PremiumTemplate[]>([]);

  useEffect(() => {
    const savedFavs = localStorage.getItem("resumehive_favorites");
    if (savedFavs) setFavorites(new Set(JSON.parse(savedFavs)));
    const savedRecent = localStorage.getItem("resumehive_recent_templates");
    if (savedRecent) setRecentlyUsed(JSON.parse(savedRecent));
  }, []);

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      localStorage.setItem("resumehive_favorites", JSON.stringify(Array.from(next)));
      return next;
    });
  };

  const handleApply = (t: PremiumTemplate) => {
    const nextRecent = [t.id, ...recentlyUsed.filter(id => id !== t.id)].slice(0, 10);
    setRecentlyUsed(nextRecent);
    localStorage.setItem("resumehive_recent_templates", JSON.stringify(nextRecent));
    onApply(t.baseTemplate);
    setPreviewTemplate(null);
    onClose();
  };

  const toggleCompare = (t: PremiumTemplate, e: React.MouseEvent) => {
    e.stopPropagation();
    if (compareTemplates.find(c => c.id === t.id)) {
      setCompareTemplates(prev => prev.filter(c => c.id !== t.id));
    } else {
      if (compareTemplates.length < 2) setCompareTemplates([...compareTemplates, t]);
    }
  };

  const filteredTemplates = useMemo(() => {
    let result = TEMPLATES.filter(t => {
      const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) || t.description.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchesSearch) return false;
      if (activeCategory === "All") return true;
      if (activeCategory === "Favorites") return favorites.has(t.id);
      if (activeCategory === "Recently Used") return recentlyUsed.includes(t.id);
      if (activeCategory === "Featured") return t.isFeatured;
      return t.category === activeCategory;
    });

    if (activeCategory === "Recently Used") {
      result.sort((a, b) => recentlyUsed.indexOf(a.id) - recentlyUsed.indexOf(b.id));
      return result;
    }

    return result.sort((a, b) => {
      if (sortBy === "Most Popular" || sortBy === "Most Downloaded") return b.downloads - a.downloads;
      if (sortBy === "Highest ATS") return b.atsScore - a.atsScore;
      if (sortBy === "Newest") return (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0);
      return 0; // Recommended
    });
  }, [activeCategory, searchQuery, favorites, recentlyUsed, sortBy]);

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col bg-slate-50 overflow-hidden font-sans">
      
      {/* Top Navigation */}
      <header className="shrink-0 h-16 bg-white/90 backdrop-blur-2xl border-b border-slate-200/60 px-6 flex items-center justify-between z-30 shadow-sm">
         <div className="flex items-center gap-4">
           <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
             <LayoutTemplate className="w-5 h-5 text-indigo-500"/> Template Marketplace
           </h2>
         </div>
         
         <div className="flex items-center gap-4 md:gap-6">
           {compareTemplates.length > 0 && (
             <button onClick={() => setCompareMode(true)} className="hidden md:flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-full text-sm font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all">
               <GitCompare className="w-4 h-4"/> Compare ({compareTemplates.length}/2)
             </button>
           )}

           <div className="relative group hidden sm:block">
             <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
             <input type="text" placeholder="Search templates..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-64 pl-9 pr-4 py-2 bg-slate-100 rounded-full text-sm font-medium focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 border border-transparent transition-all outline-none" />
           </div>
           
           <button onClick={onClose} className="p-2 bg-slate-100 rounded-full text-slate-500 hover:bg-slate-200 hover:text-slate-900 transition-all">
             <X className="w-5 h-5"/>
           </button>
         </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
         
         {/* Filters & Sorting */}
         <div className="shrink-0 px-6 py-4 border-b border-slate-200/50 bg-white/60 backdrop-blur-md z-20 flex flex-wrap items-center justify-between gap-4">
           <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2 sm:pb-0 flex-1">
             {CATEGORIES.map(cat => (
               <button key={cat} onClick={() => setActiveCategory(cat)} className={`px-4 py-2 rounded-full text-[13px] font-bold tracking-wide whitespace-nowrap transition-all flex items-center gap-1.5 ${activeCategory === cat ? 'bg-slate-900 text-white shadow-md' : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'}`}>
                 {cat === "Favorites" && <Heart className={`w-3.5 h-3.5 ${activeCategory === cat ? 'fill-red-500 text-red-500' : ''}`}/>}
                 {cat === "Recently Used" && <Clock className="w-3.5 h-3.5"/>}
                 {cat}
               </button>
             ))}
           </div>

           <div className="relative">
             <button onClick={() => setShowSortDropdown(!showSortDropdown)} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-full text-[13px] font-bold text-slate-700 hover:bg-slate-50 transition-all">
               <Filter className="w-4 h-4 text-slate-400"/> Sort: {sortBy} <ChevronDown className="w-4 h-4 text-slate-400"/>
             </button>
             <AnimatePresence>
               {showSortDropdown && (
                 <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute right-0 top-full mt-2 w-48 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden py-2 z-50">
                   {(["Recommended", "Most Popular", "Newest", "Highest ATS", "Most Downloaded"] as SortOption[]).map(opt => (
                     <button key={opt} onClick={() => { setSortBy(opt); setShowSortDropdown(false); }} className={`w-full text-left px-4 py-2 text-[13px] font-bold transition-colors ${sortBy === opt ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}>
                       {opt}
                     </button>
                   ))}
                 </motion.div>
               )}
             </AnimatePresence>
           </div>
         </div>

         {/* Gallery Grid */}
         <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar relative bg-slate-50/50">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-8 max-w-[1600px] mx-auto pb-24">
               <AnimatePresence>
                 {filteredTemplates.map((t, idx) => (
                   <motion.div 
                     layout
                     initial={{ opacity: 0, y: 20, scale: 0.95 }}
                     animate={{ opacity: 1, y: 0, scale: 1 }}
                     exit={{ opacity: 0, scale: 0.95 }}
                     transition={{ duration: 0.4, delay: Math.min(idx * 0.03, 0.3), type: "spring", bounce: 0.2 }}
                     key={t.id}
                     onMouseEnter={() => setHoveredId(t.id)}
                     onMouseLeave={() => setHoveredId(null)}
                     onClick={() => setPreviewTemplate(t)}
                     className="group relative cursor-pointer"
                   >
                     {/* The WYSIWYG Thumbnail Card */}
                     <div className={`relative aspect-[1/1.35] bg-white rounded-2xl overflow-hidden shadow-sm border-2 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${currentTemplate === t.baseTemplate ? 'border-indigo-500 shadow-[0_0_0_4px_rgba(99,102,241,0.15)]' : 'border-slate-200/80 group-hover:border-indigo-400 group-hover:shadow-[0_24px_48px_-12px_rgba(79,70,229,0.25)] group-hover:-translate-y-2'}`}>
                        
                        {/* Live Miniature Preview */}
                        <div className="absolute top-0 left-0 w-[794px] h-[1123px] origin-top-left bg-white pointer-events-none p-8" style={{ transform: 'scale(0.35)' }}>
                           <TemplateRenderer data={MOCK_DATA} template={t.baseTemplate} />
                        </div>

                        {/* Quick Preview Hover (Large Floating Popup) */}
                        <div className={`absolute -right-[420px] top-[-20%] w-[400px] h-[565px] bg-white shadow-[0_40px_100px_rgba(0,0,0,0.2)] z-[100] pointer-events-none rounded-2xl overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] border border-slate-200/50 ${hoveredId === t.id ? 'opacity-100 translate-x-4 scale-100' : 'opacity-0 translate-x-0 scale-95'} hidden xl:block`}>
                          <div className="w-[794px] h-[1123px] origin-top-left bg-white p-8" style={{ transform: 'scale(0.5)' }}>
                            <TemplateRenderer data={MOCK_DATA} template={t.baseTemplate} />
                          </div>
                          {/* Floating badge inside quick preview */}
                          <div className="absolute bottom-4 inset-x-4 flex justify-between items-center bg-white/90 backdrop-blur-md p-3 rounded-xl border border-slate-100 shadow-xl">
                            <span className="font-extrabold text-slate-900">{t.name}</span>
                            <span className="bg-emerald-100 text-emerald-800 px-2 py-1 rounded text-xs font-bold">ATS {t.atsScore}%</span>
                          </div>
                        </div>

                        {/* Glass Overlay on Hover */}
                        <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/5 transition-colors duration-500 pointer-events-none" />
                        
                        {/* Actions Overlay */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <button className="bg-white/95 backdrop-blur-md px-5 py-2.5 rounded-full text-sm font-bold text-slate-800 shadow-xl hover:shadow-2xl hover:scale-105 flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 ease-out">
                            <Maximize2 className="w-4 h-4"/> Full Preview
                          </button>
                          <button onClick={(e) => toggleCompare(t, e)} className={`backdrop-blur-md px-5 py-2.5 rounded-full text-sm font-bold shadow-xl hover:shadow-2xl hover:scale-105 flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 ease-out delay-75 ${compareTemplates.find(c => c.id === t.id) ? 'bg-indigo-600 text-white' : 'bg-slate-900/90 text-white'}`}>
                            <GitCompare className="w-4 h-4"/> {compareTemplates.find(c => c.id === t.id) ? 'Remove Compare' : 'Compare'}
                          </button>
                        </div>
                        
                        {/* Badges */}
                        <div className="absolute top-3 left-3 flex flex-col gap-1.5 pointer-events-none">
                          {t.isFeatured && <span className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md shadow-sm flex items-center gap-1"><Sparkles className="w-2.5 h-2.5"/> Featured</span>}
                          {t.isPopular && <span className="bg-amber-400 text-amber-950 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md shadow-sm">Popular</span>}
                          {t.isNew && <span className="bg-emerald-400 text-emerald-950 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md shadow-sm">New</span>}
                        </div>

                        {/* Favorite Button */}
                        <button onClick={(e) => toggleFavorite(t.id, e)} className="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur-md rounded-full text-slate-300 hover:text-red-500 shadow-sm transition-all opacity-0 group-hover:opacity-100 hover:scale-110">
                          <Heart className={`w-4 h-4 transition-colors ${favorites.has(t.id) ? 'fill-red-500 text-red-500' : ''}`} />
                        </button>
                     </div>

                     {/* Card Info */}
                     <div className="mt-4 flex items-start justify-between px-1">
                       <div>
                         <h3 className="text-[16px] font-extrabold text-slate-900 group-hover:text-indigo-600 transition-colors">{t.name}</h3>
                         <p className="text-[13px] font-bold text-slate-500 mt-0.5">Best for {t.category}</p>
                       </div>
                       <div className="flex items-center gap-1 bg-green-50 text-green-700 px-2 py-1 rounded-lg text-[11px] font-extrabold uppercase border border-green-100 h-fit shadow-sm">
                         <Zap className="w-3.5 h-3.5"/> {t.atsScore}%
                       </div>
                     </div>
                   </motion.div>
                 ))}
               </AnimatePresence>
            </div>
         </div>
      </div>

      {/* FULL PREVIEW MODAL */}
      <AnimatePresence>
        {previewTemplate && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 md:p-8 bg-slate-900/60 backdrop-blur-3xl">
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="w-full max-w-6xl h-full max-h-[90vh] bg-white rounded-3xl shadow-2xl flex flex-col md:flex-row overflow-hidden">
               
               {/* Left: Huge Live Preview */}
               <div className="flex-1 bg-slate-100/50 relative overflow-y-auto p-4 md:p-8 flex justify-center custom-scrollbar">
                  <div className="w-full max-w-[794px] origin-top bg-white shadow-[0_20px_60px_rgba(0,0,0,0.1)] min-h-[1123px] relative p-8">
                     <TemplateRenderer data={MOCK_DATA} template={previewTemplate.baseTemplate} />
                  </div>
               </div>

               {/* Right: Info & Actions */}
               <div className="w-full md:w-[400px] bg-white border-t md:border-t-0 md:border-l border-slate-100 p-8 flex flex-col relative overflow-y-auto z-10 shadow-[-20px_0_40px_rgba(0,0,0,0.02)]">
                  <button onClick={() => setPreviewTemplate(null)} className="absolute top-6 right-6 p-2 bg-slate-100 rounded-full text-slate-500 hover:bg-slate-200 transition-all hover:rotate-90">
                    <X className="w-5 h-5"/>
                  </button>

                  <div className="mt-8 flex-1">
                    <div className="flex flex-wrap gap-2 mb-4">
                      {previewTemplate.isFeatured && <span className="bg-indigo-100 text-indigo-700 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md">Featured</span>}
                      <span className="bg-green-100 text-green-700 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md border border-green-200">ATS Score: {previewTemplate.atsScore}%</span>
                    </div>

                    <h2 className="text-3xl font-extrabold text-slate-900 mb-2 leading-tight">{previewTemplate.name}</h2>
                    <p className="text-[15px] font-medium text-slate-500 mb-8 leading-relaxed">{previewTemplate.description}</p>
                    
                    <div className="space-y-6">
                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Recommended For</h4>
                        <p className="text-sm font-bold text-slate-800">{previewTemplate.bestFor}</p>
                      </div>
                      
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Premium Features</h4>
                        <ul className="space-y-3">
                          {[
                            "Machine Readable ATS Format", 
                            "Perfect Print Margins (A4/Letter)", 
                            "Premium Typography Selection", 
                            "Dynamic 1-to-2 Page Scaling",
                            "Preserves Content on Swap"
                          ].map((f, i) => (
                            <li key={i} className="flex items-center gap-3 text-[14px] font-bold text-slate-700">
                              <CheckCircle2 className="w-5 h-5 text-emerald-500"/> {f}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-slate-100 mt-6 bg-white sticky bottom-0">
                    <button 
                      onClick={() => handleApply(previewTemplate)} 
                      className="w-full py-4 rounded-2xl font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 shadow-[0_8px_20px_rgba(79,70,229,0.3)] hover:shadow-[0_16px_32px_rgba(79,70,229,0.4)] hover:-translate-y-1 transition-all flex items-center justify-center gap-2 text-[15px] group"
                    >
                      <LayoutGrid className="w-5 h-5"/> Use This Template
                    </button>
                    {currentTemplate === previewTemplate.baseTemplate && (
                      <p className="text-[13px] font-bold text-slate-400 text-center mt-4 flex items-center justify-center gap-1.5">
                        <Check className="w-4 h-4 text-emerald-500"/> Currently Active
                      </p>
                    )}
                  </div>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* COMPARISON MODE MODAL */}
      <AnimatePresence>
        {compareMode && compareTemplates.length === 2 && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 md:p-8 bg-slate-900/80 backdrop-blur-3xl">
             <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-[1600px] h-full max-h-[90vh] bg-slate-50 rounded-[32px] shadow-2xl flex flex-col overflow-hidden">
                <header className="shrink-0 h-20 bg-white border-b border-slate-200 px-8 flex items-center justify-between z-10 shadow-sm">
                  <h2 className="text-2xl font-extrabold text-slate-900 flex items-center gap-3"><GitCompare className="w-6 h-6 text-indigo-500"/> Side-by-Side Comparison</h2>
                  <button onClick={() => { setCompareMode(false); setCompareTemplates([]); }} className="px-6 py-2.5 bg-slate-100 rounded-full text-sm font-bold text-slate-700 hover:bg-slate-200 transition-all">Close Comparison</button>
                </header>
                <div className="flex-1 flex overflow-hidden">
                  {compareTemplates.map((t, index) => (
                    <div key={t.id} className={`flex-1 flex flex-col overflow-hidden ${index === 0 ? 'border-r border-slate-200' : ''}`}>
                       <div className="shrink-0 p-6 bg-white/50 backdrop-blur-md flex items-center justify-between z-10 shadow-sm">
                          <div>
                            <h3 className="text-xl font-extrabold text-slate-900">{t.name}</h3>
                            <div className="flex items-center gap-2 mt-2">
                              <span className="bg-emerald-100 text-emerald-800 px-2 py-1 rounded text-[10px] font-bold uppercase">ATS Score: {t.atsScore}%</span>
                              <span className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded text-[10px] font-bold uppercase">{t.category}</span>
                            </div>
                          </div>
                          <button onClick={() => { handleApply(t); setCompareMode(false); setCompareTemplates([]); }} className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full text-sm font-bold shadow-md transition-all">Select</button>
                       </div>
                       <div className="flex-1 overflow-y-auto p-8 flex justify-center custom-scrollbar bg-slate-100/50">
                         <div className="w-[794px] origin-top bg-white shadow-xl min-h-[1123px] relative p-8" style={{ transform: 'scale(0.8)' }}>
                           <TemplateRenderer data={MOCK_DATA} template={t.baseTemplate} />
                         </div>
                       </div>
                    </div>
                  ))}
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  );
}
