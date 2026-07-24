"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Upload,
  Briefcase,
  GraduationCap,
  Wrench,
  Award,
  User,
  FileText,
  Loader2,
  Trash2,
  Clock,
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Target,
  BarChart3,
  Lightbulb,
  Sparkles,
  Check,
  X,
  RotateCcw,
} from "lucide-react";
import { linkedinApi } from "@/lib/api/linkedin";
import type {
  LinkedinAnalysis,
  LinkedinAnalysisListItem,
  LinkedinExperienceEntry,
  LinkedinEducationEntry,
  LinkedinRewriteResult,
  LinkedinScoreResult,
  LinkedinRole,
} from "@/types/linkedin";

/* -------------------------------------------------------------------------- */
/*                                    Page                                    */
/* -------------------------------------------------------------------------- */

export default function LinkedinPage() {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [active, setActive] = useState<LinkedinAnalysis | null>(null);
  const [history, setHistory] = useState<LinkedinAnalysisListItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [roles, setRoles] = useState<LinkedinRole[]>([]);
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [scoring, setScoring] = useState(false);
  const [headlineRewrite, setHeadlineRewrite] = useState<LinkedinRewriteResult | null>(null);
  const [aboutRewrite, setAboutRewrite] = useState<LinkedinRewriteResult | null>(null);
  const [rewritingHeadline, setRewritingHeadline] = useState(false);
  const [rewritingAbout, setRewritingAbout] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadHistory();
    loadRoles();
  }, []);

  const loadHistory = async () => {
    setLoadingHistory(true);
    try {
      const items = await linkedinApi.list();
      setHistory(items);
    } catch {
      /* silent */
    } finally {
      setLoadingHistory(false);
    }
  };

  const loadRoles = async () => {
    try {
      const r = await linkedinApi.getRoles();
      setRoles(r);
    } catch {
      /* silent */
    }
  };

  const handleUpload = async (file: File | undefined) => {
    if (!file) return;
    setError(null);
    setUploading(true);
    try {
      const result = await linkedinApi.parseUpload(file);
      setActive(result);
      loadHistory();
    } catch (err: unknown) {
      const detail =
        (err as { response?: { data?: { detail?: string } } })?.response?.data
          ?.detail ?? "Failed to parse the LinkedIn PDF. Please try again.";
      setError(detail);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const handleView = async (id: number) => {
    try {
      const result = await linkedinApi.get(id);
      setActive(result);
      if (result.scores?.role) setSelectedRole(result.scores.role);
    } catch {
      setError("Failed to load analysis.");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await linkedinApi.delete(id);
      setHistory((prev) => prev.filter((h) => h.id !== id));
      if (active?.id === id) setActive(null);
    } catch {
      setError("Failed to delete analysis.");
    }
  };

  const handleScore = async () => {
    if (!active) return;
    setScoring(true);
    setError(null);
    try {
      const result = await linkedinApi.score(active.id, selectedRole || null);
      setActive((prev) => (prev ? { ...prev, scores: result } : prev));
      loadHistory();
    } catch (err: unknown) {
      const detail =
        (err as { response?: { data?: { detail?: string } } })?.response?.data
          ?.detail ?? "Failed to compute score.";
      setError(detail);
    } finally {
      setScoring(false);
    }
  };

  const handleRewriteHeadline = async () => {
    if (!active) return;
    setRewritingHeadline(true);
    setError(null);
    try {
      const result = await linkedinApi.rewriteHeadline(active.id, selectedRole || null);
      setHeadlineRewrite(result);
    } catch (err: unknown) {
      const detail =
        (err as { response?: { data?: { detail?: string } } })?.response?.data
          ?.detail ?? "Failed to rewrite headline. Is Ollama running?";
      setError(detail);
    } finally {
      setRewritingHeadline(false);
    }
  };

  const handleRewriteAbout = async () => {
    if (!active) return;
    setRewritingAbout(true);
    setError(null);
    try {
      const result = await linkedinApi.rewriteAbout(active.id, selectedRole || null);
      setAboutRewrite(result);
    } catch (err: unknown) {
      const detail =
        (err as { response?: { data?: { detail?: string } } })?.response?.data
          ?.detail ?? "Failed to rewrite About section. Is Ollama running?";
      setError(detail);
    } finally {
      setRewritingAbout(false);
    }
  };

  const applyHeadlineRewrite = () => {
    if (!headlineRewrite || !active) return;
    setActive((prev) =>
      prev ? { ...prev, sections: { ...prev.sections, headline: headlineRewrite.rewritten } } : prev,
    );
    setHeadlineRewrite(null);
  };

  const applyAboutRewrite = () => {
    if (!aboutRewrite || !active) return;
    setActive((prev) =>
      prev ? { ...prev, sections: { ...prev.sections, about: aboutRewrite.rewritten } } : prev,
    );
    setAboutRewrite(null);
  };

  return (
    <div className="mx-auto max-w-5xl px-4 pb-20">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          LinkedIn Profile Optimizer
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Upload your LinkedIn PDF export to analyze and optimize your profile.
        </p>
      </div>

      {/* Upload Card */}
      <div className="relative group overflow-hidden rounded-2xl bg-white/40 backdrop-blur-xl border border-white/60 p-6 shadow-sm transition-all hover:shadow-md hover:bg-white/60 mb-8">
        <div className="absolute inset-0 z-[-1] rounded-2xl bg-gradient-to-br from-premium-blue/10 to-premium-purple/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="flex flex-col gap-4">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white shadow-[0_4px_12px_rgba(0,0,0,0.04)] border border-slate-100 group-hover:scale-105 transition-transform duration-300">
              <LinkedinIcon className="w-5 h-5 text-[#0A66C2]" />
            </div>
            <div className="flex-1 pt-0.5">
              <p className="text-[14px] font-bold tracking-wide text-slate-800 group-hover:text-[#0A66C2] transition-colors">
                Upload LinkedIn Profile Export
              </p>
              <p className="mt-1 text-[13px] leading-relaxed font-medium text-slate-500">
                Go to your LinkedIn profile &rarr; More &rarr; Save to PDF.
                Then drop the file here.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-[13px] font-bold tracking-wide uppercase text-white shadow-md transition-all hover:bg-[#0A66C2] hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-40"
          >
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Parsing Profile...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Upload LinkedIn PDF
              </>
            )}
          </button>
          <input
            ref={inputRef}
            type="file"
            accept=".pdf"
            className="hidden"
            onChange={(e) => handleUpload(e.target.files?.[0])}
            aria-label="Upload LinkedIn PDF export"
          />
        </div>
        {error && (
          <div className="mt-3 flex items-start gap-2 rounded-lg bg-red-50 p-3 text-xs text-red-700">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            {error}
          </div>
        )}
      </div>

      {/* Active Analysis Result */}
      {active && (
        <>
          {/* Role Selector + Score Button */}
          <div className="mb-6 flex flex-wrap items-center gap-3 rounded-2xl bg-white/60 backdrop-blur border border-white/60 p-4 shadow-sm">
            <Target className="w-4 h-4 text-slate-500" />
            <span className="text-sm font-medium text-slate-700">Target role:</span>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 focus:border-[#0A66C2] focus:outline-none focus:ring-1 focus:ring-[#0A66C2]"
            >
              <option value="">Generic (no role)</option>
              {roles.map((r) => (
                <option key={r.key} value={r.key}>
                  {r.name}
                </option>
              ))}
            </select>
            <button
              onClick={handleScore}
              disabled={scoring}
              className="ml-auto flex items-center gap-2 rounded-xl bg-[#0A66C2] px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#004182] hover:-translate-y-0.5 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-40"
            >
              {scoring ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Scoring...
                </>
              ) : (
                <>
                  <BarChart3 className="w-4 h-4" />
                  {active.scores ? "Re-score" : "Score Profile"}
                </>
              )}
            </button>
          </div>

          {/* Score Result */}
          {active.scores && <ScorePanel result={active.scores} />}

          {/* Parsed Sections */}
          <AnalysisResult
            analysis={active}
            headlineRewrite={headlineRewrite}
            aboutRewrite={aboutRewrite}
            rewritingHeadline={rewritingHeadline}
            rewritingAbout={rewritingAbout}
            onRewriteHeadline={handleRewriteHeadline}
            onRewriteAbout={handleRewriteAbout}
            onApplyHeadline={applyHeadlineRewrite}
            onApplyAbout={applyAboutRewrite}
            onDiscardHeadline={() => setHeadlineRewrite(null)}
            onDiscardAbout={() => setAboutRewrite(null)}
          />
        </>
      )}

      {/* History */}
      {!loadingHistory && history.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">
            Previous Analyses
          </h2>
          <div className="space-y-2">
            {history.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-xl bg-white/60 backdrop-blur border border-white/60 px-4 py-3 shadow-sm hover:shadow-md transition-all"
              >
                <button
                  onClick={() => handleView(item.id)}
                  className="flex items-center gap-3 flex-1 text-left"
                >
                  <Clock className="w-4 h-4 text-slate-400" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-slate-700">
                        Analysis #{item.id}
                      </p>
                      {item.score !== null && (
                        <span
                          className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                            item.score >= 70
                              ? "bg-green-100 text-green-700"
                              : item.score >= 40
                                ? "bg-amber-100 text-amber-700"
                                : "bg-red-100 text-red-700"
                          }`}
                        >
                          {item.score}/100
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400">
                      {new Date(item.created_at).toLocaleDateString()} &middot;{" "}
                      {item.detected_sections.length} section
                      {item.detected_sections.length !== 1 ? "s" : ""} detected
                    </p>
                  </div>
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                              Score Panel                                   */
/* -------------------------------------------------------------------------- */

const CATEGORY_META: Record<
  string,
  { label: string; icon: React.ReactNode; color: string }
> = {
  headline: {
    label: "Headline",
    icon: <User className="w-4 h-4" />,
    color: "text-blue-600",
  },
  about_keywords: {
    label: "About Keywords",
    icon: <FileText className="w-4 h-4" />,
    color: "text-purple-600",
  },
  skills_coverage: {
    label: "Skills Coverage",
    icon: <Wrench className="w-4 h-4" />,
    color: "text-emerald-600",
  },
  experience_quality: {
    label: "Experience Quality",
    icon: <Briefcase className="w-4 h-4" />,
    color: "text-orange-600",
  },
};

function ScorePanel({ result }: { result: LinkedinScoreResult }) {
  const { score, breakdown, max, suggestions } = result;
  const [showAll, setShowAll] = useState(false);

  const displayed = showAll ? suggestions : suggestions.slice(0, 5);

  return (
    <div className="mb-6 space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Score Ring + Category Bars */}
      <div className="rounded-2xl bg-white/60 backdrop-blur border border-white/60 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start gap-6">
          {/* Score Ring */}
          <div className="flex flex-col items-center">
            <div className="relative w-28 h-28">
              <svg className="w-28 h-28 -rotate-90" viewBox="0 0 120 120">
                <circle
                  cx="60" cy="60" r="52"
                  fill="none"
                  stroke="#e2e8f0"
                  strokeWidth="10"
                />
                <circle
                  cx="60" cy="60" r="52"
                  fill="none"
                  stroke={score >= 70 ? "#22c55e" : score >= 40 ? "#f59e0b" : "#ef4444"}
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={`${(score / 100) * 326.7} 326.7`}
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-slate-900">{score}</span>
                <span className="text-[11px] text-slate-400 font-medium">/ 100</span>
              </div>
            </div>
            <p className="mt-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Overall
            </p>
          </div>

          {/* Category Bars */}
          <div className="flex-1 w-full space-y-3">
            {Object.entries(breakdown).map(([key, pts]) => {
              const meta = CATEGORY_META[key];
              if (!meta) return null;
              const maxPts = max[key as keyof typeof max];
              const pct = maxPts > 0 ? (pts / maxPts) * 100 : 0;
              return (
                <div key={key}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5">
                      <span className={meta.color}>{meta.icon}</span>
                      <span className="text-xs font-semibold text-slate-700">
                        {meta.label}
                      </span>
                    </div>
                    <span className="text-xs text-slate-500 font-medium">
                      {pts} / {maxPts}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ease-out ${
                        pct >= 70 ? "bg-green-500" : pct >= 40 ? "bg-amber-400" : "bg-red-400"
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div className="rounded-2xl bg-white/60 backdrop-blur border border-white/60 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="w-4 h-4 text-amber-500" />
            <h3 className="text-sm font-semibold text-slate-800">
              Improvement Suggestions
            </h3>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500">
              {suggestions.length}
            </span>
          </div>
          <div className="space-y-2">
            {displayed.map((s, i) => (
              <div
                key={i}
                className="flex items-start gap-2 rounded-lg bg-slate-50 p-3 text-xs text-slate-700 leading-relaxed"
              >
                <span className="shrink-0 mt-0.5 w-5 h-5 rounded-full bg-[#0A66C2]/10 text-[#0A66C2] flex items-center justify-center text-[10px] font-bold">
                  {i + 1}
                </span>
                {s}
              </div>
            ))}
          </div>
          {suggestions.length > 5 && (
            <button
              onClick={() => setShowAll(!showAll)}
              className="mt-3 text-xs font-semibold text-[#0A66C2] hover:underline"
            >
              {showAll ? "Show fewer" : `Show all ${suggestions.length} suggestions`}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                             Analysis Result                                */
/* -------------------------------------------------------------------------- */

function AnalysisResult({
  analysis,
  headlineRewrite,
  aboutRewrite,
  rewritingHeadline,
  rewritingAbout,
  onRewriteHeadline,
  onRewriteAbout,
  onApplyHeadline,
  onApplyAbout,
  onDiscardHeadline,
  onDiscardAbout,
}: {
  analysis: LinkedinAnalysis;
  headlineRewrite: LinkedinRewriteResult | null;
  aboutRewrite: LinkedinRewriteResult | null;
  rewritingHeadline: boolean;
  rewritingAbout: boolean;
  onRewriteHeadline: () => void;
  onRewriteAbout: () => void;
  onApplyHeadline: () => void;
  onApplyAbout: () => void;
  onDiscardHeadline: () => void;
  onDiscardAbout: () => void;
}) {
  const { sections, detected_sections, warnings } = analysis;

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Warnings */}
      {warnings.length > 0 && (
        <div className="rounded-xl bg-amber-50 border border-amber-200 p-4">
          {warnings.map((w, i) => (
            <div key={i} className="flex items-start gap-2 text-sm text-amber-700">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              {w}
            </div>
          ))}
        </div>
      )}

      {/* Detected Sections */}
      <div className="flex flex-wrap gap-1.5">
        {detected_sections.map((s) => (
          <span
            key={s}
            className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-0.5 text-[11px] font-medium text-green-700 ring-1 ring-green-200"
          >
            <CheckCircle2 className="w-3 h-3" />
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </span>
        ))}
      </div>

      {/* Headline */}
      {sections.headline && (
        <SectionCard title="Headline" icon={<User className="w-4 h-4" />}>
          {headlineRewrite ? (
            <RewriteComparison
              original={headlineRewrite.original}
              rewritten={headlineRewrite.rewritten}
              label="Headline"
              onApply={onApplyHeadline}
              onDiscard={onDiscardHeadline}
            />
          ) : (
            <>
              <p className="text-sm text-slate-700 font-medium">{sections.headline}</p>
              <p className="mt-1 text-xs text-slate-400">
                {sections.headline.length} characters
              </p>
            </>
          )}
          <button
            onClick={onRewriteHeadline}
            disabled={rewritingHeadline}
            className="mt-3 flex items-center gap-1.5 rounded-lg bg-[#0A66C2]/10 px-3 py-1.5 text-xs font-semibold text-[#0A66C2] transition-all hover:bg-[#0A66C2]/20 disabled:opacity-40"
          >
            {rewritingHeadline ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Rewriting...
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                Improve my headline
              </>
            )}
          </button>
        </SectionCard>
      )}

      {/* About */}
      {sections.about && (
        <SectionCard title="About" icon={<FileText className="w-4 h-4" />}>
          {aboutRewrite ? (
            <RewriteComparison
              original={aboutRewrite.original}
              rewritten={aboutRewrite.rewritten}
              label="About"
              onApply={onApplyAbout}
              onDiscard={onDiscardAbout}
            />
          ) : (
            <>
              <p className="text-sm text-slate-700 whitespace-pre-line leading-relaxed">
                {sections.about}
              </p>
              <p className="mt-2 text-xs text-slate-400">
                {sections.about.split(/\s+/).length} words &middot;{" "}
                {sections.about.length} characters
              </p>
            </>
          )}
          <button
            onClick={onRewriteAbout}
            disabled={rewritingAbout}
            className="mt-3 flex items-center gap-1.5 rounded-lg bg-[#0A66C2]/10 px-3 py-1.5 text-xs font-semibold text-[#0A66C2] transition-all hover:bg-[#0A66C2]/20 disabled:opacity-40"
          >
            {rewritingAbout ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Rewriting...
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                Improve my About section
              </>
            )}
          </button>
        </SectionCard>
      )}

      {/* Experience */}
      {sections.experience.length > 0 && (
        <SectionCard
          title="Experience"
          icon={<Briefcase className="w-4 h-4" />}
          count={sections.experience.length}
        >
          <div className="space-y-4">
            {sections.experience.map((entry: LinkedinExperienceEntry, i: number) => (
              <div key={i} className="rounded-lg bg-slate-50 p-3 border border-slate-100">
                {entry.title && (
                  <p className="text-sm font-semibold text-slate-800">{entry.title}</p>
                )}
                {entry.company && (
                  <p className="text-xs text-slate-500 mt-0.5">{entry.company}</p>
                )}
                {entry.date_range && (
                  <p className="text-xs text-slate-400 mt-0.5">{entry.date_range}</p>
                )}
                {entry.description && (
                  <p className="mt-2 text-xs text-slate-600 whitespace-pre-line leading-relaxed">
                    {entry.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      {/* Education */}
      {sections.education.length > 0 && (
        <SectionCard
          title="Education"
          icon={<GraduationCap className="w-4 h-4" />}
          count={sections.education.length}
        >
          <div className="space-y-2">
            {sections.education.map((entry: LinkedinEducationEntry, i: number) => (
              <div key={i} className="rounded-lg bg-slate-50 p-3 border border-slate-100">
                <p className="text-sm font-medium text-slate-700">{entry.info}</p>
                {entry.date_range && (
                  <p className="text-xs text-slate-400 mt-0.5">{entry.date_range}</p>
                )}
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      {/* Skills */}
      {sections.skills.length > 0 && (
        <SectionCard
          title="Skills"
          icon={<Wrench className="w-4 h-4" />}
          count={sections.skills.length}
        >
          <div className="flex flex-wrap gap-1.5">
            {sections.skills.map((skill: string, i: number) => (
              <span
                key={i}
                className="inline-block rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700 ring-1 ring-blue-200"
              >
                {skill}
              </span>
            ))}
          </div>
        </SectionCard>
      )}

      {/* Certifications */}
      {sections.certifications && sections.certifications.length > 0 && (
        <SectionCard
          title="Certifications"
          icon={<Award className="w-4 h-4" />}
          count={sections.certifications.length}
        >
          <div className="space-y-1">
            {sections.certifications.map((cert: string, i: number) => (
              <p key={i} className="text-sm text-slate-700">{cert}</p>
            ))}
          </div>
        </SectionCard>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                              Section Card                                  */
/* -------------------------------------------------------------------------- */

function SectionCard({
  title,
  icon,
  count,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  count?: number;
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="rounded-2xl bg-white/60 backdrop-blur border border-white/60 shadow-sm overflow-hidden">
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-white/40 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <span className="text-slate-500">{icon}</span>
          <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
          {count !== undefined && (
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500">
              {count}
            </span>
          )}
        </div>
        {collapsed ? (
          <ChevronDown className="w-4 h-4 text-slate-400" />
        ) : (
          <ChevronUp className="w-4 h-4 text-slate-400" />
        )}
      </button>
      {!collapsed && <div className="px-5 pb-4">{children}</div>}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                          Rewrite Comparison                                 */
/* -------------------------------------------------------------------------- */

function RewriteComparison({
  original,
  rewritten,
  label,
  onApply,
  onDiscard,
}: {
  original: string;
  rewritten: string;
  label: string;
  onApply: () => void;
  onDiscard: () => void;
}) {
  return (
    <div className="space-y-3">
      {/* Original (struck through) */}
      <div>
        <p className="text-[11px] font-semibold text-red-500 uppercase tracking-wider mb-1">Original</p>
        <p className="text-sm text-slate-500 line-through leading-relaxed">{original}</p>
      </div>

      {/* Rewritten (highlighted) */}
      <div>
        <p className="text-[11px] font-semibold text-green-600 uppercase tracking-wider mb-1">
          Suggested {label}
        </p>
        <p className="text-sm text-slate-800 font-medium leading-relaxed rounded-lg bg-green-50 border border-green-200 p-3">
          {rewritten}
        </p>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-2">
        <button
          onClick={onApply}
          className="flex items-center gap-1.5 rounded-lg bg-green-600 px-3 py-1.5 text-xs font-semibold text-white transition-all hover:bg-green-700 hover:-translate-y-0.5 hover:shadow-sm"
        >
          <Check className="w-3.5 h-3.5" />
          Accept
        </button>
        <button
          onClick={onDiscard}
          className="flex items-center gap-1.5 rounded-lg bg-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition-all hover:bg-slate-300"
        >
          <X className="w-3.5 h-3.5" />
          Discard
        </button>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                          LinkedIn Icon (inline)                             */
/* -------------------------------------------------------------------------- */

function LinkedinIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}
