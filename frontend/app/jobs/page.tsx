"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Search, MapPin, ExternalLink, Briefcase, Clock, DollarSign, ChevronLeft, ChevronRight, Loader2, ArrowRight } from "lucide-react";
import { searchJobs, getCountries } from "@/lib/api/jobs";
import type { JobListing, CountryOption, JobSearchParams } from "@/types/job";
import { motion, AnimatePresence } from "framer-motion";

const SORT_OPTIONS = [
  { value: "relevance", label: "Relevance" },
  { value: "date", label: "Date" },
  { value: "salary", label: "Salary" },
] as const;

const JOB_TAGLINES = [
  { text: "Discover careers built for your ", highlight: "future." },
  { text: "Your dream job is one ", highlight: "search away." },
  { text: "Smarter job search. Better ", highlight: "opportunities." },
  { text: "Find companies that value your ", highlight: "skills." },
  { text: "AI-powered career discovery for modern ", highlight: "professionals." },
  { text: "Connect your skills with the right ", highlight: "opportunities." },
  { text: "Explore careers with ", highlight: "confidence." },
  { text: "Build your future one ", highlight: "opportunity at a time." },
  { text: "Discover companies where your talent ", highlight: "belongs." },
  { text: "Find opportunities that match your ", highlight: "ambition." },
  { text: "Your next career move ", highlight: "starts here." },
  { text: "Search smarter. Get hired ", highlight: "faster." },
  { text: "Empower your career with intelligent job ", highlight: "discovery." },
  { text: "Unlock opportunities with ", highlight: "ResumeHive." },
];

function AnimatedJobsHero() {
  const [index, setIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [phase, setPhase] = useState<"typing" | "paused" | "erasing" | "crossfade">("typing");

  useEffect(() => {
    const fullText = JOB_TAGLINES[index].text + JOB_TAGLINES[index].highlight;
    let timeout: NodeJS.Timeout;

    if (phase === "typing") {
      if (displayedText.length < fullText.length) {
        timeout = setTimeout(() => {
          setDisplayedText(fullText.slice(0, displayedText.length + 1));
        }, 45);
      } else {
        timeout = setTimeout(() => setPhase("paused"), 3500);
      }
    } else if (phase === "paused") {
      setPhase("erasing");
    } else if (phase === "erasing") {
      if (displayedText.length > 0) {
        timeout = setTimeout(() => {
          setDisplayedText(fullText.slice(0, displayedText.length - 1));
        }, 25);
      } else {
        setPhase("crossfade");
      }
    } else if (phase === "crossfade") {
      timeout = setTimeout(() => {
        setPhase("typing");
        setIndex((prev) => (prev + 1) % JOB_TAGLINES.length);
      }, 500);
    }
    return () => clearTimeout(timeout);
  }, [displayedText, phase, index]);

  const baseText = JOB_TAGLINES[index].text;
  const currentBase = displayedText.slice(0, baseText.length);
  const currentHighlight = displayedText.slice(baseText.length);

  return (
    <div className="relative mb-12 flex flex-col items-center justify-center text-center w-full pt-8">
      {/* Ambient Atmospheric Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[300px] bg-premium-blue/10 blur-[100px] rounded-[100%] pointer-events-none z-[-1]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[200px] bg-premium-purple/10 blur-[120px] rounded-[100%] pointer-events-none z-[-1]" style={{ animationDelay: "2s" }} />

      <motion.h1 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight mb-6 drop-shadow-sm"
      >
        Job Search
      </motion.h1>
      
      <div className="min-h-[48px] md:min-h-[56px] flex items-center justify-center w-full max-w-3xl mx-auto">
        <motion.p
          initial={{ opacity: 0, y: 5 }}
          animate={{ 
            opacity: phase === "crossfade" ? 0 : 1, 
            y: phase === "crossfade" ? -2 : 0,
            filter: phase === "crossfade" ? "blur(4px)" : "blur(0px)"
          }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="text-[18px] md:text-[22px] lg:text-[26px] font-semibold text-slate-600 leading-snug tracking-[0.01em]"
        >
          {currentBase}
          <span className="relative inline-block">
            {currentHighlight.length > 0 && (
              <span className="bg-gradient-to-r from-premium-blue to-premium-indigo bg-clip-text text-transparent font-bold drop-shadow-[0_2px_12px_rgba(37,99,235,0.15)] transition-all duration-300">
                {currentHighlight}
              </span>
            )}
            {currentHighlight.length > 0 && (
              <span className="absolute inset-0 bg-premium-blue/15 blur-[16px] rounded-full z-[-1]" />
            )}
            <motion.span
              animate={{ opacity: phase === "crossfade" ? 0 : [1, 0, 1] }}
              transition={{ repeat: phase === "crossfade" ? 0 : Infinity, duration: 1.5, ease: "easeInOut" }}
              className="inline-block w-[2px] h-[0.9em] bg-premium-blue/50 align-middle ml-1 transition-opacity duration-300"
            />
          </span>
        </motion.p>
      </div>
    </div>
  );
}

export default function JobsPage() {
  const [countries, setCountries] = useState<CountryOption[]>([]);
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [what, setWhat] = useState("");
  const [where, setWhere] = useState("");
  const [country, setCountry] = useState("in");
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<JobSearchParams["sort_by"]>("relevance");
  const [salaryMin, setSalaryMin] = useState("");
  const [fullTimeOnly, setFullTimeOnly] = useState(false);
  const [permanentOnly, setPermanentOnly] = useState(false);

  const resultsPerPage = 20;
  const totalPages = Math.ceil(totalCount / resultsPerPage);

  useEffect(() => {
    getCountries()
      .then(setCountries)
      .catch(() => setCountries([{ code: "in", name: "India" }]));

    setLoading(true);
    searchJobs({ what: "software developer", country: "in", sort_by: "date", results_per_page: 20 })
      .then((res) => { setJobs(res.results); setTotalCount(res.count); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const doSearch = useCallback(async (p: number) => {
    if (!what.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await searchJobs({
        what: what.trim(),
        where: where.trim() || undefined,
        country,
        page: p,
        results_per_page: resultsPerPage,
        sort_by: sortBy,
        salary_min: salaryMin ? Number(salaryMin) : undefined,
        full_time: fullTimeOnly || undefined,
        permanent: permanentOnly || undefined,
      });
      setJobs(res.results);
      setTotalCount(res.count);
      setPage(p);
    } catch (err: any) {
      const msg = err?.response?.data?.detail || err?.message || "Failed to fetch jobs";
      setError(msg);
      setJobs([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [what, where, country, sortBy, salaryMin, fullTimeOnly, permanentOnly]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    doSearch(1);
  };

  const formatSalary = (min: number | null, max: number | null) => {
    const hasMin = min && min > 0;
    const hasMax = max && max > 0;
    if (!hasMin && !hasMax) return null;
    const fmt = (n: number) => {
      if (n >= 1000) return `${Math.round(n / 1000)}k`;
      return String(n);
    };
    if (hasMin && hasMax) return `${fmt(min!)} - ${fmt(max!)}`;
    if (hasMin) return `From ${fmt(min!)}`;
    return `Up to ${fmt(max!)}`;
  };

  const timeAgo = (dateStr: string) => {
    if (!dateStr) return "";
    const diff = Date.now() - new Date(dateStr).getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days}d ago`;
    if (days < 30) return `${Math.floor(days / 7)}w ago`;
    return `${Math.floor(days / 30)}mo ago`;
  };

  return (
    <div className="relative min-h-screen pb-16 overflow-hidden">
      {/* Core Background Ambience */}
      <div className="fixed inset-0 z-[-2] bg-slate-50" />
      <div className="fixed top-[-20%] right-[-10%] w-[800px] h-[800px] rounded-full bg-premium-blue/5 blur-[150px] mix-blend-multiply pointer-events-none z-[-1]" />
      <div className="fixed bottom-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-premium-emerald/5 blur-[120px] mix-blend-multiply pointer-events-none z-[-1]" />

      <div className="mx-auto max-w-5xl px-4 pt-12">
        
        <AnimatedJobsHero />

        <motion.form 
          onSubmit={handleSubmit} 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
          className="mb-10 rounded-2xl border border-white/80 bg-white/60 p-5 shadow-[0_8px_40px_rgba(0,0,0,0.04)] backdrop-blur-2xl hover:shadow-[0_12px_50px_rgba(37,99,235,0.06)] hover:border-white transition-all duration-500 relative z-10"
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <motion.div whileTap={{ scale: 0.99 }} className="relative md:col-span-2 group">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-premium-blue transition-colors duration-300" />
              <input
                type="text"
                placeholder="Job title or keywords (e.g. software developer)"
                value={what}
                onChange={(e) => setWhat(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white/50 py-3 pl-11 pr-4 text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:border-premium-blue/50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-premium-blue/10 transition-all duration-300 shadow-sm"
                required
              />
            </motion.div>
            <motion.div whileTap={{ scale: 0.99 }} className="relative group">
              <MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-premium-purple transition-colors duration-300" />
              <input
                type="text"
                placeholder="Location"
                value={where}
                onChange={(e) => setWhere(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white/50 py-3 pl-11 pr-4 text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:border-premium-purple/50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-premium-purple/10 transition-all duration-300 shadow-sm"
              />
            </motion.div>
            <motion.select
              whileTap={{ scale: 0.99 }}
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white/50 px-4 py-3 text-sm font-medium text-slate-700 focus:border-premium-blue/50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-premium-blue/10 transition-all duration-300 shadow-sm cursor-pointer appearance-none"
            >
              {countries.map((c) => (
                <option key={c.code} value={c.code}>{c.name}</option>
              ))}
            </motion.select>
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-4 border-t border-slate-100/50 pt-4">
            <div className="flex flex-wrap items-center gap-4">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="rounded-lg border border-slate-200 bg-white/50 px-3 py-2 text-xs font-medium text-slate-600 focus:border-premium-blue/40 focus:outline-none focus:ring-2 focus:ring-premium-blue/10 transition-all cursor-pointer hover:bg-white"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>

              <input
                type="number"
                placeholder="Min salary"
                value={salaryMin}
                onChange={(e) => setSalaryMin(e.target.value)}
                className="w-32 rounded-lg border border-slate-200 bg-white/50 px-3 py-2 text-xs font-medium text-slate-600 focus:border-premium-emerald/40 focus:outline-none focus:ring-2 focus:ring-premium-emerald/10 transition-all hover:bg-white placeholder:text-slate-400"
              />

              <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 cursor-pointer group">
                <div className="relative flex items-center justify-center">
                  <input
                    type="checkbox"
                    checked={fullTimeOnly}
                    onChange={(e) => setFullTimeOnly(e.target.checked)}
                    className="peer sr-only"
                  />
                  <div className="w-4 h-4 rounded border-2 border-slate-300 bg-white peer-checked:border-premium-blue peer-checked:bg-premium-blue transition-all" />
                  <div className="absolute inset-0 flex items-center justify-center text-white opacity-0 peer-checked:opacity-100 transition-opacity">
                    <svg viewBox="0 0 24 24" fill="none" className="w-3 h-3" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                  </div>
                </div>
                <span className="group-hover:text-slate-900 transition-colors">Full-time</span>
              </label>

              <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 cursor-pointer group">
                <div className="relative flex items-center justify-center">
                  <input
                    type="checkbox"
                    checked={permanentOnly}
                    onChange={(e) => setPermanentOnly(e.target.checked)}
                    className="peer sr-only"
                  />
                  <div className="w-4 h-4 rounded border-2 border-slate-300 bg-white peer-checked:border-premium-purple peer-checked:bg-premium-purple transition-all" />
                  <div className="absolute inset-0 flex items-center justify-center text-white opacity-0 peer-checked:opacity-100 transition-opacity">
                    <svg viewBox="0 0 24 24" fill="none" className="w-3 h-3" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                  </div>
                </div>
                <span className="group-hover:text-slate-900 transition-colors">Permanent</span>
              </label>
            </div>

            <motion.button
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading || !what.trim()}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-premium-blue to-premium-purple px-6 py-2.5 text-sm font-bold text-white shadow-[0_4px_14px_rgba(37,99,235,0.25)] hover:shadow-[0_6px_20px_rgba(37,99,235,0.4)] disabled:opacity-50 transition-all duration-300"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  Search Jobs
                  <Search size={16} />
                </>
              )}
            </motion.button>
          </div>
        </motion.form>

        <AnimatePresence mode="wait">
          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-8 overflow-hidden"
            >
              <div className="rounded-xl border border-red-200/50 bg-red-50/80 p-4 text-sm font-medium text-red-700 backdrop-blur-md">
                {error}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {!loading && jobs.length === 0 && !error && what.trim() && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="py-16 text-center"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
              <Search size={24} className="text-slate-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-1">No jobs found</h3>
            <p className="text-sm text-slate-500">Try adjusting your keywords or removing some filters.</p>
          </motion.div>
        )}

        {!loading && jobs.length === 0 && !error && !what.trim() && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="py-24 text-center"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-white to-slate-50 shadow-sm border border-slate-100 mb-6 relative">
              <Briefcase size={32} className="text-slate-300" />
              <div className="absolute top-0 right-0 w-4 h-4 bg-premium-emerald rounded-full border-2 border-white animate-pulse" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Ready for your next opportunity?</h3>
            <p className="text-base text-slate-500 max-w-md mx-auto">Enter a job title or keyword above to discover premium opportunities tailored to your skills.</p>
          </motion.div>
        )}

        {jobs.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-slate-800">Latest Opportunities</h2>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 bg-white/60 px-3 py-1 rounded-full border border-slate-200/60 backdrop-blur-sm">
                {totalCount.toLocaleString()} Matches
              </p>
            </div>

            <motion.div 
              className="space-y-4"
              initial="hidden"
              animate="show"
              variants={{
                hidden: { opacity: 0 },
                show: {
                  opacity: 1,
                  transition: { staggerChildren: 0.05 }
                }
              }}
            >
              {jobs.map((job) => (
                <motion.div
                  key={job.id}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 400, damping: 30 } }
                  }}
                  whileHover={{ y: -4, scale: 1.005 }}
                  className="group relative rounded-2xl border border-white/60 bg-white/70 p-6 shadow-[0_4px_20px_rgba(0,0,0,0.02)] backdrop-blur-xl transition-all duration-300 hover:shadow-[0_12px_30px_rgba(37,99,235,0.08)] hover:border-premium-blue/20"
                >
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-lg font-bold text-slate-900 group-hover:text-premium-blue transition-colors">
                          {job.title}
                        </h3>
                      </div>
                      <p className="text-sm font-semibold text-slate-500 mb-4">{job.company.display_name}</p>

                      <div className="flex flex-wrap items-center gap-2 mb-4">
                        <span className="flex items-center gap-1.5 rounded-full bg-slate-100/80 px-2.5 py-1 text-[11px] font-semibold text-slate-600 border border-slate-200/50 backdrop-blur-sm">
                          <MapPin size={12} className="text-slate-400" />
                          {job.location.display_name || job.location.area[job.location.area.length - 1] || "Remote"}
                        </span>

                        <span className="flex items-center gap-1.5 rounded-full bg-emerald-50/80 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 border border-emerald-100 backdrop-blur-sm">
                          <DollarSign size={12} className="text-emerald-500" />
                          {formatSalary(job.salary_min, job.salary_max) || "Competitive"}
                        </span>

                        {job.contract_time && (
                          <span className="flex items-center gap-1.5 rounded-full bg-blue-50/80 px-2.5 py-1 text-[11px] font-semibold text-blue-700 border border-blue-100 backdrop-blur-sm capitalize">
                            <Clock size={12} className="text-blue-500" />
                            {job.contract_time.replace("_", " ")}
                          </span>
                        )}

                        {job.contract_type && (
                          <span className="rounded-full bg-purple-50/80 px-2.5 py-1 text-[11px] font-semibold text-purple-700 border border-purple-100 backdrop-blur-sm capitalize">
                            {job.contract_type}
                          </span>
                        )}

                        {job.category && (
                          <span className="rounded-full bg-indigo-50/80 px-2.5 py-1 text-[11px] font-semibold text-indigo-700 border border-indigo-100 backdrop-blur-sm">
                            {job.category.label}
                          </span>
                        )}
                        
                        <span className="text-[11px] font-medium text-slate-400 ml-auto flex items-center">
                          {timeAgo(job.created)}
                        </span>
                      </div>

                      <p
                        className="line-clamp-2 text-sm leading-relaxed text-slate-500"
                        dangerouslySetInnerHTML={{ __html: job.description }}
                      />
                    </div>

                    <div className="shrink-0 pt-1">
                      <a
                        href={job.redirect_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group/btn inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 py-2.5 text-sm font-bold text-white shadow-md transition-all hover:bg-premium-blue hover:shadow-lg hover:-translate-y-0.5 active:scale-95"
                      >
                        Apply Now
                        <ArrowRight size={14} className="transition-transform group-hover/btn:translate-x-1" />
                      </a>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {totalPages > 1 && (
              <div className="mt-10 flex items-center justify-center gap-4">
                <button
                  onClick={() => doSearch(page - 1)}
                  disabled={page <= 1 || loading}
                  className="flex items-center justify-center w-10 h-10 rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition-all hover:bg-slate-50 hover:border-slate-300 disabled:opacity-40 disabled:hover:bg-white"
                >
                  <ChevronLeft size={16} />
                </button>
                <div className="flex items-center px-4 py-2 rounded-full bg-white/60 border border-slate-200/60 backdrop-blur-sm shadow-sm">
                  <span className="text-sm font-semibold text-slate-600">
                    Page <span className="text-slate-900">{page}</span> of {totalPages}
                  </span>
                </div>
                <button
                  onClick={() => doSearch(page + 1)}
                  disabled={page >= totalPages || loading}
                  className="flex items-center justify-center w-10 h-10 rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition-all hover:bg-slate-50 hover:border-slate-300 disabled:opacity-40 disabled:hover:bg-white"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
