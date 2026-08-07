'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api/client';
import { 
  Award, 
  BarChart3, 
  ChevronLeft, 
  Target, 
  TrendingUp, 
  Loader2, 
  Sparkles, 
  ShieldAlert, 
  ShieldCheck, 
  AlertOctagon, 
  Bot, 
  User, 
  CheckCircle2, 
  Lightbulb, 
  KeyRound, 
  BookOpen 
} from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

export default function InterviewReportPage({ params }: { params: { sessionId: string } }) {
  const [session, setSession] = useState<any>(null);
  const [progress, setProgress] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    if (!token) {
      router.replace(`/login?from=${encodeURIComponent(`/interview/${params.sessionId}/report`)}`);
      return;
    }

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
      .catch((err: any) => {
        if (err?.response?.status === 401) {
          router.replace(`/login?from=${encodeURIComponent(`/interview/${params.sessionId}/report`)}`);
          return;
        }
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
  const isDisqualified = report.integrity_status === 'DISQUALIFIED' || report.status === 'DISQUALIFIED';
  const isIncomplete = report.integrity_status === 'INCOMPLETE' || (report.overall_score === 0 && !isDisqualified);
  const score = isDisqualified || isIncomplete ? (report.overall_score || 0) : (report.overall_score || 0);
  const categoryName = session.category?.name || 'Technical Round';
  
  let scoreColor = 'text-rose-500';
  if (!isDisqualified && !isIncomplete) {
    if (score >= 80) scoreColor = 'text-emerald-500';
    else if (score >= 60) scoreColor = 'text-amber-500';
  }
  
  // Tab switch count from flags
  const flags = session.flags || [];
  const tabSwitchesCount = flags.filter((f: any) => f.flag_type === 'TAB_SWITCH' || f.flag_type === 'WINDOW_BLUR').length;
  
  // Turn evaluations
  const turnEvaluations = report.turn_evaluations || [];
  
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
    <div className="min-h-[calc(100vh-72px)] bg-slate-50 relative selection:bg-indigo-500/30 font-sans pb-16">
      {/* Ambient Lighting */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <div className="absolute top-0 left-[20%] w-[600px] h-[600px] rounded-full bg-indigo-500/10 blur-[150px] mix-blend-multiply" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-purple-500/10 blur-[150px] mix-blend-multiply" />
      </div>

      <div className="max-w-5xl mx-auto relative z-10 px-6 pt-10">
        <div className="flex items-center justify-between mb-8">
          <button 
            onClick={() => router.push('/interview')}
            className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors bg-white/50 py-2 px-4 rounded-full border border-slate-200/50 w-fit"
          >
            <ChevronLeft size={16} /> Back to Interviews
          </button>
          
          <span className="px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold shadow-sm">
            Round: {categoryName}
          </span>
        </div>

        {/* Disqualification Banner */}
        {isDisqualified && (
          <div className="bg-rose-600 text-white rounded-3xl p-6 md:p-8 mb-8 shadow-xl shadow-rose-600/20 border border-rose-500 flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center shrink-0 border border-white/20">
              <AlertOctagon size={32} className="text-white" />
            </div>
            <div className="flex-1">
              <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-xs font-black uppercase tracking-wider mb-2">
                Anti-Cheating Disqualification
              </span>
              <h2 className="text-2xl font-black tracking-tight mb-1">
                Interview Disqualified Due To Tab Switching
              </h2>
              <p className="text-rose-100 text-sm leading-relaxed">
                {report.disqualification_reason || "This session was automatically terminated because candidate switched tabs or lost window focus multiple times, violating assessment integrity rules."}
              </p>
            </div>
          </div>
        )}

        {/* Incomplete Session Banner */}
        {isIncomplete && !isDisqualified && (
          <div className="bg-amber-500 text-white rounded-3xl p-6 md:p-8 mb-8 shadow-xl shadow-amber-500/20 border border-amber-400 flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center shrink-0 border border-white/20">
              <AlertOctagon size={32} className="text-white" />
            </div>
            <div className="flex-1">
              <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-xs font-black uppercase tracking-wider mb-2">
                Incomplete Session
              </span>
              <h2 className="text-2xl font-black tracking-tight mb-1">
                No Responses Recorded (0 Score)
              </h2>
              <p className="text-amber-100 text-sm leading-relaxed">
                The interview was ended immediately without candidate participation. A complete interview requires answering the AI interviewer&apos;s questions to produce a valid score.
              </p>
            </div>
          </div>
        )}

        {/* Top Section: Score & Summary */}
        <div className="bg-white/80 backdrop-blur-xl border border-white p-8 md:p-10 rounded-[32px] shadow-[0_8px_30px_rgba(0,0,0,0.04)] mb-8 flex flex-col md:flex-row gap-10 items-center md:items-start">
          <div className="shrink-0 flex flex-col items-center justify-center">
            <div className={`relative w-40 h-40 flex items-center justify-center bg-slate-50 rounded-full border-8 ${
              isDisqualified || isIncomplete ? 'border-rose-200' : 'border-slate-100'
            } shadow-inner`}>
              <span className={`text-5xl font-extrabold tracking-tighter ${scoreColor}`}>
                {score}
              </span>
              <span className="absolute bottom-6 text-slate-400 text-xs font-bold uppercase tracking-widest">/ 100</span>
            </div>
            <h2 className="text-lg font-bold text-slate-800 mt-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-indigo-500"/> Overall Score
            </h2>
            {isDisqualified ? (
              <span className="mt-2 text-xs font-extrabold text-rose-600 uppercase tracking-widest bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
                Disqualified
              </span>
            ) : isIncomplete ? (
              <span className="mt-2 text-xs font-extrabold text-amber-600 uppercase tracking-widest bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                Incomplete (0 Answers)
              </span>
            ) : prevScore !== null && (
                <div className={`mt-2 text-sm font-bold flex items-center gap-1 ${score > prevScore ? 'text-emerald-600' : score < prevScore ? 'text-rose-600' : 'text-slate-500'}`}>
                    {score > prevScore ? <TrendingUp size={16}/> : score < prevScore ? <TrendingUp size={16} className="rotate-180"/> : null}
                    {score > prevScore ? 'Up' : score < prevScore ? 'Down' : 'No change'} from {prevScore} last attempt
                </div>
            )}
          </div>

          <div className="flex-1">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                <Sparkles className="text-indigo-500"/> Interview Assessment Summary
              </h3>
            </div>
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
                    <div className={`h-1.5 rounded-full ${isDisqualified || isIncomplete ? 'bg-rose-500' : 'bg-indigo-500'}`} style={{ width: `${data.score}%` }}></div>
                  </div>
                  <p className="text-xs text-slate-500 leading-snug">{data.feedback}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Question-by-Question Deep Dive & Hiring Selection Optimization */}
        {turnEvaluations.length > 0 && (
          <div className="bg-white/80 backdrop-blur-xl border border-slate-200/80 p-8 md:p-10 rounded-[32px] shadow-[0_8px_30px_rgba(0,0,0,0.04)] mb-8">
            <div className="mb-8">
              <span className="text-xs font-extrabold text-indigo-600 uppercase tracking-widest block mb-1">
                Transcript Breakdown & Coach
              </span>
              <h3 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                <BookOpen className="text-indigo-600 w-6 h-6"/>
                Question-by-Question Analysis & Model Answers
              </h3>
              <p className="text-sm text-slate-600 mt-1">
                Review each conversation turn, see how a top 1% candidate would answer, and identify high-impact keywords that maximize your selection chances.
              </p>
            </div>

            <div className="space-y-8">
              {turnEvaluations.map((turn: any, i: number) => {
                const turnScore = turn.score || 0;
                let badgeStyle = 'bg-rose-50 border-rose-200 text-rose-700';
                if (turnScore >= 80) badgeStyle = 'bg-emerald-50 border-emerald-200 text-emerald-700';
                else if (turnScore >= 60) badgeStyle = 'bg-amber-50 border-amber-200 text-amber-700';

                return (
                  <div key={i} className="border border-slate-200 rounded-3xl p-6 md:p-7 bg-slate-50/50 hover:bg-white transition-all shadow-sm">
                    {/* Header */}
                    <div className="flex items-center justify-between pb-4 border-b border-slate-200/70 mb-5">
                      <span className="text-xs font-black uppercase tracking-wider text-slate-500 bg-white border border-slate-200 px-3 py-1 rounded-full">
                        Question #{i + 1}
                      </span>
                      <span className={`text-xs font-extrabold px-3 py-1 rounded-full border ${badgeStyle}`}>
                        Turn Score: {turnScore}/100
                      </span>
                    </div>

                    {/* Interviewer Question */}
                    <div className="flex items-start gap-3 mb-4">
                      <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 mt-0.5 border border-indigo-200">
                        <Bot size={18} />
                      </div>
                      <div className="flex-1">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">Interviewer Question</span>
                        <p className="text-sm font-semibold text-slate-900 leading-relaxed">
                          {turn.question}
                        </p>
                      </div>
                    </div>

                    {/* Candidate Answer */}
                    <div className="flex items-start gap-3 mb-5 bg-white p-4 rounded-2xl border border-slate-200/60 shadow-xs">
                      <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 mt-0.5 border border-slate-200">
                        <User size={18} />
                      </div>
                      <div className="flex-1">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">Your Response</span>
                        <p className="text-sm text-slate-700 leading-relaxed italic">
                          &quot;{turn.candidate_answer}&quot;
                        </p>
                      </div>
                    </div>

                    {/* Feedback */}
                    {turn.feedback && (
                      <div className="mb-5 bg-amber-50/70 border border-amber-200/70 rounded-2xl p-4 text-xs leading-relaxed text-amber-900 font-medium flex items-start gap-2.5">
                        <Lightbulb size={16} className="text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <strong className="font-bold text-amber-950 block mb-0.5">Bar-Raiser Feedback:</strong>
                          {turn.feedback}
                        </div>
                      </div>
                    )}

                    {/* Better / Model Answer */}
                    {turn.better_answer && (
                      <div className="mb-5 bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200/80 rounded-2xl p-5">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                          <span className="text-xs font-black uppercase tracking-wider text-emerald-800">
                            Recommended Model Answer (Top 1% Candidate)
                          </span>
                        </div>
                        <p className="text-xs md:text-sm text-emerald-950 leading-relaxed font-normal whitespace-pre-line">
                          {turn.better_answer}
                        </p>
                      </div>
                    )}

                    {/* Keywords & Topics to Increase Chances of Selection */}
                    {turn.keywords_to_improve_selection && turn.keywords_to_improve_selection.length > 0 && (
                      <div className="bg-indigo-50/60 border border-indigo-100 rounded-2xl p-4">
                        <div className="flex items-center gap-2 mb-2.5">
                          <KeyRound size={15} className="text-indigo-600 shrink-0" />
                          <span className="text-xs font-bold text-indigo-900 uppercase tracking-wider">
                            Topics & Keywords That Increase Selection Chances:
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {turn.keywords_to_improve_selection.map((kw: string, kidx: number) => (
                            <span 
                              key={kidx}
                              className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-white border border-indigo-200 text-indigo-700 text-xs font-bold shadow-xs hover:bg-indigo-600 hover:text-white transition-colors cursor-default"
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                              {kw}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Bottom Section: Strengths & Improvements */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
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
          
          {/* Anti-Cheating & Proctoring Integrity Audit */}
          <div className="bg-white/80 backdrop-blur-xl border border-slate-200/80 p-8 rounded-[32px] shadow-[0_8px_30px_rgba(0,0,0,0.04)] md:col-span-2">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                    {tabSwitchesCount === 0 && !isDisqualified ? (
                      <ShieldCheck className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <ShieldAlert className="w-5 h-5 text-rose-600" />
                    )}
                    Anti-Cheating & Proctoring Audit
                  </h3>
                  <p className="text-sm text-slate-500">Live monitoring data recorded throughout the interview session.</p>
                </div>
                <span className={`px-4 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-wider border ${
                  isDisqualified 
                    ? 'bg-rose-50 border-rose-200 text-rose-700' 
                    : tabSwitchesCount > 0 
                    ? 'bg-amber-50 border-amber-200 text-amber-700' 
                    : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                }`}>
                  {isDisqualified 
                    ? 'Disqualified (Cheating Detected)' 
                    : tabSwitchesCount > 0 
                    ? `${tabSwitchesCount} Tab Switch Warning(s)` 
                    : '100% Authentic Integrity'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Tab Switches Detected</span>
                  <span className={`text-2xl font-black ${tabSwitchesCount > 0 ? 'text-rose-600' : 'text-slate-800'}`}>
                    {tabSwitchesCount}
                  </span>
                </div>
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Total Proctoring Events</span>
                  <span className="text-2xl font-black text-slate-800">
                    {flags.length}
                  </span>
                </div>
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Assessment Status</span>
                  <span className={`text-2xl font-black ${isDisqualified ? 'text-rose-600' : 'text-emerald-600'}`}>
                    {isDisqualified ? 'DISQUALIFIED' : 'VERIFIED'}
                  </span>
                </div>
              </div>

              {flags.length > 0 ? (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Timestamped Integrity Log</h4>
                  <div className="flex flex-wrap gap-2.5">
                    {flags.map((flag: any, i: number) => {
                      const isTab = flag.flag_type === 'TAB_SWITCH' || flag.flag_type === 'WINDOW_BLUR';
                      return (
                        <div key={i} className={`border px-3.5 py-1.5 rounded-xl text-xs font-bold shadow-sm flex items-center gap-2 ${
                          isTab 
                            ? 'bg-rose-50 border-rose-200 text-rose-700' 
                            : 'bg-slate-50 border-slate-200 text-slate-700'
                        }`}>
                          <span className={`w-2 h-2 rounded-full ${isTab ? 'bg-rose-500' : 'bg-slate-400'}`}></span>
                          {flag.flag_type.replace(/_/g, ' ')}
                          <span className="text-[11px] opacity-60 font-normal">
                            {new Date(flag.triggered_at).toLocaleTimeString()}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 text-emerald-800 text-xs font-medium flex items-center gap-2">
                  <ShieldCheck size={16} className="text-emerald-600 shrink-0" />
                  Clean session: No tab switching, window defocusing, or suspicious behavior detected.
                </div>
              )}
          </div>
        </div>

      </div>
    </div>
  );
}
