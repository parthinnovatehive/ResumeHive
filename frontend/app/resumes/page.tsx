"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { resumesApi } from "@/lib/api/resumes";
import { useToast } from "@/components/ui/Toast";
import type { Resume } from "@/types/resume";
import { motion, AnimatePresence, Variants, useMotionValue, useTransform, animate } from "framer-motion";
import { Plus, FileText, Download, Copy, Trash2, Edit2, Search, Filter, Grid, List, Activity, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

function Counter({ value, prefix = "", suffix = "" }: { value: number, prefix?: string, suffix?: string }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, Math.round);
  const display = useTransform(rounded, (latest) => `${prefix}${latest}${suffix}`);

  useEffect(() => {
    const animation = animate(count, value, { duration: 1.5, type: "spring", bounce: 0.1 });
    return animation.stop;
  }, [value, count]);

  return <motion.span>{display}</motion.span>;
}

const TAGLINES = [
  { text: "Build resumes that open career ", highlight: "opportunities." },
  { text: "Design your future with ", highlight: "confidence." },
  { text: "Create ATS-ready resumes that ", highlight: "stand out." },
  { text: "One resume. ", highlight: "Unlimited opportunities." },
  { text: "Craft professional resumes with ", highlight: "precision." },
  { text: "Turn your skills into ", highlight: "career success." },
  { text: "Build. Improve. ", highlight: "Get Hired." },
  { text: "Your next opportunity ", highlight: "starts here." },
  { text: "Professional resumes for ", highlight: "modern careers." },
  { text: "Create resumes employers ", highlight: "remember." },
  { text: "Smarter resumes. ", highlight: "Better careers." },
  { text: "Transform your experience into ", highlight: "opportunity." },
  { text: "Every great career begins with a ", highlight: "great resume." },
  { text: "Build with confidence. ", highlight: "Apply with impact." },
  { text: "Your career journey starts with ", highlight: "ResumeHive." }
];

function AnimatedTagline() {
  const [index, setIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [phase, setPhase] = useState<"typing" | "paused" | "erasing">("typing");

  useEffect(() => {
    const fullText = TAGLINES[index].text + TAGLINES[index].highlight;
    let timeout: NodeJS.Timeout;

    if (phase === "typing") {
      if (displayedText.length < fullText.length) {
        timeout = setTimeout(() => {
          setDisplayedText(fullText.slice(0, displayedText.length + 1));
        }, 45); // Calm typing speed
      } else {
        timeout = setTimeout(() => setPhase("paused"), 3500);
      }
    } else if (phase === "paused") {
      setPhase("erasing");
    } else if (phase === "erasing") {
      if (displayedText.length > 0) {
        timeout = setTimeout(() => {
          setDisplayedText(fullText.slice(0, displayedText.length - 1));
        }, 25); // Faster, smooth erasing
      } else {
        setPhase("typing");
        setIndex((prev) => (prev + 1) % TAGLINES.length);
      }
    }

    return () => clearTimeout(timeout);
  }, [displayedText, phase, index]);

  const baseText = TAGLINES[index].text;
  const currentBase = displayedText.slice(0, baseText.length);
  const currentHighlight = displayedText.slice(baseText.length);

  return (
    <div className="relative mt-6 mb-2 h-10 flex items-center overflow-visible">
      {/* Extremely soft, large ambient glow */}
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[80%] h-[150%] z-[-1] bg-premium-blue/10 blur-[50px] rounded-full pointer-events-none" />
      
      <motion.p
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="text-[22px] md:text-[26px] lg:text-[28px] font-semibold text-slate-600 leading-tight tracking-[0.01em] absolute left-0 whitespace-nowrap"
      >
        {currentBase}
        <span className="relative inline-block">
          {currentHighlight.length > 0 && (
            <span className="bg-gradient-to-r from-premium-blue to-premium-indigo bg-clip-text text-transparent font-bold drop-shadow-[0_2px_12px_rgba(37,99,235,0.15)] transition-all duration-300">
              {currentHighlight}
            </span>
          )}
          {/* Subtle glow specifically behind the highlighted word */}
          {currentHighlight.length > 0 && (
            <span className="absolute inset-0 bg-premium-blue/15 blur-[16px] rounded-full z-[-1]" />
          )}
          <motion.span
            animate={{ opacity: [1, 0, 1] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
            className="inline-block w-[2px] h-[0.9em] bg-premium-blue/50 align-middle ml-1"
          />
        </span>
      </motion.p>
    </div>
  );
}

export default function ResumesPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const fetchResumes = useCallback(async () => {
    try {
      const data = await resumesApi.list();
      setResumes(data.items);
    } catch {
      toast("Failed to load resumes.", "error");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchResumes();
  }, [fetchResumes]);

  const handleCreate = async () => {
    try {
      const resume = await resumesApi.create();
      toast("Resume created!", "success");
      router.push(`/resume-builder?resume=${resume.id}`);
    } catch {
      toast("Failed to create resume.", "error");
    }
  };

  const handleDuplicate = async (id: number) => {
    setActionId(id);
    try {
      await resumesApi.duplicate(id);
      toast("Resume duplicated!", "success");
      fetchResumes();
    } catch {
      toast("Failed to duplicate resume.", "error");
    } finally {
      setActionId(null);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this resume?")) return;
    setActionId(id);
    try {
      await resumesApi.delete(id);
      toast("Resume deleted.", "success");
      setResumes((prev) => prev.filter((r) => r.id !== id));
    } catch {
      toast("Failed to delete resume.", "error");
    } finally {
      setActionId(null);
    }
  };

  const handleDownload = async (id: number) => {
    setActionId(id);
    try {
      await resumesApi.download(id, "classic");
    } catch {
      toast("Failed to generate PDF.", "error");
    } finally {
      setActionId(null);
    }
  };

  const formatDate = (iso: string) => {
    if (!iso) return "";
    try {
      return new Date(iso).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return iso;
    }
  };

  const filteredResumes = resumes.filter(r => 
    (r.full_name || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const averageAts = resumes.length 
    ? Math.round(resumes.reduce((acc, r) => acc + (r.ats_score || 0), 0) / resumes.filter(r => r.ats_score !== undefined && r.ats_score !== null).length || 1)
    : 0;

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  if (loading) {
    return (
      <main className="mx-auto max-w-[1440px] px-6 lg:px-10 py-12 min-h-screen">
        <div className="animate-shimmer bg-gradient-to-r from-slate-100 via-slate-200 to-slate-100 bg-[length:400%_100%] h-16 w-64 rounded-2xl mb-12"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="animate-shimmer bg-gradient-to-r from-slate-100 via-slate-200 to-slate-100 bg-[length:400%_100%] h-32 rounded-3xl"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-shimmer bg-gradient-to-r from-slate-100 via-slate-200 to-slate-100 bg-[length:400%_100%] h-64 rounded-3xl"></div>
          ))}
        </div>
      </main>
    );
  }

  return (
    <main className="relative mx-auto max-w-[1440px] px-6 lg:px-10 py-12 min-h-screen">
      {/* Background Ambient Lighting */}
      <div className="pointer-events-none absolute -top-40 left-20 w-[500px] h-[500px] rounded-full bg-premium-blue/10 blur-[100px] mix-blend-multiply" />
      <div className="pointer-events-none absolute top-40 right-20 w-[400px] h-[400px] rounded-full bg-premium-purple/10 blur-[100px] mix-blend-multiply" />

      {/* Header Section */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16"
      >
        <div className="relative">
          <div className="absolute -inset-x-6 -inset-y-4 z-[-1] bg-gradient-to-r from-premium-blue/10 to-premium-purple/10 blur-2xl opacity-50 rounded-full" />
          <h1 className="text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 mb-1">My Resumes</h1>
          <AnimatedTagline />
        </div>
        <div className="flex items-center gap-4">
          <motion.button
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="glass-pill px-6 py-3 rounded-full text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
          >
            Import Resume
          </motion.button>
          <motion.button
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleCreate}
            className="group flex items-center gap-2 rounded-full bg-gradient-to-r from-premium-blue to-premium-purple px-6 py-3 text-sm font-medium text-white shadow-premium hover:shadow-premium-hover relative overflow-hidden transition-all duration-300"
          >
            <span className="relative z-10 flex items-center gap-2"><Plus size={18} className="transition-transform group-hover:rotate-90" /> Create Resume</span>
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
          </motion.button>
        </div>
      </motion.div>

      {/* Quick Summary Cards */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16 relative z-10"
      >
        <motion.div variants={itemVariants} whileHover={{ y: -5 }} className="glass-card p-6 rounded-3xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-premium-blue/5 rounded-full blur-2xl -mr-10 -mt-10 transition-transform group-hover:scale-150 duration-500" />
          <div className="flex items-center justify-between mb-4 relative z-10">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Total Resumes</h3>
            <div className="p-2.5 bg-white/60 shadow-sm text-premium-blue rounded-xl backdrop-blur-md group-hover:scale-110 transition-transform duration-300"><FileText size={18} /></div>
          </div>
          <p className="text-4xl font-extrabold text-slate-900 relative z-10"><Counter value={resumes.length} /></p>
        </motion.div>
        
        <motion.div variants={itemVariants} whileHover={{ y: -5 }} className="glass-card p-6 rounded-3xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-premium-emerald/5 rounded-full blur-2xl -mr-10 -mt-10 transition-transform group-hover:scale-150 duration-500" />
          <div className="flex items-center justify-between mb-4 relative z-10">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Avg ATS Score</h3>
            <div className="p-2.5 bg-white/60 shadow-sm text-premium-emerald rounded-xl backdrop-blur-md group-hover:scale-110 transition-transform duration-300"><Activity size={18} /></div>
          </div>
          <p className="text-4xl font-extrabold text-slate-900 relative z-10">
            {isNaN(averageAts) ? "--" : <Counter value={averageAts} suffix="%" />}
          </p>
        </motion.div>

        <motion.div variants={itemVariants} whileHover={{ y: -5 }} className="glass-card p-6 rounded-3xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-premium-purple/5 rounded-full blur-2xl -mr-10 -mt-10 transition-transform group-hover:scale-150 duration-500" />
          <div className="flex items-center justify-between mb-4 relative z-10">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Recently Updated</h3>
            <div className="p-2.5 bg-white/60 shadow-sm text-premium-purple rounded-xl backdrop-blur-md group-hover:scale-110 transition-transform duration-300"><Clock size={18} /></div>
          </div>
          <p className="text-4xl font-extrabold text-slate-900 relative z-10">
            <Counter value={resumes.filter(r => new Date(r.updated_at).getTime() > Date.now() - 7*24*60*60*1000).length} />
          </p>
        </motion.div>

        <motion.div variants={itemVariants} whileHover={{ y: -5 }} className="glass-card p-6 rounded-3xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-premium-amber/5 rounded-full blur-2xl -mr-10 -mt-10 transition-transform group-hover:scale-150 duration-500" />
          <div className="flex items-center justify-between mb-4 relative z-10">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Export Count</h3>
            <div className="p-2.5 bg-white/60 shadow-sm text-premium-amber rounded-xl backdrop-blur-md group-hover:scale-110 transition-transform duration-300"><Download size={18} /></div>
          </div>
          <p className="text-4xl font-extrabold text-slate-900 relative z-10">--</p>
        </motion.div>
      </motion.div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 relative z-10">
        <div className="relative w-full sm:max-w-md group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5 group-focus-within:text-premium-blue transition-colors" />
          <input 
            type="text" 
            placeholder="Search resumes..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-2xl glass-input focus:outline-none focus:ring-2 focus:ring-premium-blue/30 focus:bg-white/80 transition-all duration-300 text-slate-900 placeholder:text-slate-400"
          />
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center glass-pill rounded-2xl p-1">
            <button 
              onClick={() => setViewMode("grid")}
              className={cn("p-2 rounded-xl transition-all duration-300", viewMode === "grid" ? "bg-white text-premium-blue shadow-sm" : "text-slate-400 hover:text-slate-600")}
            >
              <Grid size={18} />
            </button>
            <button 
              onClick={() => setViewMode("list")}
              className={cn("p-2 rounded-xl transition-all duration-300", viewMode === "list" ? "bg-white text-premium-blue shadow-sm" : "text-slate-400 hover:text-slate-600")}
            >
              <List size={18} />
            </button>
          </div>
          <motion.button whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }} className="flex items-center gap-2 glass-pill px-5 py-3 rounded-2xl text-sm font-medium text-slate-600 hover:text-slate-900 hover:shadow-md transition-all">
            <Filter size={18} />
            <span className="hidden sm:inline">Filters</span>
          </motion.button>
        </div>
      </div>

      {/* Resume Grid/List */}
      {filteredResumes.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center py-20 glass-card rounded-3xl relative z-10"
        >
          <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-6 text-premium-blue">
            <FileText size={40} />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">No resumes found</h2>
          <p className="text-slate-500 mb-8 max-w-sm text-center">
            {searchQuery ? "Try adjusting your search terms." : "Start building your professional resume to land your next dream job."}
          </p>
          {!searchQuery && (
            <motion.button
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleCreate}
              className="rounded-full bg-gradient-to-r from-premium-blue to-premium-purple px-8 py-3.5 text-sm font-medium text-white shadow-premium hover:shadow-premium-hover relative overflow-hidden group transition-all duration-300"
            >
              <span className="relative z-10">Create your first resume</span>
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
            </motion.button>
          )}
        </motion.div>
      ) : (
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className={cn(
            "relative z-10",
            viewMode === "grid" 
              ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8" 
              : "flex flex-col gap-4"
          )}
        >
          {filteredResumes.map((r) => (
            <motion.div
              key={r.id}
              variants={itemVariants}
              whileHover={{ y: -6 }}
              className="group flex flex-col justify-between rounded-[32px] glass-card overflow-hidden"
            >
              <div className="p-7">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1 min-w-0 pr-4">
                    <Link
                      href={`/resume-builder?resume=${r.id}`}
                      className="block truncate text-2xl font-bold text-slate-900 group-hover:text-premium-blue transition-colors mb-1.5"
                    >
                      {r.full_name || `Resume #${r.id}`}
                    </Link>
                    <p className="text-sm font-medium text-slate-500 truncate">Software Engineer Template</p>
                  </div>
                  
                  {/* ATS Score Circular Badge */}
                  <div className="shrink-0 flex items-center justify-center w-14 h-14 rounded-full border-4 border-white/60 bg-white/40 shadow-sm relative group-hover:border-premium-blue/20 group-hover:bg-white transition-all duration-500">
                    {r.ats_score !== null && r.ats_score !== undefined ? (
                      <span className={cn(
                        "text-sm font-extrabold",
                        r.ats_score >= 80 ? "text-premium-emerald" : r.ats_score >= 50 ? "text-premium-amber" : "text-premium-red"
                      )}>
                        {r.ats_score}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400 font-medium">--</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 mb-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-lg bg-white/60 border border-white shadow-sm text-xs font-bold text-slate-600 uppercase tracking-widest">
                    Draft
                  </span>
                  <span className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
                    <Clock size={12} />
                    {formatDate(r.updated_at)}
                  </span>
                </div>
              </div>

              <div className="border-t border-slate-200/50 bg-white/30 backdrop-blur-md p-4 flex items-center justify-between gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <Link
                  href={`/resume-builder?resume=${r.id}`}
                  className="flex-1 flex justify-center items-center gap-2 rounded-xl bg-white px-3 py-2.5 text-sm font-medium text-slate-700 hover:text-premium-blue hover:shadow-md transition-all duration-300"
                >
                  <Edit2 size={16} /> Edit
                </Link>
                <button
                  onClick={() => handleDuplicate(r.id)}
                  disabled={actionId === r.id}
                  className="flex-1 flex justify-center items-center gap-2 rounded-xl bg-white px-3 py-2.5 text-sm font-medium text-slate-700 hover:text-premium-purple hover:shadow-md transition-all duration-300 disabled:opacity-50"
                >
                  <Copy size={16} /> Dup
                </button>
                <button
                  onClick={() => handleDownload(r.id)}
                  disabled={actionId === r.id}
                  className="flex-1 flex justify-center items-center gap-2 rounded-xl bg-white px-3 py-2.5 text-sm font-medium text-slate-700 hover:text-premium-emerald hover:shadow-md transition-all duration-300 disabled:opacity-50"
                >
                  <Download size={16} /> PDF
                </button>
                <button
                  onClick={() => handleDelete(r.id)}
                  disabled={actionId === r.id}
                  className="flex justify-center items-center rounded-xl bg-white p-2.5 text-slate-400 hover:text-premium-red hover:bg-red-50 hover:shadow-md transition-all duration-300 disabled:opacity-50"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </main>
  );
}
