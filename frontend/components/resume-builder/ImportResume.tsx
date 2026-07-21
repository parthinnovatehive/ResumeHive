"use client";

import { useRef, useState } from "react";
import { resumesApi } from "@/lib/api/resumes";
import type { ParseUploadResult } from "@/lib/api/resumes";

interface Props {
  /** Called with the parse result so the parent can pre-fill the form. */
  onParsed: (result: ParseUploadResult) => void;
}

const FIELD_LABELS: Record<string, string> = {
  full_name: "Name",
  email: "Email",
  phone: "Phone",
  location: "Location",
  linkedin_url: "LinkedIn",
  summary: "Summary",
  education: "Education",
  experience: "Experience",
  projects: "Projects",
  skills: "Skills",
  certifications: "Certifications",
};

/**
 * Basic upload-and-parse box for importing an existing resume (PDF/DOCX).
 * After parsing, shows per-field confidence chips: green = high confidence,
 * yellow = please verify.
 */
export function ImportResume({ onParsed }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ParseUploadResult | null>(null);

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setError(null);
    setResult(null);
    setUploading(true);
    try {
      const parsed = await resumesApi.parseUpload(file);
      setResult(parsed);
      onParsed(parsed);
    } catch (err: unknown) {
      const detail =
        (err as { response?: { data?: { detail?: string } } })?.response?.data
          ?.detail ?? "Failed to parse the file. Try a different PDF/DOCX.";
      setError(detail);
    } finally {
      setUploading(false);
      // Allow re-selecting the same file
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="relative group overflow-hidden rounded-2xl bg-white/40 backdrop-blur-xl border border-white/60 p-5 shadow-sm transition-all hover:shadow-md hover:bg-white/60">
      {/* Soft gradient border effect via pseudo-element illusion */}
      <div className="absolute inset-0 z-[-1] rounded-2xl bg-gradient-to-br from-premium-blue/10 to-premium-purple/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="flex flex-col gap-4">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white shadow-[0_4px_12px_rgba(0,0,0,0.04)] border border-slate-100 group-hover:scale-105 transition-transform duration-300">
            <svg className="w-5 h-5 text-premium-blue" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
          </div>
          <div className="flex-1 pt-0.5">
            <p className="text-[14px] font-bold tracking-wide text-slate-800 group-hover:text-premium-blue transition-colors">
              Have a resume already?
            </p>
            <p className="mt-1 text-[13px] leading-relaxed font-medium text-slate-500">
              Upload a PDF or DOCX and we&apos;ll pre-fill the form instantly.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-[13px] font-bold tracking-wide uppercase text-white shadow-md transition-all hover:bg-slate-800 hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-40"
        >
          {uploading ? (
            <>
              <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="32" strokeDashoffset="0" className="opacity-30" /><path d="M12 2v4M12 18v4M2 12h4M18 12h4" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-100" /></svg>
              Parsing...
            </>
          ) : (
            "Upload Resume"
          )}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.docx"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
          aria-label="Upload existing resume"
        />
      </div>

      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}

      {result && (
        <div className="mt-3 space-y-2">
          <p className="text-xs text-gray-600">
            Imported! Green fields look right; yellow fields need a quick
            check.
          </p>
          <div className="flex flex-wrap gap-1.5">
            {Object.entries(result.confidence).map(([field, conf]) => (
              <span
                key={field}
                className={`rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ${
                  conf === "high"
                    ? "bg-green-50 text-green-700 ring-green-200"
                    : "bg-yellow-50 text-yellow-700 ring-yellow-200"
                }`}
              >
                {FIELD_LABELS[field] ?? field}
              </span>
            ))}
          </div>
          {result.warnings.map((w, i) => (
            <p key={i} className="text-xs text-amber-700">
              ⚠ {w}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
