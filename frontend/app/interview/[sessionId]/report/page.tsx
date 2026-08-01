'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api/client';
import { Award, BarChart3, ChevronLeft, Target, TrendingUp, Loader2, Sparkles } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

export default function InterviewReportPage({ params }: { params: { sessionId: string } }) {
  const [session, setSession] = useState<any>(null);
  const [progress, setProgress] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    Promise.all([
        api.get(`/interview/sessions/${params.sessionId}`),
        api.get(`/interview/progress`)
    ])
      .then(([sessionRes, progressRes]) => {
        if (sessionRes.data.status !== 'completed' || !sessionRes.data.report) {
          toast("Report not ready yet", "error");
          router.push(`/interview/${params.sessionId}`);
        } else {
          setSession(sessionRes.data);
          setProgress(progressRes.data);
          setLoading(false);
        }
      })
      .catch(() => {
        toast("Session not found", "error");
        router.push('/interview');
      });
  }, [params.sessionId, router, toast]);

  if (loading) {
    return (
      <div className="flex flex-col h-[calc(100vh-72px)] w-full items-center justify-center bg-slate-50 gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
        <p className="text-slate-500 font-medium">Generating your interview report...</p>
      </div>
    );
  }

  const report = session.report || {};
  const score = report.overall_score || 0;
  let scoreColor = 'text-rose-500';
  if (score >= 80) scoreColor = 'text-emerald-500';
  else if (score >= 60) scoreColor = 'text-amber-500';
  
  // Find previous attempt in this category
  let prevScore = null;
  if (progress && session.category_id) {
     const catProgress = progress.find((p: any) => p.attempts.some((a:any) => a.session_id === session.id));
     if (catProgress) {
        const attempts = catProgress.attempts.sort((a:any, b:any) => new Date(a.date).getTime() - new Date(b.date).getTime());
        const currIdx = attempts.findIndex((a:any) => a.session_id === session.id);
        if (currIdx > 0) {
            prevScore = attempts[currIdx - 1].overall_score;
        }
     }
  }

  return (
    <div className="min-h-[calc(100vh-72px)] bg-slate-50 relative selection:bg-indigo-500/30 font-sans pb-12">
      {/* Ambient Lighting */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <div className="absolute top-0 left-[20%] w-[600px] h-[600px] rounded-full bg-indigo-500/10 blur-[150px] mix-blend-multiply" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-purple-500/10 blur-[150px] mix-blend-multiply" />
      </div>

      <div className="max-w-5xl mx-auto relative z-10 px-6 pt-10">
        <button 
          onClick={() => router.push('/interview')}
          className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors mb-8 bg-white/50 py-2 px-4 rounded-full border border-slate-200/50 w-fit"
        >
          <ChevronLeft size={16} /> Back to Interviews
        </button>

        {/* Top Section: Score & Summary */}
        <div className="bg-white/80 backdrop-blur-xl border border-white p-8 md:p-10 rounded-[32px] shadow-[0_8px_30px_rgba(0,0,0,0.04)] mb-8 flex flex-col md:flex-row gap-10 items-center md:items-start">
          <div className="shrink-0 flex flex-col items-center justify-center">
            <div className="relative w-40 h-40 flex items-center justify-center bg-slate-50 rounded-full border-8 border-slate-100 shadow-inner">
              <span className={`text-5xl font-extrabold tracking-tighter ${scoreColor}`}>
                {score}
              </span>
              <span className="absolute bottom-6 text-slate-400 text-xs font-bold uppercase tracking-widest">/ 100</span>
            </div>
            <h2 className="text-lg font-bold text-slate-800 mt-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-indigo-500"/> Overall Score
            </h2>
            {prevScore !== null && (
                <div className={`mt-2 text-sm font-bold flex items-center gap-1 ${score > prevScore ? 'text-emerald-600' : score < prevScore ? 'text-rose-600' : 'text-slate-500'}`}>
                    {score > prevScore ? <TrendingUp size={16}/> : score < prevScore ? <TrendingUp size={16} className="rotate-180"/> : null}
                    {score > prevScore ? 'Up' : score < prevScore ? 'Down' : 'No change'} from {prevScore} last attempt
                </div>
            )}
          </div>

          <div className="flex-1">
            <h3 className="text-xl font-extrabold text-slate-900 mb-3 flex items-center gap-2">
              <Sparkles className="text-indigo-500"/> Interview Summary
            </h3>
            <p className="text-slate-600 leading-relaxed text-[15px]">
              {report.summary}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
              {Object.entries(report.parameters || {}).map(([key, data]: [string, any]) => (
                <div key={key} className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{key.replace(/_/g, ' ')}</span>
                    <span className="text-sm font-extrabold text-slate-800">{data.score}/100</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-1.5 mb-3">
                    <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: `${data.score}%` }}></div>
                  </div>
                  <p className="text-xs text-slate-500 leading-snug">{data.feedback}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Section: Strengths & Improvements */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Strengths */}
          <div className="bg-white/80 backdrop-blur-xl border border-white p-8 rounded-[32px] shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
            <h3 className="text-lg font-extrabold text-emerald-600 mb-6 flex items-center gap-2">
              <TrendingUp className="w-5 h-5"/> Key Strengths
            </h3>
            <ul className="space-y-4">
              {report.strengths?.map((str: string, i: number) => (
                <li key={i} className="flex gap-3 text-[15px] text-slate-600">
                  <div className="shrink-0 w-6 h-6 rounded-full bg-emerald-50 flex items-center justify-center border border-emerald-100 text-emerald-500 font-bold text-xs mt-0.5">
                    {i + 1}
                  </div>
                  <span className="leading-relaxed" dangerouslySetInnerHTML={{ __html: str.replace(/"([^"]+)"/g, '<q class="italic font-medium text-slate-800 bg-emerald-50 px-1 rounded">"$1"</q>') }} />
                </li>
              ))}
              {(!report.strengths || report.strengths.length === 0) && (
                <p className="text-slate-400 text-sm italic">No specific strengths highlighted.</p>
              )}
            </ul>
          </div>

          {/* Areas to Improve */}
          <div className="bg-white/80 backdrop-blur-xl border border-white p-8 rounded-[32px] shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
            <h3 className="text-lg font-extrabold text-amber-600 mb-6 flex items-center gap-2">
              <Target className="w-5 h-5"/> Areas for Improvement
            </h3>
            <ul className="space-y-4">
              {report.areas_to_improve?.map((str: string, i: number) => (
                <li key={i} className="flex gap-3 text-[15px] text-slate-600">
                  <div className="shrink-0 w-6 h-6 rounded-full bg-amber-50 flex items-center justify-center border border-amber-100 text-amber-500 font-bold text-xs mt-0.5">
                    {i + 1}
                  </div>
                  <span className="leading-relaxed" dangerouslySetInnerHTML={{ __html: str.replace(/"([^"]+)"/g, '<q class="italic font-medium text-slate-800 bg-amber-50 px-1 rounded">"$1"</q>') }} />
                </li>
              ))}
              {(!report.areas_to_improve || report.areas_to_improve.length === 0) && (
                <p className="text-slate-400 text-sm italic">No specific areas to improve highlighted.</p>
              )}
            </ul>
          </div>
          
          {/* Suggested Focus Areas */}
          {report.suggested_focus_areas && report.suggested_focus_areas.length > 0 && (
            <div className="bg-indigo-600 border border-indigo-500 p-8 rounded-[32px] shadow-xl md:col-span-2 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-[80px]"></div>
                <h3 className="text-lg font-extrabold text-white mb-6 flex items-center gap-2 relative z-10">
                  <Sparkles className="w-5 h-5"/> Suggested Focus Areas
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 relative z-10">
                    {report.suggested_focus_areas.map((area: string, i: number) => (
                        <div key={i} className="bg-white/10 backdrop-blur-sm border border-white/20 p-5 rounded-2xl text-white">
                            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold mb-4">
                                {i + 1}
                            </div>
                            <p className="text-[15px] leading-relaxed text-indigo-50">{area}</p>
                        </div>
                    ))}
                </div>
            </div>
          )}
          
          {/* Session Integrity Flags */}
          {session.flags && session.flags.length > 0 && (
              <div className="bg-rose-50 border border-rose-200 p-8 rounded-[32px] md:col-span-2">
                  <h3 className="text-lg font-extrabold text-rose-700 mb-4 flex items-center gap-2">
                      <Target className="w-5 h-5"/> Session Integrity Flags
                  </h3>
                  <p className="text-sm text-rose-600 mb-6">The following monitoring flags were raised during this session:</p>
                  <div className="flex flex-wrap gap-3">
                      {session.flags.map((flag: any, i: number) => (
                          <div key={i} className="bg-white border border-rose-100 px-4 py-2 rounded-xl text-sm font-bold text-rose-700 shadow-sm flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                              {flag.flag_type.replace(/_/g, ' ')}
                              <span className="text-xs text-rose-400 font-normal ml-2">
                                  {new Date(flag.triggered_at).toLocaleTimeString()}
                              </span>
                          </div>
                      ))}
                  </div>
              </div>
          )}
        </div>

      </div>
    </div>
  );
}
