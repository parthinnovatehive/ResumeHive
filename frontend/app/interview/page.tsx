'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api/client';
import { 
  Bot, 
  ChevronRight, 
  Lock, 
  Loader2, 
  Sparkles, 
  MessageSquare, 
  Cpu, 
  Network, 
  Code2, 
  Boxes, 
  Users,
  ShieldCheck,
  History
} from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

import PreInterviewLobbyModal from '@/components/interviews/PreInterviewLobbyModal';

interface CategoryMeta {
  icon: any;
  color: string;
  badgeBg: string;
  badgeText: string;
  description: string;
  topics: string[];
}

const CATEGORY_DETAILS: Record<string, CategoryMeta> = {
  'hr-behavioral': {
    icon: MessageSquare,
    color: 'from-amber-500/20 to-orange-500/20 text-amber-600',
    badgeBg: 'bg-amber-50 border-amber-200 text-amber-700',
    badgeText: 'Behavioral & Leadership',
    description: 'Master behavioral and situational questions using the STAR framework, conflict resolution, and leadership scenarios.',
    topics: ['STAR Method', 'Conflict Resolution', 'Leadership', 'Teamwork', 'Culture Fit']
  },
  'cs-fundamentals': {
    icon: Cpu,
    color: 'from-blue-500/20 to-cyan-500/20 text-blue-600',
    badgeBg: 'bg-blue-50 border-blue-200 text-blue-700',
    badgeText: 'Core Computer Science',
    description: 'Rigorous conceptual questioning on Operating Systems, DBMS, Object-Oriented Programming, and Computer Networks.',
    topics: ['OOP & SOLID', 'DBMS & Indexing', 'OS & Concurrency', 'Computer Networks']
  },
  'resume-deep-dive': {
    icon: Sparkles,
    color: 'from-indigo-500/20 to-purple-500/20 text-indigo-600',
    badgeBg: 'bg-indigo-50 border-indigo-200 text-indigo-700',
    badgeText: 'Resume & Project Defense',
    description: 'Deep technical cross-examination anchored directly to your uploaded resume, listed projects, and architecture decisions.',
    topics: ['Resume Projects', 'Tech Stack Choices', 'Bottleneck Resolution', 'Individual Role']
  },
  'system-design': {
    icon: Network,
    color: 'from-emerald-500/20 to-teal-500/20 text-emerald-600',
    badgeBg: 'bg-emerald-50 border-emerald-200 text-emerald-700',
    badgeText: 'Distributed Architecture',
    description: 'High-level system design discussion covering scale estimation, API contracts, caching, sharding, and fault tolerance.',
    topics: ['Scalability', 'Caching & Queues', 'Database Sharding', 'CAP Theorem', 'Load Balancing']
  },
  'dsa-coding': {
    icon: Code2,
    color: 'from-violet-500/20 to-fuchsia-500/20 text-violet-600',
    badgeBg: 'bg-violet-50 border-violet-200 text-violet-700',
    badgeText: 'Algorithmic Problem Solving',
    description: 'Verbal algorithmic problem breakdown, data structures selection, edge cases, and Big-O time/space complexity analysis.',
    topics: ['Data Structures', 'Algorithmic Paradigms', 'Big-O Analysis', 'Edge Cases']
  },
  'low-level-design': {
    icon: Boxes,
    color: 'from-rose-500/20 to-pink-500/20 text-rose-600',
    badgeBg: 'bg-rose-50 border-rose-200 text-rose-700',
    badgeText: 'OOD & Clean Patterns',
    description: 'Class design, object-oriented principles, design patterns (Factory, Strategy, Observer), and modular clean architecture.',
    topics: ['Class Modeling', 'Design Patterns', 'SOLID Principles', 'Interface Design']
  },
  'group-discussion': {
    icon: Users,
    color: 'from-slate-500/20 to-gray-500/20 text-slate-600',
    badgeBg: 'bg-slate-50 border-slate-200 text-slate-700',
    badgeText: 'Multi-Agent Debate',
    description: 'Simulated multi-participant round debating current tech trends and problem scenarios.',
    topics: ['Debate', 'Communication', 'Moderation']
  }
};

export default function InterviewSelectionPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [startingId, setStartingId] = useState<number | null>(null);
  const [selectedCategoryForLobby, setSelectedCategoryForLobby] = useState<any | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    api.get('/interview/categories')
      .then(res => {
        setCategories(res.data);
        setLoading(false);
      })
      .catch((err: any) => {
        if (err?.response?.status !== 401) {
          toast("Could not load categories", "error");
        }
        setLoading(false);
      });
  }, [toast]);

  const handleSelectCategory = (cat: any) => {
    if (startingId !== null || !cat.is_active) return;
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    if (!token) {
      router.push(`/login?from=${encodeURIComponent('/interview')}`);
      return;
    }
    setSelectedCategoryForLobby(cat);
  };

  const handleStartSession = async (categoryId: number) => {
    if (startingId !== null) return;

    setStartingId(categoryId);
    try {
      const res = await api.post('/interview/sessions', { 
        category_id: categoryId
      });
      router.push(`/interview/${res.data.session_id}`);
    } catch (err: any) {
      if (err?.response?.status === 401) {
        router.push(`/login?from=${encodeURIComponent('/interview')}`);
        return;
      }
      toast("Could not start interview. Please try again.", "error");
      setStartingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-72px)] w-full items-center justify-center bg-slate-50">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-72px)] bg-slate-50 relative overflow-hidden selection:bg-indigo-500/30 font-sans p-6 md:p-12">
      {/* Ambient Lighting */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <div className="absolute top-0 left-[20%] w-[600px] h-[600px] rounded-full bg-indigo-500/10 blur-[150px] mix-blend-multiply" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-purple-500/10 blur-[150px] mix-blend-multiply" />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6 text-center md:text-left">
          <div>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold uppercase tracking-wider">
                <ShieldCheck size={14} className="text-indigo-600" />
                AI Mock Interview Suite
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
                Strict Anti-Cheating (No Tab Switching)
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 mb-3 flex items-center justify-center md:justify-start gap-3">
              <Bot className="w-12 h-12 text-indigo-600" />
              AI Mock Interviews
            </h1>
            <p className="text-base md:text-lg text-slate-600 max-w-2xl">
              Select a specialized round below. Interviews are strictly domain-focused and proctored. 
              <strong className="text-slate-800"> Tab switching or window unfocusing is monitored with a 3-strike disqualification rule.</strong>
            </p>
          </div>

          <Link
            href="/interview/history"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-white hover:bg-slate-50 text-indigo-600 border border-indigo-200 text-xs font-extrabold transition-all shadow-sm hover:shadow-md hover:border-indigo-300 shrink-0"
          >
            <History size={16} />
            <span>View Interview History &amp; Reports</span>
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map(cat => {
            const meta = CATEGORY_DETAILS[cat.slug] || {
              icon: MessageSquare,
              color: 'from-indigo-500/20 to-purple-500/20 text-indigo-600',
              badgeBg: 'bg-indigo-50 border-indigo-200 text-indigo-700',
              badgeText: 'Technical Round',
              description: 'Practice targeted interview questions with AI evaluation.',
              topics: []
            };
            const IconComponent = meta.icon;
            const isStarting = startingId === cat.id;

            return (
              <div 
                key={cat.id}
                onClick={() => cat.is_active && !startingId && handleSelectCategory(cat)}
                className={`relative bg-white/90 backdrop-blur-xl border border-white p-7 rounded-[28px] shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-all duration-300 flex flex-col justify-between overflow-hidden group ${
                  cat.is_active 
                    ? 'cursor-pointer hover:shadow-[0_20px_50px_rgba(79,70,229,0.12)] hover:-translate-y-1 hover:border-indigo-200' 
                    : 'opacity-70 cursor-not-allowed grayscale-[20%]'
                }`}
              >
                {!cat.is_active && (
                  <div className="absolute top-5 right-5 bg-slate-100 text-slate-500 text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-full flex items-center gap-1.5 border border-slate-200">
                    <Lock size={12}/> Coming Soon
                  </div>
                )}
                
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br ${meta.color} shadow-sm border border-white/60`}>
                      <IconComponent size={24} />
                    </div>
                    {cat.is_active && (
                      <span className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${meta.badgeBg}`}>
                        {meta.badgeText}
                      </span>
                    )}
                  </div>

                  <h2 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors">
                    {cat.name}
                  </h2>

                  <p className="text-sm text-slate-600 leading-relaxed mb-4">
                    {meta.description}
                  </p>

                  {meta.topics.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {meta.topics.map((t, idx) => (
                        <span key={idx} className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="mt-6 pt-5 border-t border-slate-100">
                  {cat.is_active ? (
                    <div className="flex items-center justify-between text-sm font-bold text-indigo-600 group-hover:text-indigo-700 transition-colors">
                      {isStarting && startingId === cat.id ? (
                        <span className="flex items-center gap-2">
                          <Loader2 size={16} className="animate-spin text-indigo-600"/>
                          Starting Session...
                        </span>
                      ) : (
                        <>
                          <span>Check Hardware &amp; Join</span>
                          <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform"/>
                        </>
                      )}
                    </div>
                  ) : (
                    <div className="text-sm font-bold text-slate-400">Currently Unavailable</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pre-Interview GMeet Setup Modal */}
      {selectedCategoryForLobby && (
        <PreInterviewLobbyModal
          category={selectedCategoryForLobby}
          categoryMeta={
            CATEGORY_DETAILS[selectedCategoryForLobby.slug] || {
              icon: MessageSquare,
              color: 'from-indigo-500/20 to-purple-500/20 text-indigo-600',
              badgeBg: 'bg-indigo-50 border-indigo-200 text-indigo-700',
              badgeText: 'Technical Round',
              description: 'Practice targeted interview questions with AI evaluation.',
              topics: []
            }
          }
          onClose={() => setSelectedCategoryForLobby(null)}
          onConfirmStart={() => handleStartSession(selectedCategoryForLobby.id)}
          isStarting={startingId !== null}
        />
      )}
    </div>
  );
}

