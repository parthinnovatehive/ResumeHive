"use client";

import { useState } from "react";
import type { AtsScoreResult } from "@/lib/api/resumes";

interface Props {
  result: AtsScoreResult;
  onClose?: () => void;
  /** When provided, shows the "match against a job description" box.
   *  Called with the pasted JD text (or null to clear it) — the parent
   *  re-scores and passes the fresh result back down. */
  onScoreWithJd?: (jdText: string | null) => Promise<void>;
  /** True while the parent is re-scoring against a JD. */
  jdScoring?: boolean;
  /** One-click add of a missing JD keyword to the Skills section. */
  onAddSkill?: (skill: string) => void;
  /** Fork this resume for the current JD (duplicate-and-tailor). */
  onTailor?: (jdText: string) => Promise<void>;
  /** Persisted JD from a tailored resume — pre-fills the paste box. */
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
  if (pct >= 80) return "text-green-600";
  if (pct >= 50) return "text-amber-600";
  return "text-red-600";
}

function barColor(pct: number): string {
  if (pct >= 80) return "bg-green-500";
  if (pct >= 50) return "bg-amber-500";
  return "bg-red-500";
}

export function AtsScorePanel({
  result,
  onClose,
  onScoreWithJd,
  jdScoring,
  onAddSkill,
  onTailor,
  initialJd,
}: Props) {
  const { score, breakdown, max, suggestions, jd_match } = result;
  const [jdText, setJdText] = useState(initialJd ?? "");
  const [jdOpen, setJdOpen] = useState(!!initialJd);
  const [tailoring, setTailoring] = useState(false);

  const handleMatchJd = async () => {
    if (!onScoreWithJd || !jdText.trim()) return;
    await onScoreWithJd(jdText);
  };

  const handleClearJd = async () => {
    setJdText("");
    if (onScoreWithJd && jd_match) await onScoreWithJd(null);
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
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      {/* Header: overall score */}
      <div className="flex items-center justify-between">
        <div className="flex items-baseline gap-2">
          <span className={`text-3xl font-bold ${scoreColor(score)}`}>
            {score}
          </span>
          <span className="text-sm text-gray-500">/ 100 ATS Score</span>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            aria-label="Close score panel"
            className="rounded p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Per-category progress bars */}
      {breakdown && (
        <div className="mt-4 space-y-2">
          {(Object.entries(breakdown) as [string, number][]).map(
            ([cat, val]) => {
              const catMax = max[cat as keyof typeof max] ?? 1;
              const pct = catMax > 0 ? Math.round((val / catMax) * 100) : 0;
              return (
                <div key={cat}>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">
                      {CATEGORY_LABELS[cat] ?? cat}
                    </span>
                    <span className="font-medium text-gray-800">
                      {val}/{catMax}
                    </span>
                  </div>
                  <div className="mt-0.5 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                    <div
                      className={`h-full rounded-full transition-all ${barColor(pct)}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            },
          )}
        </div>
      )}

      {/* ── JD paste box ─────────────────────────────────────────── */}
      {onScoreWithJd && (
        <div className="mt-4 rounded-lg border border-blue-100 bg-blue-50/50 p-3">
          <button
            onClick={() => setJdOpen(!jdOpen)}
            className="flex w-full items-center justify-between text-left"
          >
            <span className="text-xs font-semibold uppercase tracking-wide text-blue-700">
              {jd_match ? "Job Description Match" : "Match against a job description"}
            </span>
            <svg
              className={`h-4 w-4 text-blue-600 transition-transform ${jdOpen ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {jdOpen && (
            <div className="mt-2">
              <textarea
                value={jdText}
                onChange={(e) => setJdText(e.target.value)}
                rows={5}
                maxLength={20000}
                placeholder="Paste the job description here to see which keywords your resume is missing…"
                className="w-full rounded-md border border-gray-300 bg-white p-2 text-sm text-gray-800 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <div className="mt-2 flex gap-2">
                <button
                  onClick={handleMatchJd}
                  disabled={jdScoring || !jdText.trim()}
                  className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {jdScoring ? "Matching…" : "Match JD"}
                </button>
                {jd_match && (
                  <button
                    onClick={handleClearJd}
                    disabled={jdScoring}
                    className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-600 transition hover:bg-gray-100 disabled:opacity-40"
                  >
                    Clear JD
                  </button>
                )}
              </div>
            </div>
          )}

          {/* ── JD match results ───────────────────────────────── */}
          {jd_match && (
            <div className="mt-3 space-y-3">
              <div className="flex items-center gap-3">
                <span className={`text-lg font-bold ${scoreColor(jd_match.match_pct)}`}>
                  {jd_match.match_pct}%
                </span>
                <span className="text-xs text-gray-600">
                  of the JD&apos;s top keywords found in your resume
                </span>
              </div>

              {/* Matched keywords */}
              {jd_match.matched_keywords.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-green-700">
                    Found in your resume
                  </p>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {jd_match.matched_keywords.map((kw) => (
                      <span
                        key={kw}
                        className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-800"
                      >
                        ✓ {kw}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Missing-keyword checklist */}
              {jd_match.missing_keywords.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-red-700">
                    Missing from your resume
                  </p>
                  <p className="mt-0.5 text-[11px] text-gray-500">
                    Add these only if they&apos;re genuinely true of you — never
                    fabricate skills.
                  </p>
                  <ul className="mt-1.5 space-y-1">
                    {jd_match.missing_keywords.map((mk) => (
                      <li
                        key={mk.keyword}
                        className="flex items-center justify-between gap-2 rounded-md border border-red-100 bg-red-50/60 px-2 py-1"
                      >
                        <span className="text-xs text-gray-800">{mk.keyword}</span>
                        <span className="flex shrink-0 items-center gap-2">
                          <span
                            className="h-1 w-12 overflow-hidden rounded-full bg-red-100"
                            title={`Importance: ${Math.round(mk.weight * 100)}%`}
                          >
                            <span
                              className="block h-full rounded-full bg-red-400"
                              style={{ width: `${Math.round(mk.weight * 100)}%` }}
                            />
                          </span>
                          {onAddSkill && (
                            <button
                              onClick={() => onAddSkill(mk.keyword)}
                              title="Add to Skills (only if genuinely true of you)"
                              className="rounded border border-green-300 bg-green-50 px-1.5 py-0.5 text-[10px] font-medium text-green-700 transition hover:bg-green-100"
                            >
                              + Add
                            </button>
                          )}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {jd_match.missing_keywords.length === 0 && (
                <p className="text-xs text-green-700">
                  Your resume covers all the top keywords from this JD. 🎉
                </p>
              )}

              {/* Duplicate-and-tailor */}
              {onTailor && jdText.trim() && (
                <div className="border-t border-blue-100 pt-2">
                  <button
                    onClick={handleTailor}
                    disabled={tailoring}
                    className="rounded-md border border-blue-600 bg-white px-3 py-1.5 text-xs font-medium text-blue-700 transition hover:bg-blue-50 disabled:opacity-40"
                  >
                    {tailoring ? "Creating copy…" : "Create tailored copy for this job"}
                  </button>
                  <p className="mt-1 text-[11px] text-gray-500">
                    Forks this resume with the JD attached — your master resume
                    stays untouched.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Itemized fixes */}
      {suggestions.length > 0 && (
        <div className="mt-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            How to improve
          </p>
          <ul className="mt-1.5 space-y-1.5">
            {suggestions.map((s, i) => (
              <li key={i} className="flex gap-2 text-sm text-gray-700">
                <span className="mt-0.5 shrink-0 text-amber-500">
                  <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </span>
                {s}
              </li>
            ))}
          </ul>
        </div>
      )}

      {suggestions.length === 0 && (
        <p className="mt-3 text-sm text-green-700">
          No issues found — your resume looks ATS-ready.
        </p>
      )}
    </div>
  );
}
