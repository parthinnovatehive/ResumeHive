"use client";

import { useEffect, useRef, useState } from "react";
import { resumesApi } from "@/lib/api/resumes";
import type { AnalyzeBulletsResult, BulletIssue } from "@/lib/api/resumes";

interface Props {
  /** The description text to analyze (raw textarea value). */
  text: string;
  /** Debounce delay in ms before hitting the API. */
  delay?: number;
}

const ISSUE_STYLE: Record<BulletIssue["type"], { label: string; cls: string }> = {
  weak_start: { label: "Weak start", cls: "bg-red-50 text-red-700 ring-red-200" },
  no_action_verb: { label: "No action verb", cls: "bg-amber-50 text-amber-700 ring-amber-200" },
  no_metric: { label: "Add a metric", cls: "bg-blue-50 text-blue-700 ring-blue-200" },
  passive_voice: { label: "Passive voice", cls: "bg-purple-50 text-purple-700 ring-purple-200" },
  too_long: { label: "Too long", cls: "bg-gray-100 text-gray-600 ring-gray-200" },
};

/**
 * Debounced per-bullet quality feedback rendered under a description
 * textarea. Flags each weak line with specific, clickable-to-expand fixes.
 */
export function BulletFeedback({ text, delay = 800 }: Props) {
  const [result, setResult] = useState<AnalyzeBulletsResult | null>(null);
  const [expanded, setExpanded] = useState<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestText = useRef(text);

  useEffect(() => {
    latestText.current = text;
    if (timerRef.current) clearTimeout(timerRef.current);

    if (!text.trim()) {
      setResult(null);
      return;
    }

    timerRef.current = setTimeout(() => {
      const requested = text;
      resumesApi
        .analyzeBullets(requested)
        .then((r) => {
          // Ignore stale responses if user kept typing
          if (latestText.current === requested) setResult(r);
        })
        .catch(() => {});
    }, delay);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [text, delay]);

  if (!result || result.stats.total === 0) return null;

  const flagged = result.bullets.filter((b) => b.issues.length > 0);
  if (flagged.length === 0) {
    return (
      <p className="mt-1.5 flex items-center gap-1 text-xs text-green-600">
        <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clipRule="evenodd"
          />
        </svg>
        All {result.stats.total} bullet{result.stats.total > 1 ? "s" : ""} look strong.
      </p>
    );
  }

  return (
    <div className="mt-1.5 space-y-1">
      {result.bullets.map((b, i) => {
        if (b.issues.length === 0) return null;
        const isOpen = expanded === i;
        return (
          <div key={i} className="text-xs">
            <button
              type="button"
              onClick={() => setExpanded(isOpen ? null : i)}
              className="flex w-full flex-wrap items-center gap-1.5 rounded px-1 py-0.5 text-left transition hover:bg-gray-50"
            >
              <span className="max-w-[50%] truncate italic text-gray-500">
                &ldquo;{b.text}&rdquo;
              </span>
              {b.issues.map((issue, j) => (
                <span
                  key={j}
                  className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium ring-1 ${ISSUE_STYLE[issue.type]?.cls ?? "bg-gray-100 text-gray-600 ring-gray-200"}`}
                >
                  {ISSUE_STYLE[issue.type]?.label ?? issue.type}
                </span>
              ))}
            </button>
            {isOpen && (
              <ul className="ml-2 mt-0.5 space-y-0.5 border-l-2 border-gray-200 pl-2 text-gray-600">
                {b.issues.map((issue, j) => (
                  <li key={j}>{issue.message}</li>
                ))}
              </ul>
            )}
          </div>
        );
      })}
    </div>
  );
}
