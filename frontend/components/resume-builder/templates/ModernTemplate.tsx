import React from 'react';
import type { ResumeFormData } from '@/lib/validations/resume.schema';

export function ModernTemplate({ data }: { data: ResumeFormData }) {
  return (
    <div className="w-full text-[10pt] font-sans text-[#1f2937] leading-[1.5] bg-white">
      <div className="mb-6 flex flex-col items-center">
        <h1 className="text-[26pt] font-extrabold tracking-tight text-[#0f172a] uppercase">{data.full_name || "Your Name"}</h1>
        <div className="h-[4px] bg-indigo-600 w-[40px] mt-[6px] mb-[10px]" />
        <div className="text-[9.5pt] text-[#475569] flex gap-4 flex-wrap justify-center font-medium">
          {data.email && <span>{data.email}</span>}
          {data.phone && <span>{data.phone}</span>}
          {data.location && <span>{data.location}</span>}
          {data.linkedin_url && <span>{data.linkedin_url}</span>}
        </div>
      </div>

      {data.section_order.map(section => {
        if (section === 'summary' && data.summary) {
          return (
            <div key="summary" className="mb-[14px] resume-section">
              <h2 className="text-[11pt] font-bold uppercase tracking-[1.5px] text-indigo-600 mb-[6px]">Professional Summary</h2>
              <div className="text-[10.5pt] leading-[1.5] text-[#374151] whitespace-pre-wrap">{data.summary}</div>
            </div>
          );
        }
        if (section === 'experience' && data.experience?.length) {
          return (
            <div key="experience" className="mb-[14px] resume-section">
              <h2 className="text-[11pt] font-bold uppercase tracking-[1.5px] text-indigo-600 mb-[6px]">Experience</h2>
              {data.experience.map((exp, i) => (
                <div key={i} className="mb-[10px] resume-entry relative pl-4 border-l-2 border-slate-200">
                  <div className="absolute w-2 h-2 bg-indigo-500 rounded-full -left-[5px] top-[6px]"></div>
                  <div className="flex justify-between items-baseline mb-[2px]">
                    <span className="font-bold text-[11pt] text-[#111827]">{exp.title}</span>
                    <span className="text-[9pt] font-semibold text-indigo-600 ml-3 whitespace-nowrap bg-indigo-50 px-2 py-0.5 rounded">{exp.start_date} – {exp.end_date}{exp.is_current ? ' (Present)' : ''}</span>
                  </div>
                  <div className="text-[10pt] text-[#4b5563] font-medium mb-[4px]">{exp.company}</div>
                  {exp.description && <div className="text-[10.5pt] leading-[1.5] text-[#374151] whitespace-pre-wrap">{exp.description}</div>}
                </div>
              ))}
            </div>
          );
        }
        if (section === 'education' && data.education?.length) {
          return (
            <div key="education" className="mb-[14px] resume-section">
              <h2 className="text-[11pt] font-bold uppercase tracking-[1.5px] text-indigo-600 mb-[6px]">Education</h2>
              {data.education.map((edu, i) => (
                <div key={i} className="mb-[10px] resume-entry relative pl-4 border-l-2 border-slate-200">
                  <div className="absolute w-2 h-2 bg-indigo-500 rounded-full -left-[5px] top-[6px]"></div>
                  <div className="flex justify-between items-baseline mb-[2px]">
                    <span className="font-bold text-[11pt] text-[#111827]">{edu.institution}</span>
                    <span className="text-[9pt] font-semibold text-indigo-600 ml-3 whitespace-nowrap bg-indigo-50 px-2 py-0.5 rounded">{edu.start_date} – {edu.end_date}</span>
                  </div>
                  <div className="text-[10pt] text-[#4b5563] font-medium">{edu.degree}{edu.field_of_study ? ` in ${edu.field_of_study}` : ''}</div>
                  {edu.gpa && <div className="text-[9.5pt] text-[#6b7280] mt-[2px]">GPA: {edu.gpa}</div>}
                </div>
              ))}
            </div>
          );
        }
        if (section === 'projects' && data.projects?.length) {
          return (
            <div key="projects" className="mb-[14px] resume-section">
              <h2 className="text-[11pt] font-bold uppercase tracking-[1.5px] text-indigo-600 mb-[6px]">Projects</h2>
              {data.projects.map((proj, i) => (
                <div key={i} className="mb-[10px] resume-entry relative pl-4 border-l-2 border-slate-200">
                  <div className="absolute w-2 h-2 bg-indigo-500 rounded-full -left-[5px] top-[6px]"></div>
                  <div className="flex justify-between items-baseline mb-[2px]">
                    <span className="font-bold text-[11pt] text-[#111827]">{proj.name}</span>
                    {proj.link && <span className="text-[9pt] text-indigo-500 ml-3 whitespace-nowrap">{proj.link}</span>}
                  </div>
                  {proj.technologies && <div className="text-[9.5pt] text-[#6b7280] font-medium mb-[4px]">{proj.technologies}</div>}
                  {proj.description && <div className="text-[10.5pt] leading-[1.5] text-[#374151] whitespace-pre-wrap">{proj.description}</div>}
                </div>
              ))}
            </div>
          );
        }
        if (section === 'skills' && data.skills?.length) {
          return (
            <div key="skills" className="mb-[14px] resume-section">
              <h2 className="text-[11pt] font-bold uppercase tracking-[1.5px] text-indigo-600 mb-[6px]">Skills</h2>
              <div className="flex flex-wrap gap-2">
                {data.skills.map((skill, i) => (
                  <span key={i} className="px-3 py-1 bg-slate-100 text-[#374151] text-[9.5pt] font-medium rounded">{skill}</span>
                ))}
              </div>
            </div>
          );
        }
        if (section === 'certifications' && data.certifications?.length) {
          return (
            <div key="certifications" className="mb-[14px] resume-section">
              <h2 className="text-[11pt] font-bold uppercase tracking-[1.5px] text-indigo-600 mb-[6px]">Certifications</h2>
              <ul className="ml-[18px] list-disc text-[10.5pt] text-[#374151] leading-[1.6]">
                {data.certifications.map((cert, i) => <li key={i} className="pl-1 mb-[2px]">{cert}</li>)}
              </ul>
            </div>
          );
        }
        return null;
      })}
    </div>
  );
}
