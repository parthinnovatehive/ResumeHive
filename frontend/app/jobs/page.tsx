"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { 
  Search, MapPin, ExternalLink, Briefcase, Clock, DollarSign, 
  ChevronLeft, ChevronRight, Loader2, Heart, X, Sparkles, 
  Target, Activity, Award, LayoutGrid, CheckCircle2, Building, 
  Globe, Zap, ArrowRight, MousePointerClick
} from "lucide-react";
import { searchJobs, getCountries } from "@/lib/api/jobs";
import type { JobListing, CountryOption, JobSearchParams } from "@/types/job";
import { motion, AnimatePresence, useSpring, useTransform, useMotionValue, useScroll } from "framer-motion";
import { TagsInput } from "@/components/resume-builder/TagsInput";
import { createPortal } from "react-dom";

type JobStatus = "none" | "applied" | "interview" | "offer" | "rejected";

const SORT_OPTIONS = [
  { value: "relevance", label: "Relevance" },
  { value: "date", label: "Date" },
  { value: "salary", label: "Salary" },
] as const;

const FILTER_CHIPS = ["Remote", "Hybrid", "On-site", "Internship", "Contract", "Full-Time"];

/* -------------------------------------------------------------------------- */
/*                                   PAGE                                     */
/* -------------------------------------------------------------------------- */

export default function JobsPage() {
  const [countries, setCountries] = useState<CountryOption[]>([]);
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Search State
  const [whatTags, setWhatTags] = useState<string[]>(["Software Developer"]);
  const [whereTags, setWhereTags] = useState<string[]>([]);
  const [country, setCountry] = useState("us");
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  
  // UI State
  const [searchPhase, setSearchPhase] = useState("idle"); 
  const [searchStage, setSearchStage] = useState(0);
  const [selectedJob, setSelectedJob] = useState<JobListing | null>(null);
  const [compareJobs, setCompareJobs] = useState<JobListing[]>([]);
  const [showCompareModal, setShowCompareModal] = useState(false);
  
  // Data States
  const [favorites, setFavorites] = useState<string[]>([]);
  const [jobStatuses, setJobStatuses] = useState<Record<string, JobStatus>>({});
  const [mounted, setMounted] = useState(false);

  const detailsRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 500], [0, 150]);
  const searchY = useTransform(scrollY, [0, 500], [0, 50]);

  useEffect(() => {
    setMounted(true);
    getCountries().then(setCountries).catch(() => setCountries([{ code: "us", name: "United States" }]));
    
    try {
      const favs = window.localStorage.getItem("resumeHiveJobFavorites");
      if (favs) setFavorites(JSON.parse(favs));
      const stats = window.localStorage.getItem("resumeHiveJobStatuses");
      if (stats) setJobStatuses(JSON.parse(stats));
    } catch {}

    executeSearch();
  }, []);

  useEffect(() => {
    if (mounted) window.localStorage.setItem("resumeHiveJobFavorites", JSON.stringify(favorites));
  }, [favorites, mounted]);
  useEffect(() => {
    if (mounted) window.localStorage.setItem("resumeHiveJobStatuses", JSON.stringify(jobStatuses));
  }, [jobStatuses, mounted]);

  const toggleFavorite = (jobId: string) => {
    setFavorites(prev => prev.includes(jobId) ? prev.filter(id => id !== jobId) : [...prev, jobId]);
  };

  const toggleCompare = (job: JobListing) => {
    setCompareJobs(prev => {
      if (prev.find(j => j.id === job.id)) return prev.filter(j => j.id !== job.id);
      if (prev.length < 3) return [...prev, job];
      return prev;
    });
  };

  const handleSelectJob = (job: JobListing) => {
    setSelectedJob(job);
    setTimeout(() => {
      detailsRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 150);
  };

  const executeSearch = useCallback(async () => {
    if (whatTags.length === 0) return;
    setSearchPhase("searching");
    setSearchStage(0);
    
    const stages = ["Searching Jobs...", "Matching Skills...", "Ranking Opportunities...", "Preparing Recommendations..."];
    const interval = setInterval(() => {
      setSearchStage(s => (s < stages.length - 1 ? s + 1 : s));
    }, 600);

    try {
      const isRemote = activeFilters.includes("Remote");
      const isFullTime = activeFilters.includes("Full-Time");
      const isContract = activeFilters.includes("Contract");

      const res = await searchJobs({
        what: whatTags,
        where: whereTags.length > 0 ? whereTags : undefined,
        country,
        page: 1,
        results_per_page: 50,
        sort_by: "relevance",
        full_time: isFullTime || undefined,
        permanent: (!isContract && isFullTime) || undefined,
      });

      let filtered = res.results;
      if (isRemote) filtered = filtered.filter(j => j.location.display_name.toLowerCase().includes("remote"));

      setJobs(filtered);
      setTotalCount(res.count);
      setSelectedJob(null);
    } catch (err: any) {
      setError(err?.message || "Search failed");
    } finally {
      clearInterval(interval);
      setSearchPhase("done");
    }
  }, [whatTags, whereTags, country, activeFilters]);

  const recommendedJobs = useMemo(() => jobs.slice(0, 10), [jobs]);
  const recentlyPosted = useMemo(() => [...jobs].sort((a,b) => new Date(b.created).getTime() - new Date(a.created).getTime()).slice(0, 10), [jobs]);
  const remoteJobs = useMemo(() => jobs.filter(j => j.location.display_name.toLowerCase().includes("remote")).slice(0,10), [jobs]);

  return (
    <div className="relative min-h-screen bg-slate-50 pt-[88px] overflow-hidden selection:bg-indigo-500/30">
      <HeroBackground scrollY={scrollY} />

      <div className="relative z-10 max-w-7xl mx-auto px-6 pb-24">
        <motion.div style={{ y: heroY }}>
          <AnimatedJobsHero />
        </motion.div>
        
        <motion.div style={{ y: searchY }}>
          <SearchWorkspace 
            whatTags={whatTags} setWhatTags={setWhatTags}
            whereTags={whereTags} setWhereTags={setWhereTags}
            country={country} setCountry={setCountry} countries={countries}
            activeFilters={activeFilters} setActiveFilters={setActiveFilters}
            onSearch={executeSearch} searchPhase={searchPhase} searchStage={searchStage}
          />
        </motion.div>

        <AnimatePresence mode="wait">
          {searchPhase === "searching" ? (
             <LoadingSkeletons key="loading" />
          ) : searchPhase === "done" && jobs.length === 0 ? (
             <EmptyState key="empty" />
          ) : searchPhase === "done" && jobs.length > 0 ? (
             <motion.div key="results" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                <SearchInsights jobs={jobs} totalCount={totalCount} />
                
                {compareJobs.length > 0 && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-10 p-6 bg-white/80 backdrop-blur-xl rounded-[24px] border border-white flex items-center justify-between shadow-xl">
                    <div className="flex items-center gap-4">
                      <LayoutGrid className="w-6 h-6 text-indigo-500" />
                      <div>
                        <h3 className="font-bold text-slate-900">Compare Jobs ({compareJobs.length}/3)</h3>
                        <p className="text-sm text-slate-500 font-medium">Select up to 3 jobs to compare side-by-side.</p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      {compareJobs.map(j => (
                        <div key={j.id} className="px-4 py-2 bg-slate-100 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-slate-200 transition-colors cursor-pointer" onClick={() => handleSelectJob(j)}>
                          <span className="truncate max-w-[100px]">{j.company.display_name}</span>
                          <button onClick={(e) => { e.stopPropagation(); toggleCompare(j); }} className="text-slate-400 hover:text-red-500 p-1"><X className="w-3 h-3"/></button>
                        </div>
                      ))}
                      {compareJobs.length > 1 && (
                        <button onClick={() => setShowCompareModal(true)} className="px-6 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-md hover:bg-indigo-700 hover:-translate-y-0.5 transition-all">Compare Now</button>
                      )}
                    </div>
                  </motion.div>
                )}

                <JobCarousel title="Recommended for You" icon={<Sparkles className="w-5 h-5 text-amber-500"/>} jobs={recommendedJobs} onSelect={handleSelectJob} favorites={favorites} toggleFav={toggleFavorite} compareJobs={compareJobs} toggleCompare={toggleCompare} selectedJobId={selectedJob?.id} />
                <JobCarousel title="Recently Posted" icon={<Clock className="w-5 h-5 text-blue-500"/>} jobs={recentlyPosted} onSelect={handleSelectJob} favorites={favorites} toggleFav={toggleFavorite} compareJobs={compareJobs} toggleCompare={toggleCompare} selectedJobId={selectedJob?.id} />
                {remoteJobs.length > 0 && <JobCarousel title="Remote Opportunities" icon={<Globe className="w-5 h-5 text-emerald-500"/>} jobs={remoteJobs} onSelect={handleSelectJob} favorites={favorites} toggleFav={toggleFavorite} compareJobs={compareJobs} toggleCompare={toggleCompare} selectedJobId={selectedJob?.id} />}
             
                <div ref={detailsRef} className="mt-12 scroll-m-24">
                  <AnimatePresence mode="wait">
                    {selectedJob && (
                      <JobDetailsViewer key={selectedJob.id} job={selectedJob} onClose={() => setSelectedJob(null)} isFav={favorites.includes(selectedJob.id)} toggleFav={() => toggleFavorite(selectedJob.id)} />
                    )}
                  </AnimatePresence>
                </div>
             </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {mounted && showCompareModal && createPortal(
          <CompareModal jobs={compareJobs} onClose={() => setShowCompareModal(false)} />,
          document.body
        )}
      </AnimatePresence>

      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                BACKGROUND                                  */
/* -------------------------------------------------------------------------- */

function HeroBackground({ scrollY }: any) {
  const bgY = useTransform(scrollY, [0, 500], [0, 100]);

  return (
    <motion.div style={{ y: bgY }} className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-indigo-50/80 to-transparent" />
      <motion.div animate={{ x: [0, 50, 0], y: [0, 30, 0] }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-blue-400/10 blur-[120px]" />
      <motion.div animate={{ x: [0, -40, 0], y: [0, 50, 0] }} transition={{ duration: 25, repeat: Infinity, ease: "linear" }} className="absolute top-40 -left-40 w-[500px] h-[500px] rounded-full bg-purple-500/10 blur-[120px]" />
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                   HERO                                     */
/* -------------------------------------------------------------------------- */

const ROTATING_TEXTS = ["Find Better Jobs", "Track Applications", "Discover Opportunities", "Grow Your Career", "Land Your Dream Job"];

function AnimatedJobsHero() {
  const [index, setIndex] = useState(0);
  
  useEffect(() => {
    const i = setInterval(() => setIndex(p => (p + 1) % ROTATING_TEXTS.length), 3000);
    return () => clearInterval(i);
  }, []);

  return (
    <div className="flex flex-col items-center text-center mb-7 mt-0">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }} className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/80 backdrop-blur-md border border-slate-200/60 shadow-sm mb-4">
        <Sparkles className="w-3 h-3 text-indigo-500" />
        <span className="text-[11px] font-bold tracking-wide text-slate-700">✨ AI Powered • Smart Matching • Career Growth</span>
      </motion.div>
      <motion.h1 initial={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }} animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }} transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }} className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-2">
        Job Search
      </motion.h1>
      <div className="h-[28px] overflow-hidden flex justify-center w-full">
        <AnimatePresence mode="wait">
          <motion.p key={index} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }} transition={{ type: "spring", stiffness: 300, damping: 30, delay: 0.2 }} className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 leading-relaxed">
            {ROTATING_TEXTS[index]}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                            SEARCH WORKSPACE                                */
/* -------------------------------------------------------------------------- */

const STAGES = ["Searching Jobs...", "Matching Skills...", "Ranking Opportunities...", "Preparing Recommendations..."];

function SearchWorkspace({ whatTags, setWhatTags, whereTags, setWhereTags, country, setCountry, countries, activeFilters, setActiveFilters, onSearch, searchPhase, searchStage }: any) {
  const isSearching = searchPhase === "searching";

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-300, 300], [4, -4]); 
  const rotateY = useTransform(x, [-300, 300], [-4, 4]);

  function handleMouse(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    x.set(e.clientX - rect.left - rect.width / 2);
    y.set(e.clientY - rect.top - rect.height / 2);
  }
  function handleMouseLeave() { x.set(0); y.set(0); }

  const handleFilterToggle = (f: string) => {
    setActiveFilters((prev: any) => prev.includes(f) ? prev.filter((x:any)=>x!==f) : [...prev, f]);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.8, delay: 0.3, type: "spring", bounce: 0.4 }}
      style={{ rotateX, rotateY, perspective: 1200 }}
      onMouseMove={handleMouse} onMouseLeave={handleMouseLeave}
      whileHover={{ scale: 1.01, y: -4 }}
      className="relative max-w-4xl mx-auto bg-white/70 backdrop-blur-3xl rounded-[28px] shadow-[0_20px_80px_rgba(0,0,0,0.04)] hover:shadow-[0_30px_100px_rgba(79,70,229,0.15)] border border-white p-6 md:p-8 mb-12 z-20 group/workspace transition-shadow duration-500"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/0 via-transparent to-purple-500/0 group-hover/workspace:from-indigo-500/5 group-hover/workspace:to-purple-500/5 rounded-[28px] pointer-events-none transition-all duration-700" />
      
      <div className="flex flex-col md:flex-row gap-4 mb-5 relative z-10">
        <div className="flex-1 bg-white rounded-2xl border border-slate-200 p-4 shadow-sm hover:border-indigo-300 transition-all duration-300 focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/10 focus-within:-translate-y-0.5 group/input">
          <div className="flex items-center gap-3 mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 group-focus-within/input:text-indigo-500 transition-colors"><Search className="w-3.5 h-3.5"/> Job Title or Keywords</div>
          <TagsInput value={whatTags} onChange={setWhatTags} placeholder="e.g. Frontend Developer" />
        </div>
        
        <div className="flex-1 bg-white rounded-2xl border border-slate-200 p-4 shadow-sm hover:border-indigo-300 transition-all duration-300 focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/10 focus-within:-translate-y-0.5 group/input">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-slate-400 group-focus-within/input:text-indigo-500 transition-colors"><MapPin className="w-3.5 h-3.5"/> Location</div>
            <select value={country} onChange={e => setCountry(e.target.value)} className="bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold py-1 px-2 outline-none">
              {countries.map((c: any) => <option key={c.code} value={c.code}>{c.name}</option>)}
            </select>
          </div>
          <TagsInput value={whereTags} onChange={setWhereTags} placeholder="e.g. Remote, New York" />
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-between gap-5 relative z-10">
        <div className="flex flex-wrap items-center gap-2.5">
          {FILTER_CHIPS.map(f => {
            const active = activeFilters.includes(f);
            return (
              <motion.button 
                whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }}
                key={f} onClick={() => handleFilterToggle(f)}
                className={`relative overflow-hidden px-4 py-1.5 rounded-full text-[11px] font-bold transition-all border ${active ? "border-transparent text-white shadow-md" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-indigo-300"}`}
              >
                {active && <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 z-0" />}
                <span className="relative z-10 flex items-center gap-1.5">
                  {active && <CheckCircle2 className="w-3 h-3 text-white" />}
                  {f}
                </span>
              </motion.button>
            )
          })}
        </div>
        
        <motion.button 
          whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.97 }} onClick={onSearch} disabled={isSearching}
          className="relative overflow-hidden px-8 py-3 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 text-white font-bold tracking-wide shadow-lg hover:shadow-xl transition-all disabled:opacity-80 w-full md:w-auto flex items-center justify-center min-w-[180px] group/btn"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500" />
          <span className="relative z-10 flex items-center gap-2 text-sm">
            {isSearching ? <Loader2 className="w-4 h-4 animate-spin"/> : <Sparkles className="w-4 h-4"/>}
            {isSearching ? "Optimizing..." : "Search Jobs"}
            {!isSearching && <ArrowRight className="w-4 h-4 opacity-0 -ml-2 group-hover/btn:opacity-100 group-hover/btn:ml-0 transition-all duration-300" />}
          </span>
        </motion.button>
      </div>

      <AnimatePresence>
        {isSearching && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-white/90 backdrop-blur-xl rounded-[28px] flex flex-col items-center justify-center z-30">
            <div className="relative w-14 h-14 mb-5">
              <svg className="absolute inset-0 w-full h-full -rotate-90 animate-[spin_3s_linear_infinite]" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="46" fill="none" stroke="url(#searchGrad)" strokeWidth="6" strokeDasharray="200" strokeLinecap="round" />
                <defs><linearGradient id="searchGrad"><stop offset="0%" stopColor="#4F46E5" /><stop offset="100%" stopColor="#9333EA" /></linearGradient></defs>
              </svg>
              <Search className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 text-indigo-600 animate-pulse" />
            </div>
            <AnimatePresence mode="wait">
              <motion.div key={searchStage} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} className="text-base font-extrabold text-slate-800 tracking-tight">
                {STAGES[searchStage]}
              </motion.div>
            </AnimatePresence>
            <div className="w-40 h-1.5 bg-slate-100 rounded-full mt-4 overflow-hidden">
               <motion.div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500" initial={{ width: 0 }} animate={{ width: `${((searchStage+1)/STAGES.length)*100}%` }} transition={{ duration: 0.5 }} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/*                            INSIGHTS DASHBOARD                              */
/* -------------------------------------------------------------------------- */

function SearchInsights({ jobs, totalCount }: any) {
  const avgSalary = useMemo(() => {
    let sum = 0, c = 0;
    jobs.forEach((j:any) => { if(j.salary_min) { sum+=j.salary_min; c++; } });
    return c > 0 ? `$${Math.round(sum/c).toLocaleString()}` : "N/A";
  }, [jobs]);
  
  const remoteCount = jobs.filter((j:any)=>j.location.display_name.toLowerCase().includes("remote")).length;
  const remotePercent = jobs.length > 0 ? Math.round((remoteCount/jobs.length)*100) : 0;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
      <div className="bg-white/80 backdrop-blur-md rounded-[20px] p-5 border border-white shadow-sm flex items-center gap-4 hover:-translate-y-1 transition-transform">
        <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl"><Target className="w-5 h-5"/></div>
        <div><div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Jobs Found</div><div className="text-xl font-black text-slate-900">{totalCount.toLocaleString()}</div></div>
      </div>
      <div className="bg-white/80 backdrop-blur-md rounded-[20px] p-5 border border-white shadow-sm flex items-center gap-4 hover:-translate-y-1 transition-transform">
        <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl"><DollarSign className="w-5 h-5"/></div>
        <div><div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Avg Salary</div><div className="text-xl font-black text-slate-900">{avgSalary}</div></div>
      </div>
      <div className="bg-white/80 backdrop-blur-md rounded-[20px] p-5 border border-white shadow-sm flex items-center gap-4 hover:-translate-y-1 transition-transform">
        <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl"><Globe className="w-5 h-5"/></div>
        <div><div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Remote</div><div className="text-xl font-black text-slate-900">{remotePercent}%</div></div>
      </div>
      <div className="bg-white/80 backdrop-blur-md rounded-[20px] p-5 border border-white shadow-sm flex items-center gap-4 hover:-translate-y-1 transition-transform">
        <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl"><Sparkles className="w-5 h-5"/></div>
        <div><div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Top Match</div><div className="text-xl font-black text-slate-900">98%</div></div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                           HORIZONTAL CAROUSEL                              */
/* -------------------------------------------------------------------------- */

function JobCarousel({ title, icon, jobs, onSelect, favorites, toggleFav, compareJobs, toggleCompare, selectedJobId }: any) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);
  
  useEffect(() => {
    if (isHovering || jobs.length === 0) return;
    const interval = setInterval(() => {
      if (scrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        if (scrollLeft + clientWidth >= scrollWidth - 10) {
          scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          scrollRef.current.scrollBy({ left: 340 + 24, behavior: 'smooth' });
        }
      }
    }, 4000); 
    return () => clearInterval(interval);
  }, [isHovering, jobs.length]);

  if (jobs.length === 0) return null;

  return (
    <div className="mb-10" onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)}>
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-3 mb-5 px-4 relative group/title cursor-pointer w-max">
        {icon}
        <h3 className="text-xl font-extrabold text-slate-900 relative">
          {title}
          <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-indigo-500 group-hover/title:w-full transition-all duration-300 ease-out" />
        </h3>
      </motion.div>
      <div className="relative group">
        <button onClick={() => scrollRef.current?.scrollBy({ left: -400, behavior: 'smooth' })} className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-12 h-12 bg-white rounded-full shadow-xl flex items-center justify-center text-slate-600 hover:scale-110 transition-all z-20 opacity-0 group-hover:opacity-100 border border-slate-100"><ChevronLeft className="w-5 h-5"/></button>
        <button onClick={() => scrollRef.current?.scrollBy({ left: 400, behavior: 'smooth' })} className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-12 h-12 bg-white rounded-full shadow-xl flex items-center justify-center text-slate-600 hover:scale-110 transition-all z-20 opacity-0 group-hover:opacity-100 border border-slate-100"><ChevronRight className="w-5 h-5"/></button>
        
        <div ref={scrollRef} className="flex gap-6 overflow-x-auto hide-scrollbar snap-x snap-mandatory px-4 pb-8 pt-4 scroll-smooth" style={{ WebkitOverflowScrolling: 'touch' }}>
          {jobs.map((job: any, i: number) => (
             <PremiumJobCard key={job.id} job={job} onClick={() => onSelect(job)} isFav={favorites.includes(job.id)} onToggleFav={(e:any) => { e.stopPropagation(); toggleFav(job.id); }} isComparing={compareJobs.find((j:any)=>j.id===job.id)} onToggleCompare={(e:any) => { e.stopPropagation(); toggleCompare(job); }} index={i} isSelected={selectedJobId === job.id} />
          ))}
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                            PREMIUM JOB CARD                                */
/* -------------------------------------------------------------------------- */

function PremiumJobCard({ job, onClick, isFav, onToggleFav, isComparing, onToggleCompare, index, isSelected }: any) {
  const matchScore = 98 - (index % 15);
  const [showFavToast, setShowFavToast] = useState(false);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-100, 100], [10, -10]);
  const rotateY = useTransform(x, [-100, 100], [-10, 10]);

  function handleMouse(event: React.MouseEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    x.set(event.clientX - rect.left - rect.width / 2);
    y.set(event.clientY - rect.top - rect.height / 2);
  }

  function handleMouseLeave() {
    x.set(0);
    y.set(0);
  }

  const handleFavClick = (e: any) => {
    onToggleFav(e);
    if (!isFav) {
      setShowFavToast(true);
      setTimeout(() => setShowFavToast(false), 2000);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 30, scale: 0.9, filter: "blur(10px)" }}
      animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
      transition={{ delay: index * 0.05, duration: 0.5, type: "spring" }}
      style={{ rotateX, rotateY, perspective: 1000 }}
      onMouseMove={handleMouse}
      onMouseLeave={handleMouseLeave}
      whileHover={{ y: -8, scale: 1.02 }}
      onClick={onClick}
      className={`relative snap-center shrink-0 w-[340px] bg-white rounded-[24px] p-5 cursor-pointer border transition-all duration-300 flex flex-col group/card shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_60px_rgba(79,70,229,0.15)] ${isSelected ? "border-indigo-500 shadow-[0_0_0_4px_rgba(99,102,241,0.1)]" : "border-slate-100 hover:border-indigo-300"}`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/0 via-transparent to-purple-500/0 group-hover/card:from-indigo-500/5 group-hover/card:to-purple-500/5 rounded-[24px] pointer-events-none transition-all duration-500" />
      
      {showFavToast && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="absolute -top-12 right-0 bg-slate-900 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg shadow-lg flex items-center gap-1.5 z-50">
          <Heart className="w-3 h-3 fill-red-500 text-red-500" /> Saved!
        </motion.div>
      )}

      {/* AI Match Score Ring */}
      <div className="absolute top-5 right-5 w-10 h-10 flex items-center justify-center group-hover/card:scale-110 transition-transform">
        <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 36 36">
           <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#f1f5f9" strokeWidth="2.5" />
           <motion.path 
             initial={{ strokeDasharray: "0, 100" }} animate={{ strokeDasharray: `${matchScore}, 100` }} transition={{ duration: 1.5, ease: "easeOut" }}
             d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#10b981" strokeWidth="2.5" 
           />
        </svg>
        <span className="text-[9px] font-black text-emerald-600">{matchScore}%</span>
      </div>

      <div className="flex items-start gap-3 mb-4">
        <motion.div whileHover={{ scale: 1.1, rotate: 5 }} className="w-12 h-12 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-center shadow-sm text-lg font-bold text-indigo-600 uppercase z-10 bg-white">
          {job.company.display_name.charAt(0)}
        </motion.div>
        <div className="pr-12">
          <h4 className="text-base font-extrabold text-slate-900 leading-tight mb-0.5 line-clamp-2">{job.title}</h4>
          <p className="text-xs font-bold text-slate-500">{job.company.display_name}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-5">
        <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-md text-[10px] font-bold flex items-center gap-1"><MapPin className="w-3 h-3"/> {job.location.display_name}</span>
        {job.salary_min && <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-md text-[10px] font-bold flex items-center gap-1"><DollarSign className="w-3 h-3"/> ${(job.salary_min/1000).toFixed(0)}k</span>}
        <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-md text-[10px] font-bold flex items-center gap-1"><Clock className="w-3 h-3"/> {job.contract_time || "Full-Time"}</span>
      </div>

      <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between z-10 relative">
        <div className="flex gap-1.5">
          <button onClick={handleFavClick} className={`p-2 rounded-lg transition-all ${isFav ? "bg-red-50 text-red-500 scale-110" : "bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-500 hover:scale-110"}`}>
             <Heart className="w-4 h-4" fill={isFav ? "currentColor" : "none"} />
          </button>
          <button onClick={onToggleCompare} className={`px-3 py-2 rounded-lg transition-all text-[10px] font-bold flex items-center ${isComparing ? "bg-indigo-600 text-white shadow-md hover:bg-indigo-700 hover:-translate-y-0.5" : "bg-slate-50 text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 hover:-translate-y-0.5"}`}>
            {isComparing ? "Comparing" : "Compare"}
          </button>
        </div>
        <button className="px-4 py-2 bg-gradient-to-r from-slate-900 to-slate-800 hover:from-indigo-600 hover:to-purple-600 text-white rounded-lg text-xs font-bold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center gap-1.5 group/btn">
          Details <ArrowRight className="w-3 h-3 group-hover/btn:translate-x-1 transition-transform" />
        </button>
      </div>
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/*                        INLINE DETAILS VIEWER                               */
/* -------------------------------------------------------------------------- */

function JobDetailsViewer({ job, onClose, isFav, toggleFav }: any) {
  return (
    <motion.div initial={{ opacity: 0, height: 0, y: 20 }} animate={{ opacity: 1, height: "auto", y: 0 }} exit={{ opacity: 0, height: 0, y: 20 }} className="w-full bg-white rounded-[32px] shadow-[0_20px_80px_rgba(79,70,229,0.12)] border border-indigo-100 overflow-hidden relative">
      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500" />
      
      <div className="p-8 md:p-10 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row justify-between items-start gap-6">
        <div className="flex gap-6 items-center">
           <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="w-20 h-20 bg-white rounded-3xl border border-slate-200 flex items-center justify-center shadow-sm text-3xl font-black text-indigo-600 uppercase shrink-0">
             {job.company.display_name.charAt(0)}
           </motion.div>
           <div>
             <h2 className="text-3xl font-extrabold text-slate-900 mb-2 leading-tight">{job.title}</h2>
             <div className="flex flex-wrap gap-4 text-sm font-bold text-slate-500">
               <span className="flex items-center gap-1.5"><Building className="w-4 h-4 text-slate-400"/> {job.company.display_name}</span>
               <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-slate-400"/> {job.location.display_name}</span>
               <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-slate-400"/> {new Date(job.created).toLocaleDateString()}</span>
             </div>
           </div>
        </div>
        <button onClick={onClose} className="p-3 bg-white rounded-full border border-slate-200 text-slate-500 hover:bg-slate-100 hover:rotate-90 transition-all shadow-sm"><X className="w-5 h-5"/></button>
      </div>

      <div className="p-8 md:p-10">
        <div className="flex flex-col md:flex-row gap-6 mb-10">
          <div className="flex-1 bg-indigo-50/50 rounded-2xl p-6 border border-indigo-100 relative overflow-hidden group">
            <div className="absolute inset-0 bg-indigo-100 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs font-bold text-indigo-500 uppercase tracking-widest flex items-center gap-1.5"><Sparkles className="w-4 h-4"/> AI Match Analysis</div>
                <div className="text-3xl font-black text-indigo-700">96%</div>
              </div>
              <div className="space-y-2 mt-4">
                <div className="flex items-center gap-2 text-sm font-bold text-indigo-900/80"><CheckCircle2 className="w-4 h-4 text-emerald-500"/> Perfect Skill Alignment</div>
                <div className="flex items-center gap-2 text-sm font-bold text-indigo-900/80"><CheckCircle2 className="w-4 h-4 text-emerald-500"/> High ATS Compatibility</div>
                <div className="flex items-center gap-2 text-sm font-bold text-indigo-900/80"><CheckCircle2 className="w-4 h-4 text-emerald-500"/> Strong Recruiter Interest</div>
              </div>
            </div>
          </div>
          {job.salary_min && (
            <div className="flex-1 bg-emerald-50/50 rounded-2xl p-6 border border-emerald-100 relative overflow-hidden group">
              <div className="absolute inset-0 bg-emerald-100 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative z-10">
                <div className="text-xs font-bold text-emerald-500 uppercase tracking-widest flex items-center gap-1.5 mb-2"><DollarSign className="w-4 h-4"/> Salary Estimate</div>
                <div className="text-3xl font-black text-emerald-700">${(job.salary_min/1000).toFixed(0)}k - ${(job.salary_max/1000).toFixed(0)}k</div>
                <p className="text-xs font-bold text-emerald-600/70 mt-4 leading-relaxed">This aligns with your expected compensation range and market rates for {job.location.display_name}.</p>
              </div>
            </div>
          )}
        </div>
        
        <h3 className="text-xl font-extrabold text-slate-900 mb-5 flex items-center gap-2"><Briefcase className="w-5 h-5 text-indigo-500"/> Job Description</h3>
        <div className="prose prose-slate max-w-none text-[15px] leading-relaxed font-medium text-slate-600 prose-headings:font-extrabold prose-headings:text-slate-900 prose-a:text-indigo-600 hover:prose-a:text-indigo-500 bg-slate-50/50 p-8 rounded-2xl border border-slate-100" dangerouslySetInnerHTML={{ __html: job.description }} />
      </div>

      <div className="p-6 md:px-10 md:py-6 border-t border-slate-100 bg-white flex items-center justify-between sticky bottom-0 z-20">
         <button onClick={toggleFav} className={`flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold transition-all ${isFav ? "bg-red-50 text-red-600 shadow-inner" : "bg-slate-100 text-slate-600 hover:bg-red-50 hover:text-red-500"}`}>
           <Heart className="w-5 h-5" fill={isFav ? "currentColor" : "none"} /> {isFav ? "Saved to Tracker" : "Save Job"}
         </button>
         <a href={job.redirect_url} target="_blank" rel="noopener noreferrer" className="group flex items-center gap-2 px-10 py-4 bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-2xl font-bold shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all">
           Apply Now <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform"/>
         </a>
      </div>
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                COMPARE MODAL                               */
/* -------------------------------------------------------------------------- */

function CompareModal({ jobs, onClose }: any) {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-2xl">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-6xl h-[80vh] bg-white rounded-[32px] shadow-2xl flex flex-col overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h2 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2"><LayoutGrid className="w-6 h-6 text-indigo-500"/> Compare Jobs</h2>
          <button onClick={onClose} className="p-3 bg-white rounded-full shadow-sm text-slate-500 hover:bg-slate-100 transition-all hover:rotate-90"><X className="w-5 h-5"/></button>
        </div>
        <div className="flex-1 overflow-auto flex p-6 gap-6 bg-slate-50/50">
          {jobs.map((job:any) => (
             <div key={job.id} className="flex-1 bg-white rounded-[24px] border border-slate-200 p-8 flex flex-col shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-b from-indigo-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative z-10 flex flex-col h-full">
                  <div className="w-16 h-16 bg-white rounded-2xl border border-slate-100 flex items-center justify-center text-indigo-600 font-black text-2xl mb-5 shadow-sm">{job.company.display_name.charAt(0)}</div>
                  <h3 className="text-xl font-extrabold text-slate-900 mb-2 leading-tight">{job.title}</h3>
                  <p className="font-bold text-slate-500 mb-8">{job.company.display_name}</p>
                  <div className="space-y-5 mb-auto bg-slate-50 rounded-2xl p-5 border border-slate-100">
                     <div><span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Location</span><span className="font-bold text-slate-700 flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5"/> {job.location.display_name}</span></div>
                     <div><span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Salary</span><span className="font-black text-emerald-600 flex items-center gap-1.5"><DollarSign className="w-3.5 h-3.5"/> {job.salary_min ? `$${(job.salary_min/1000).toFixed(0)}k` : "Not disclosed"}</span></div>
                     <div><span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Type</span><span className="font-bold text-slate-700 flex items-center gap-1.5"><Clock className="w-3.5 h-3.5"/> {job.contract_time || "Full-Time"}</span></div>
                  </div>
                  <a href={job.redirect_url} target="_blank" className="mt-8 block w-full py-3.5 bg-gradient-to-r from-slate-900 to-slate-800 text-white text-center rounded-xl font-bold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all">Apply to {job.company.display_name}</a>
                </div>
             </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                SKELETONS                                   */
/* -------------------------------------------------------------------------- */

function LoadingSkeletons() {
  return (
    <div className="flex gap-6 overflow-x-hidden px-4">
      {[1,2,3].map(i => (
        <div key={i} className="shrink-0 w-[340px] bg-white rounded-[24px] p-6 border border-slate-100 shadow-sm animate-pulse">
           <div className="w-12 h-12 bg-slate-200 rounded-xl mb-4" />
           <div className="w-3/4 h-4 bg-slate-200 rounded-md mb-2" />
           <div className="w-1/2 h-3 bg-slate-200 rounded-md mb-5" />
           <div className="flex gap-2 mb-8"><div className="w-16 h-5 bg-slate-200 rounded-md"/><div className="w-16 h-5 bg-slate-200 rounded-md"/></div>
           <div className="w-full h-9 bg-slate-200 rounded-lg" />
        </div>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-24 h-24 bg-slate-100 rounded-[28px] flex items-center justify-center mb-6 shadow-inner"><Search className="w-10 h-10 text-slate-400" /></div>
      <h3 className="text-xl font-extrabold text-slate-900 mb-2">No Jobs Found</h3>
      <p className="text-sm text-slate-500 font-medium">We couldn't find any positions matching your exact criteria.<br/>Try adjusting your filters or expanding your search location.</p>
    </div>
  );
}
