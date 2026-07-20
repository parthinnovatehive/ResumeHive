"use client";

import { useEffect, useState } from "react";
import { resumesApi } from "@/lib/api/resumes";
import type { AtsPreviewResult } from "@/lib/api/resumes";
import type { TemplateName } from "@/types/resume";

interface Props {
  resumeId: number;
  template: TemplateName;
  onClose: () => void;
}

const SECTION_LABELS: Record<string, string> = {
  summary: "Summary",
  experience: "Experience",
  education: "Education",
  projects: "Projects",
  skills: "Skills",
  certifications: "Certifications",
};

/**
 * "What the ATS sees" — renders the resume PDF server-side, extracts its
 * plain text with the same pipeline used for uploaded resumes, and shows
 * the raw dump. Far more convincing than a numeric score alone.
 */
export function AtsPreviewModal({ resumeId, template, onClose }: Props) {
  const [result, setResult] = useState<AtsPreviewResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch once on mount
  useEffect(() => {
    resumesApi
      .atsPreview(resumeId, template)
      .then(setResult)
      .catch(() => setError("Failed to generate the ATS preview."))
      .finally(() => setLoading(false));
  }, [resumeId, template]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="flex max-h-[85vh] w-full max-w-2xl flex-col rounded-lg bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b px-5 py-3">
          <div>
            <h2 className="text-sm font-bold text-gray-900">
              What an ATS sees
            </h2>
            <p className="text-xs text-gray-500">
              Plain text extracted from your generated PDF ({template} template)
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close ATS preview"
            className="rounded p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {loading && (
            <div className="flex items-center gap-3 py-8 text-sm text-gray-500">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
              Rendering PDF and extracting text…
            </div>
          )}

          {error && <p className="text-sm text-red-600">{error}</p>}

          {result && (
            <>
              {/* Detected sections */}
              <div className="mb-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Sections an ATS parser detected
                </p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {result.detected_sections.length > 0 ? (
                    result.detected_sections.map((s) => (
                      <span
                        key={s}
                        className="rounded-full bg-green-50 px-2 py-0.5 text-xs text-green-700 ring-1 ring-green-200"
                      >
                        ✓ {SECTION_LABELS[s] ?? s}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-red-600">
                      No sections detected — this resume would parse badly.
                    </span>
                  )}
                </div>
              </div>

              {/* Warnings */}
              {result.warnings.map((w, i) => (
                <p key={i} className="mb-2 text-xs text-amber-700">
                  ⚠ {w}
                </p>
              ))}

              {/* Raw text dump */}
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
                Raw extracted text
              </p>
              <pre className="whitespace-pre-wrap rounded-md border border-gray-200 bg-gray-50 p-3 font-mono text-[11px] leading-relaxed text-gray-800">
                {result.text || "(no text could be extracted)"}
              </pre>
              <p className="mt-2 text-[11px] text-gray-400">
                If something important is missing or garbled here, an ATS
                won&apos;t see it either. Our templates are built to keep this
                text clean — this view is your proof.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
