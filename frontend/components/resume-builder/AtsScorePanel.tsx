"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronDown, CheckCircle, FileText, Target, Zap, AlertCircle } from "lucide-react";
import type { AtsScoreResult } from "@/lib/api/resumes";

interface Props {
  isOpen: boolean;
  result: AtsScoreResult | null;
  onClose?: () => void;
  onScoreWithJd?: (jdText: string | null) => Promise<void>;
  jdScoring?: boolean;
  onAddSkill?: (skill: string) => void;
  onTailor?: (jdText: string) => Promise<void>;
  initialJd?: string;
}

const CATEGORY_LABELS: Record<string, string> = {
  format: "Format & Structure",
  contact: "Contact Info",
  keywords: "Keywords",
  achievements: "Achievements",
  length: "Length",
  education: "Education",
  jd_match: "Job Description Match",
};

function scoreColor(pct: number): string {
  if (pct >= 80) return "text-green-500";
  if (pct >= 50) return "text-amber-500";
  return "text-red-500";
}

function barGradient(pct: number): string {
  if (pct >= 80) return "from-green-400 to-emerald-500";
  if (pct >= 50) return "from-amber-400 to-orange-500";
  return "from-red-400 to-rose-500";
}

function strokeColor(pct: number): string {
  if (pct >= 80) return "#10b981";
  if (pct >= 50) return "#f59e0b";
  return "#ef4444";
}

export function AtsScorePanel({
  isOpen,
  result,
  onClose,
  onScoreWithJd,
  jdScoring,
  onAddSkill,
  onTailor,
  initialJd,
}: Props) {
  const [jdText, setJdText] = useState(initialJd ?? "");
  const [jdOpen, setJdOpen] = useState(!!initialJd);
  const [tailoring, setTailoring] = useState(false);
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    if (!result) return;
    let start = 0;
    const end = result.score;
    if (start === end) {
      setDisplayScore(end);
      return;
    }
    const totalDuration = 1500;
    const incrementTime = totalDuration / end;
    const timer = setInterval(() => {
      start += 1;
      setDisplayScore(start);
      if (start === end) clearInterval(timer);
    }, incrementTime);
    return () => clearInterval(timer);
  }, [result?.score, isOpen]);

  const handleMatchJd = async () => {
    if (!onScoreWithJd || !jdText.trim()) return;
    await onScoreWithJd(jdText);
  };

  const handleClearJd = async () => {
    setJdText("");
    if (onScoreWithJd && result?.jd_match) await onScoreWithJd(null);
  };

  const handleTailor = async () => {
    if (!onTailor || !jdText.trim()) return;
    setTailoring(true);
    try {
      await onTailor(jdText);
    } finally {
      setTailoring(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && result && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 sm:p-6"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: "spring", bounce: 0.4, duration: 0.8 }}
            className="relative w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Top Gradient Bar */}
            <div className="h-2 w-full bg-gradient-to-r from-premium-blue via-purple-500 to-premium-purple" />

            {/* Close Button */}
            {onClose && (
              <button
                onClick={onClose}
                className="absolute right-4 top-6 rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors z-10"
              >
                <X className="h-6 w-6" />
              </button>
            )}

            <div className="p-6 sm:p-10 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-10">
              
              {/* Left Column: Core Score & Breakdown */}
              <div className="lg:col-span-5 flex flex-col items-center lg:items-start">
                <div className="text-center lg:text-left w-full">
                  <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight flex items-center justify-center lg:justify-start gap-2">
                    <Target className="h-8 w-8 text-premium-blue" /> ATS Score
                  </h2>
                  <p className="text-slate-500 mt-2 font-medium">How well your resume performs against Applicant Tracking Systems.</p>
                </div>

                {/* Animated Radial Chart */}
                <div className="relative mt-8 flex items-center justify-center">
                  <svg width="180" height="180" className="transform -rotate-90">
                    <circle
                      cx="90"
                      cy="90"
                      r={60}
                      fill="transparent"
                      stroke="#f1f5f9"
                      strokeWidth="14"
                    />
                    <motion.circle
                      cx="90"
                      cy="90"
                      r={60}
                      fill="transparent"
                      stroke={strokeColor(result.score)}
                      strokeWidth="14"
                      strokeLinecap="round"
                      strokeDasharray={2 * Math.PI * 60}
                      initial={{ strokeDashoffset: 2 * Math.PI * 60 }}
                      animate={{ strokeDashoffset: (2 * Math.PI * 60) - (result.score / 100) * (2 * Math.PI * 60) }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center justify-center">
                    <span className={`text-5xl font-black tracking-tighter ${scoreColor(result.score)}`}>
                      {displayScore}
                    </span>
                    <span className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">/ 100</span>
                  </div>
                </div>

                {/* Breakdown Bars */}
                {result.breakdown && (
                  <div className="w-full mt-10 space-y-5">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-2">Category Breakdown</h3>
                    {(Object.entries(result.breakdown) as [string, number][]).map(([cat, val], idx) => {
                      if (cat === "jd_match") return null;
                      const catMax = result.max[cat as keyof typeof result.max] ?? 1;
                      const pct = catMax > 0 ? Math.round((val / catMax) * 100) : 0;
                      return (
                        <motion.div 
                          key={cat}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.2 + idx * 0.1 }}
                        >
                          <div className="flex justify-between text-sm mb-1.5">
                            <span className="font-semibold text-slate-700">{CATEGORY_LABELS[cat] ?? cat}</span>
                            <span className="font-bold text-slate-500">{val}/{catMax}</span>
                          </div>
                          <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden shadow-inner">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${pct}%` }}
                              transition={{ duration: 1, delay: 0.3 + idx * 0.1, ease: "easeOut" }}
                              className={`h-full rounded-full bg-gradient-to-r ${barGradient(pct)}`}
                            />
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Right Column: JD Match & Insights */}
              <div className="lg:col-span-7 flex flex-col gap-6">
                
                {/* JD Match Card */}
                {onScoreWithJd && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="rounded-2xl border border-blue-100 bg-blue-50/30 p-6 shadow-sm relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 p-3 opacity-10 pointer-events-none">
                      <Zap className="w-32 h-32 text-blue-600" />
                    </div>
                    
                    <button
                      onClick={() => setJdOpen(!jdOpen)}
                      className="flex w-full items-center justify-between text-left group relative z-10"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600 group-hover:scale-110 transition-transform">
                          <FileText className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-800 text-lg group-hover:text-blue-700 transition-colors">
                            {result.jd_match ? "Job Description Match" : "Tailor to a Job"}
                          </h3>
                          <p className="text-xs text-slate-500 mt-0.5">Paste a JD to reveal missing keywords.</p>
                        </div>
                      </div>
                      <ChevronDown className={`h-5 w-5 text-slate-400 transition-transform duration-300 ${jdOpen ? "rotate-180" : ""}`} />
                    </button>

                    <AnimatePresence>
                      {jdOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden relative z-10"
                        >
                          <div className="pt-5">
                            <textarea
                              value={jdText}
                              onChange={(e) => setJdText(e.target.value)}
                              rows={4}
                              maxLength={20000}
                              placeholder="Paste the full job description here..."
                              className="w-full rounded-xl border border-slate-200 bg-white/80 p-4 text-sm text-slate-700 placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all shadow-inner resize-none"
                            />
                            <div className="mt-4 flex gap-3">
                              <button
                                onClick={handleMatchJd}
                                disabled={jdScoring || !jdText.trim()}
                                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-blue-200 hover:bg-blue-700 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:hover:translate-y-0"
                              >
                                {jdScoring ? <span className="animate-pulse">Analyzing...</span> : "Match Keywords"}
                              </button>
                              {result.jd_match && (
                                <button
                                  onClick={handleClearJd}
                                  disabled={jdScoring}
                                  className="px-5 rounded-xl border-2 border-slate-200 bg-white text-sm font-bold text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all"
                                >
                                  Clear
                                </button>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Results */}
                    {result.jd_match && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-6 pt-6 border-t border-blue-100 relative z-10"
                      >
                        <div className="flex items-center gap-4 mb-6">
                          <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-sm border border-slate-100">
                            <svg width="64" height="64" className="absolute transform -rotate-90">
                              <circle cx="32" cy="32" r="28" fill="transparent" stroke="#f1f5f9" strokeWidth="4" />
                              <motion.circle cx="32" cy="32" r="28" fill="transparent" stroke={strokeColor(result.jd_match.match_pct)} strokeWidth="4" strokeLinecap="round" strokeDasharray={2 * Math.PI * 28} strokeDashoffset={(2 * Math.PI * 28) - (result.jd_match.match_pct / 100) * (2 * Math.PI * 28)} transition={{ duration: 1 }} />
                            </svg>
                            <span className={`text-lg font-black ${scoreColor(result.jd_match.match_pct)}`}>{result.jd_match.match_pct}%</span>
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-800">Match Rate</h4>
                            <p className="text-xs text-slate-500">of the top requested skills found in your resume</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                          {/* Found */}
                          <div>
                            <h5 className="text-xs font-bold uppercase tracking-wider text-green-700 mb-3 flex items-center gap-1.5">
                              <CheckCircle className="h-4 w-4" /> Found
                            </h5>
                            <div className="flex flex-wrap gap-1.5">
                              {result.jd_match.matched_keywords.length > 0 ? result.jd_match.matched_keywords.map((kw) => (
                                <span key={kw} className="rounded-lg bg-green-100/80 px-2.5 py-1 text-[11px] font-bold text-green-800 border border-green-200/50">
                                  {kw}
                                </span>
                              )) : <span className="text-xs text-slate-400">No matching keywords found.</span>}
                            </div>
                          </div>
                          {/* Missing */}
                          <div>
                            <h5 className="text-xs font-bold uppercase tracking-wider text-red-700 mb-3 flex items-center gap-1.5">
                              <AlertCircle className="h-4 w-4" /> Missing
                            </h5>
                            <div className="flex flex-wrap gap-1.5">
                              {result.jd_match.missing_keywords.length > 0 ? result.jd_match.missing_keywords.map((mk) => (
                                <button
                                  key={mk.keyword}
                                  onClick={() => onAddSkill && onAddSkill(mk.keyword)}
                                  className="group flex items-center gap-1.5 rounded-lg bg-white px-2.5 py-1 text-[11px] font-bold text-slate-600 border border-red-100 shadow-sm hover:border-red-300 hover:shadow transition-all"
                                  title="Click to add to Skills"
                                >
                                  {mk.keyword}
                                  {onAddSkill && <span className="opacity-0 group-hover:opacity-100 text-green-600 ml-0.5 transition-opacity">+</span>}
                                </button>
                              )) : <span className="text-xs text-slate-400">All key skills included!</span>}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                )}

                {/* Suggestions */}
                {result.suggestions && result.suggestions.length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-slate-50 rounded-2xl p-6 border border-slate-100"
                  >
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4">Improvement Suggestions</h3>
                    <ul className="space-y-3">
                      {result.suggestions.map((sug, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm text-slate-700 bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                          <div className="mt-1 w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                          <span className="leading-relaxed font-medium">{sug}</span>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
