"use client";

import React from "react";
import type { ResumeFormData } from "@/lib/validations/resume.schema";
import type { TemplateName } from "@/types/resume";

interface SectionProps {
  section: string;
  data: ResumeFormData;
  template: TemplateName;
}

/* ════════════════════════════════════════════════════════════════════
   Section renderer — all templates are single-column (ATS-safe); they
   differ only in typography and accent colors.
   ════════════════════════════════════════════════════════════════════ */

export function ResumePreview({ section, data, template }: SectionProps) {
  const isMinimal = template === "minimal";
  const bodyText =
    template === "compact" ? "text-[9.5pt]" : "text-[10pt]";

  switch (section) {
    case "summary":
      if (!data.summary) return null;
      return (
        <div className="mb-3">
          <SectionTitle template={template}>
            {template === "compact" ? "Summary" : "Professional Summary"}
          </SectionTitle>
          <p className={`${bodyText} leading-relaxed`}>{data.summary}</p>
        </div>
      );

    case "experience":
      if (!data.experience?.length) return null;
      return (
        <div className="mb-3">
          <SectionTitle template={template}>Experience</SectionTitle>
          {data.experience.map((exp, i) => (
            <div key={i} className="mb-2">
              <div className="flex justify-between font-semibold">
                <span>
                  {exp.title}
                  {template === "compact" && exp.company
                    ? ` — ${exp.company}`
                    : ""}
                </span>
                <span className="text-[9.5pt] font-normal text-gray-500">
                  {exp.start_date}
                  {exp.end_date ? ` – ${exp.end_date}` : ""}
                  {exp.is_current ? " (Present)" : ""}
                </span>
              </div>
              {template !== "compact" && (
                <div className="text-[9.5pt] text-gray-500">{exp.company}</div>
              )}
              {exp.description && (
                <p className={`mt-1 ${bodyText} leading-relaxed`}>
                  {exp.description}
                </p>
              )}
            </div>
          ))}
        </div>
      );

    case "education":
      if (!data.education?.length) return null;
      return (
        <div className="mb-3">
          <SectionTitle template={template}>Education</SectionTitle>
          {data.education.map((edu, i) => (
            <div key={i} className="mb-2">
              <div className="flex justify-between font-semibold">
                <span>{edu.institution}</span>
                <span className="text-[9.5pt] font-normal text-gray-500">
                  {edu.start_date}
                  {edu.end_date ? ` – ${edu.end_date}` : ""}
                </span>
              </div>
              <div className="text-[9.5pt] text-gray-500">
                {edu.degree}
                {edu.field_of_study ? ` in ${edu.field_of_study}` : ""}
                {edu.gpa ? ` | GPA: ${edu.gpa}` : ""}
              </div>
            </div>
          ))}
        </div>
      );

    case "projects":
      if (!data.projects?.length) return null;
      return (
        <div className="mb-3">
          <SectionTitle template={template}>Projects</SectionTitle>
          {data.projects.map((proj, i) => (
            <div key={i} className="mb-2">
              <div className="flex justify-between font-semibold">
                <span>
                  {proj.name}
                  {template === "compact" && proj.technologies
                    ? ` (${proj.technologies})`
                    : ""}
                </span>
                {proj.link && (
                  <span className="text-[9.5pt] font-normal text-blue-600">
                    {proj.link}
                  </span>
                )}
              </div>
              {template !== "compact" && proj.technologies && (
                <p className="text-[9.5pt] italic text-gray-500">
                  {proj.technologies}
                </p>
              )}
              {proj.description && (
                <p className={`mt-1 ${bodyText} leading-relaxed`}>
                  {proj.description}
                </p>
              )}
            </div>
          ))}
        </div>
      );

    case "skills":
      if (!data.skills?.length) return null;
      if (isMinimal || template === "compact" || template === "professional") {
        const sep =
          template === "compact" ? " | " : template === "professional" ? ", " : " · ";
        return (
          <div className="mb-3">
            <SectionTitle template={template}>Skills</SectionTitle>
            <p className={`${bodyText} text-gray-700`}>
              {data.skills.join(sep)}
            </p>
          </div>
        );
      }
      // classic & modern: separator dots inline (modern PDF uses •)
      return (
        <div className="mb-3">
          <SectionTitle template={template}>Skills</SectionTitle>
          {template === "modern" ? (
            <p className={`${bodyText} text-gray-700`}>
              {data.skills.join(" • ")}
            </p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {data.skills.map((sk, i) => (
                <span
                  key={i}
                  className="rounded bg-gray-100 px-2 py-0.5 text-[9.5pt]"
                >
                  {sk}
                </span>
              ))}
            </div>
          )}
        </div>
      );

    case "certifications":
      if (!data.certifications?.length) return null;
      return (
        <div className="mb-3">
          <SectionTitle template={template}>Certifications</SectionTitle>
          <ul className="list-disc pl-5">
            {data.certifications.map((cert, i) => (
              <li key={i} className={bodyText}>
                {cert}
              </li>
            ))}
          </ul>
        </div>
      );

    default:
      return null;
  }
}

/* ════════════════════════════════════════════════════════════════════
   Header — single column for every template
   ════════════════════════════════════════════════════════════════════ */

export function PreviewHeader({
  data,
  template = "classic",
}: {
  data: ResumeFormData;
  template?: TemplateName;
}) {
  const isMinimal = template === "minimal";

  return (
    <div className="mb-2">
      <h1
        className={
          template === "minimal"
            ? "text-[20pt] font-normal tracking-widest"
            : template === "modern"
              ? "text-[22pt] font-bold text-slate-900"
              : template === "professional"
                ? "font-serif text-[21pt] font-bold text-[#1e3a5f]"
                : template === "compact"
                  ? "text-[18pt] font-bold"
                  : "text-[22pt] font-bold"
        }
      >
        {data.full_name || "Your Name"}
      </h1>
      {template === "modern" && (
        <div className="mt-1 h-[3px] w-16 rounded bg-blue-600" />
      )}
      <div
        className={`mt-1 flex flex-wrap gap-x-3 text-[9.5pt] ${
          isMinimal ? "tracking-wide text-gray-500" : "text-gray-500"
        }`}
      >
        {data.email && <span>{data.email}</span>}
        {data.phone && <span>{data.phone}</span>}
        {data.location && <span>{data.location}</span>}
        {data.linkedin_url && <span>{data.linkedin_url}</span>}
      </div>
      <hr
        className={`my-2 ${
          template === "professional"
            ? "border-t-2 border-[#1e3a5f]"
            : template === "compact"
              ? "border-t-2 border-gray-800"
              : isMinimal
                ? "border-gray-200"
                : template === "modern"
                  ? "border-blue-100"
                  : "border-gray-300"
        }`}
      />
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════
   Shared sub-components
   ════════════════════════════════════════════════════════════════════ */

function SectionTitle({
  children,
  template,
}: {
  children: React.ReactNode;
  template: TemplateName;
}) {
  switch (template) {
    case "minimal":
      return (
        <h3 className="mb-1 text-[9pt] font-semibold uppercase tracking-[2.5px] text-gray-400">
          {children}
        </h3>
      );
    case "modern":
      return (
        <h3 className="mb-1.5 border-b border-blue-200 pb-0.5 text-[11pt] font-bold uppercase tracking-wider text-blue-700">
          {children}
        </h3>
      );
    case "professional":
      return (
        <h3 className="mb-1 font-serif text-[11.5pt] font-bold uppercase tracking-wide text-[#1e3a5f]">
          {children}
        </h3>
      );
    case "compact":
      return (
        <h3 className="mb-1 bg-gray-100 px-1.5 py-0.5 text-[10.5pt] font-bold uppercase tracking-wide">
          {children}
        </h3>
      );
    default:
      return (
        <h3 className="mb-1 border-b border-gray-300 pb-0.5 text-[11.5pt] font-bold uppercase tracking-wide">
          {children}
        </h3>
      );
  }
}
