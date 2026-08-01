'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api/client';
import { Bot, ChevronRight, Lock, Loader2, Sparkles, MessageSquare } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

export default function InterviewSelectionPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [startingId, setStartingId] = useState<number | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    api.get('/interview/categories')
      .then(res => {
        setCategories(res.data);
        setLoading(false);
      })
      .catch(err => {
        toast("Could not load categories", "error");
        setLoading(false);
      });
  }, []);

  const handleStart = async (categoryId: number) => {
    setStartingId(categoryId);
    try {
      const res = await api.post('/interview/sessions', { category_id: categoryId });
      router.push(`/interview/${res.data.session_id}`);
    } catch (err) {
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
        <div className="mb-12 text-center md:text-left">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 mb-4 flex items-center justify-center md:justify-start gap-3">
            <Bot className="w-12 h-12 text-indigo-600" />
            AI Mock Interviews
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl">
            Select an interview type below to begin. The AI interviewer will evaluate you and provide a detailed report at the end.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map(cat => (
            <div 
              key={cat.id}
              onClick={() => cat.is_active && !startingId && handleStart(cat.id)}
              className={`relative bg-white/80 backdrop-blur-xl border border-white p-8 rounded-[32px] shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-all duration-300 flex flex-col justify-between overflow-hidden group ${
                cat.is_active 
                  ? 'cursor-pointer hover:shadow-[0_20px_80px_rgba(0,0,0,0.08)] hover:-translate-y-1 hover:border-indigo-100' 
                  : 'opacity-75 cursor-not-allowed grayscale-[20%]'
              }`}
            >
              {!cat.is_active && (
                <div className="absolute top-6 right-6 bg-slate-100 text-slate-500 text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-full flex items-center gap-1.5 border border-slate-200">
                  <Lock size={12}/> Coming Soon
                </div>
              )}
              
              <div>
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-white/50 ${
                  cat.is_active ? 'bg-gradient-to-br from-indigo-50 to-purple-50 text-indigo-600' : 'bg-slate-50 text-slate-400'
                }`}>
                  {cat.slug === 'resume-deep-dive' ? <Sparkles size={24}/> : <MessageSquare size={24}/>}
                </div>
                <h2 className="text-xl font-bold text-slate-800 mb-2">{cat.name}</h2>
                <p className="text-sm text-slate-500 leading-relaxed line-clamp-3">
                  {cat.slug === 'hr-behavioral' && "Practice STAR method responses and behavioral questions."}
                  {cat.slug === 'resume-deep-dive' && "Deep dive into your actual resume, projects, and listed experience."}
                  {cat.slug === 'cs-fundamentals' && "Test your knowledge on OOP, OS, DBMS, and Networking."}
                  {cat.slug === 'system-design' && "High-level architecture and system design discussion."}
                  {cat.slug === 'dsa-coding' && "Verbal problem solving and algorithmic complexity discussion."}
                  {cat.slug === 'low-level-design' && "Object-oriented design patterns and class modeling."}
                  {cat.slug === 'group-discussion' && "Simulated multi-participant debate and discussion format."}
                </p>
              </div>
              
              <div className="mt-8 pt-6 border-t border-slate-100">
                {cat.is_active ? (
                  <div className="flex items-center text-sm font-bold text-indigo-600 group-hover:text-indigo-700 transition-colors">
                    {startingId === cat.id ? (
                      <><Loader2 size={16} className="animate-spin mr-2"/> Starting Session...</>
                    ) : (
                      <>Start Interview <ChevronRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform"/></>
                    )}
                  </div>
                ) : (
                  <div className="text-sm font-bold text-slate-400">Currently Unavailable</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
