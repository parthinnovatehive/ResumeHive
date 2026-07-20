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
    <div className="rounded-lg border border-dashed border-gray-300 bg-white p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-gray-800">
            Have a resume already?
          </p>
          <p className="text-xs text-gray-500">
            Upload a PDF or DOCX and we&apos;ll pre-fill the form for you.
          </p>
        </div>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="shrink-0 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {uploading ? "Parsing..." : "Upload resume"}
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
