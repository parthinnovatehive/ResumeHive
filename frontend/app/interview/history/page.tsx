'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api/client';
import { 
  History, 
  Award, 
  BarChart3, 
  ChevronLeft, 
  Search, 
  Filter, 
  Calendar, 
  MessageSquare, 
  Cpu, 
  Network, 
  Code2, 
  Boxes, 
  Users, 
  Sparkles, 
  ShieldCheck, 
  ShieldAlert, 
  AlertOctagon, 
  ArrowRight, 
  CheckCircle2, 
  Play, 
  Loader2,
  TrendingUp
} from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

interface HistorySession {
  id: number;
  category_id: number;
  category_name: string;
  category_slug: string;
  status: string;
  started_at: string | null;
  completed_at: string | null;
  overall_score: number;
  integrity_status: string;
  tab_switches_count: number;
  summary: string;
  candidate_turns_count: number;
  disqualification_reason?: string | null;
}

const CATEGORY_ICONS: Record<string, any> = {
  'hr-behavioral': MessageSquare,
  'cs-fundamentals': Cpu,
  'resume-deep-dive': Sparkles,
  'system-design': Network,
  'dsa-coding': Code2,
  'low-level-design': Boxes,
  'group-discussion': Users,
};

export default function InterviewHistoryPage() {
  const [sessions, setSessions] = useState<HistorySession[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    if (!token) {
      router.replace(`/login?from=${encodeURIComponent('/interview/history')}`);
      return;
    }

    api.get('/interview/history')
      .then(res => {
        setSessions(res.data);
        setLoading(false);
      })
      .catch((err: any) => {
        if (err?.response?.status === 401) {
          router.replace(`/login?from=${encodeURIComponent('/interview/history')}`);
          return;
        }
        toast("Could not load interview history", "error");
        setLoading(false);
      });
  }, [router, toast]);

  if (loading) {
    return (
      <div className="flex flex-col h-[calc(100vh-72px)] w-full items-center justify-center bg-slate-50 gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
        <p className="text-slate-500 font-medium text-sm">Loading your interview history &amp; reports...</p>
      </div>
    );
  }

  // Calculate summary metrics
  const totalAttempts = sessions.length;
  const completedSessions = sessions.filter(s => s.status === 'completed');
  const totalCompleted = completedSessions.length;
  
  const scores = completedSessions.map(s => s.overall_score || 0);
  const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
  const maxScore = scores.length > 0 ? Math.max(...scores) : 0;

  // Filtering
  const filteredSessions = sessions.filter(s => {
    const matchesSearch = 
      s.category_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.summary.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === 'all' || s.category_slug === selectedCategory;
    
    let matchesStatus = true;
    if (selectedStatus === 'completed') matchesStatus = s.status === 'completed' && s.integrity_status !== 'DISQUALIFIED';
    else if (selectedStatus === 'disqualified') matchesStatus = s.integrity_status === 'DISQUALIFIED';
    else if (selectedStatus === 'in_progress') matchesStatus = s.status === 'in_progress';

    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="min-h-[calc(100vh-72px)] bg-slate-50 relative selection:bg-indigo-500/30 font-sans pb-16">
      {/* Ambient Lighting Background */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <div className="absolute top-0 left-[20%] w-[600px] h-[600px] rounded-full bg-indigo-500/10 blur-[150px] mix-blend-multiply" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-purple-500/10 blur-[150px] mix-blend-multiply" />
      </div>

      <div className="max-w-6xl mx-auto relative z-10 px-6 pt-10">
        
        {/* Header Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <Link 
              href="/interview"
              className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-indigo-600 transition-colors bg-white/70 py-1.5 px-3.5 rounded-full border border-slate-200/60 mb-3 shadow-xs"
            >
              <ChevronLeft size={14} /> Back to Interview Rounds
            </Link>
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
              <History className="w-9 h-9 text-indigo-600" />
              Interview History &amp; Analysis
            </h1>
            <p className="text-slate-600 text-sm md:text-base mt-1">
              Access all your stored AI mock interviews, detailed score breakdowns, and bar-raiser feedback.
            </p>
          </div>

          <Link
            href="/interview"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black text-sm transition-all shadow-lg shadow-indigo-600/30 hover:scale-[1.01]"
          >
            <Play size={16} className="fill-white" />
            <span>Start New Practice Round</span>
          </Link>
        </div>

        {/* Top Metric Cards Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white/80 backdrop-blur-xl border border-white p-5 rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.03)] flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
              <History size={22} />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Total Attempts</span>
              <span className="text-2xl font-black text-slate-900">{totalAttempts}</span>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-xl border border-white p-5 rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.03)] flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
              <CheckCircle2 size={22} />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Completed</span>
              <span className="text-2xl font-black text-slate-900">{totalCompleted}</span>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-xl border border-white p-5 rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.03)] flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0">
              <TrendingUp size={22} />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Average Score</span>
              <span className="text-2xl font-black text-slate-900">{avgScore} <span className="text-xs font-normal text-slate-400">/100</span></span>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-xl border border-white p-5 rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.03)] flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 shrink-0">
              <Award size={22} />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Highest Score</span>
              <span className="text-2xl font-black text-slate-900">{maxScore} <span className="text-xs font-normal text-slate-400">/100</span></span>
            </div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white/90 backdrop-blur-xl border border-white p-4 rounded-3xl shadow-sm mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-80">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by category or keyword..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs md:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Category Select */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2 text-xs font-semibold text-slate-600">
              <Filter size={14} className="text-indigo-600" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-transparent focus:outline-none text-slate-800 cursor-pointer font-bold"
              >
                <option value="all">All Domains</option>
                <option value="hr-behavioral">Behavioral &amp; Leadership</option>
                <option value="cs-fundamentals">Core Computer Science</option>
                <option value="resume-deep-dive">Resume Deep Dive</option>
                <option value="system-design">System Design</option>
                <option value="dsa-coding">DSA &amp; Coding</option>
                <option value="low-level-design">Low Level Design</option>
              </select>
            </div>

            {/* Status Select */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2 text-xs font-semibold text-slate-600">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="bg-transparent focus:outline-none text-slate-800 cursor-pointer font-bold"
              >
                <option value="all">All Statuses</option>
                <option value="completed">Completed</option>
                <option value="disqualified">Disqualified</option>
                <option value="in_progress">In Progress</option>
              </select>
            </div>
          </div>
        </div>

        {/* Sessions Grid */}
        {filteredSessions.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-xl border border-white rounded-3xl p-12 text-center shadow-sm">
            <div className="w-16 h-16 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center mx-auto mb-4 text-indigo-600">
              <History size={32} />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-1">No Past Interviews Found</h3>
            <p className="text-xs md:text-sm text-slate-500 max-w-md mx-auto mb-6">
              {sessions.length === 0
                ? "You haven't completed any mock interview sessions yet. Start your first session to receive stored Bar-Raiser analysis!"
                : "No interview records match your active search or category filters."}
            </p>
            <Link
              href="/interview"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md"
            >
              <Play size={14} className="fill-white" />
              Start Mock Interview
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredSessions.map((s) => {
              const IconComp = CATEGORY_ICONS[s.category_slug] || MessageSquare;
              const isDisqualified = s.integrity_status === 'DISQUALIFIED';
              const isIncomplete = s.overall_score === 0 && !isDisqualified && s.status === 'completed';
              const dateStr = s.completed_at || s.started_at;
              const formattedDate = dateStr 
                ? new Date(dateStr).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                : 'Recent Session';

              let scoreColor = 'text-indigo-600';
              let badgeBg = 'bg-indigo-50 border-indigo-200 text-indigo-700';
              if (isDisqualified || isIncomplete) {
                scoreColor = 'text-rose-600';
                badgeBg = 'bg-rose-50 border-rose-200 text-rose-700';
              } else if (s.overall_score >= 80) {
                scoreColor = 'text-emerald-600';
                badgeBg = 'bg-emerald-50 border-emerald-200 text-emerald-700';
              } else if (s.overall_score >= 60) {
                scoreColor = 'text-amber-600';
                badgeBg = 'bg-amber-50 border-amber-200 text-amber-700';
              }

              return (
                <div 
                  key={s.id}
                  className="bg-white/90 backdrop-blur-xl border border-white p-7 rounded-[28px] shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_50px_rgba(79,70,229,0.1)] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group overflow-hidden relative"
                >
                  {/* Card Top: Icon, Title & Date */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-sm shrink-0">
                          <IconComp size={22} />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                            {s.category_name}
                          </h3>
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5">
                            <Calendar size={12} />
                            <span>{formattedDate}</span>
                          </div>
                        </div>
                      </div>

                      {/* Score Pill */}
                      {s.status === 'completed' && (
                        <div className={`px-3 py-1.5 rounded-2xl border text-center font-black ${badgeBg}`}>
                          <span className={`text-xl leading-none ${scoreColor}`}>{s.overall_score}</span>
                          <span className="text-[9px] uppercase font-bold block opacity-70">/ 100</span>
                        </div>
                      )}
                    </div>

                    {/* Integrity & Status Badges */}
                    <div className="flex flex-wrap items-center gap-2 mb-4">
                      {isDisqualified ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-100 border border-rose-300 text-rose-700 text-[10px] font-black uppercase">
                          <AlertOctagon size={12} /> Disqualified
                        </span>
                      ) : s.status === 'in_progress' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-100 border border-indigo-300 text-indigo-700 text-[10px] font-black uppercase">
                          <Loader2 size={12} className="animate-spin" /> In Progress
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-700 text-[10px] font-black uppercase">
                          <ShieldCheck size={12} /> Authentic Integrity
                        </span>
                      )}

                      <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-600">
                        {s.candidate_turns_count} Answers Given
                      </span>
                    </div>

                    {/* Summary Excerpt */}
                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-3 mb-6 bg-slate-50/70 p-3 rounded-2xl border border-slate-100">
                      {s.summary || "Complete candidate transcript and evaluation report saved in database."}
                    </p>
                  </div>

                  {/* Card Bottom: Action Link */}
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    {s.status === 'completed' ? (
                      <Link
                        href={`/interview/${s.id}/report`}
                        className="w-full flex items-center justify-between py-2 px-4 rounded-xl bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white font-bold text-xs transition-all duration-200 group/btn shadow-xs"
                      >
                        <span>View Detailed Report &amp; Analysis</span>
                        <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                      </Link>
                    ) : (
                      <Link
                        href={`/interview/${s.id}`}
                        className="w-full flex items-center justify-between py-2 px-4 rounded-xl bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white font-bold text-xs transition-all duration-200 group/btn shadow-xs"
                      >
                        <span>Resume Interview Session</span>
                        <Play size={14} className="group-hover/btn:translate-x-1 transition-transform fill-current" />
                      </Link>
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}
