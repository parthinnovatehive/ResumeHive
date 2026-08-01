import React from 'react';
import type { ResumeFormData } from '@/lib/validations/resume.schema';

export function ProfessionalTemplate({ data }: { data: ResumeFormData }) {
  return (
    <div className="w-full text-[10pt] font-serif text-[#1e293b] leading-[1.5] bg-white">
      <div className="mb-6 border-b-[3px] border-[#0f172a] pb-4">
        <h1 className="text-[28pt] font-bold tracking-tight text-[#0f172a] mb-2">{data.full_name || "Your Name"}</h1>
        <div className="text-[9.5pt] text-[#475569] flex gap-5 flex-wrap font-sans">
          {data.email && <span className="flex items-center gap-1">E: {data.email}</span>}
          {data.phone && <span className="flex items-center gap-1">P: {data.phone}</span>}
          {data.location && <span className="flex items-center gap-1">L: {data.location}</span>}
          {data.linkedin_url && <span className="flex items-center gap-1">In: {data.linkedin_url}</span>}
        </div>
      </div>

      {data.section_order.map(section => {
        if (section === 'summary' && data.summary) {
          return (
            <div key="summary" className="mb-[16px] resume-section">
              <h2 className="text-[12pt] font-bold uppercase tracking-[1.5px] text-[#0f172a] border-b border-slate-300 pb-[4px] mb-[8px]">Executive Summary</h2>
              <div className="text-[10.5pt] leading-[1.6] text-[#334155] whitespace-pre-wrap">{data.summary}</div>
            </div>
          );
        }
        if (section === 'experience' && data.experience?.length) {
          return (
            <div key="experience" className="mb-[16px] resume-section">
              <h2 className="text-[12pt] font-bold uppercase tracking-[1.5px] text-[#0f172a] border-b border-slate-300 pb-[4px] mb-[8px]">Professional Experience</h2>
              {data.experience.map((exp, i) => (
                <div key={i} className="mb-[12px] resume-entry">
                  <div className="flex justify-between items-baseline mb-[2px]">
                    <span className="font-bold text-[11pt] text-[#0f172a] font-sans">{exp.title}</span>
                    <span className="text-[10pt] font-semibold text-[#475569] ml-3 whitespace-nowrap font-sans">{exp.start_date} – {exp.end_date}{exp.is_current ? ' (Present)' : ''}</span>
                  </div>
                  <div className="text-[10.5pt] text-[#0f172a] font-bold mb-[4px] italic">{exp.company}</div>
                  {exp.description && <div className="text-[10.5pt] leading-[1.6] text-[#334155] whitespace-pre-wrap">{exp.description}</div>}
                </div>
              ))}
            </div>
          );
        }
        if (section === 'education' && data.education?.length) {
          return (
            <div key="education" className="mb-[16px] resume-section">
              <h2 className="text-[12pt] font-bold uppercase tracking-[1.5px] text-[#0f172a] border-b border-slate-300 pb-[4px] mb-[8px]">Education</h2>
              {data.education.map((edu, i) => (
                <div key={i} className="mb-[10px] resume-entry">
                  <div className="flex justify-between items-baseline mb-[2px]">
                    <span className="font-bold text-[11pt] text-[#0f172a] font-sans">{edu.institution}</span>
                    <span className="text-[10pt] font-semibold text-[#475569] ml-3 whitespace-nowrap font-sans">{edu.start_date} – {edu.end_date}</span>
                  </div>
                  <div className="text-[10.5pt] text-[#334155] font-semibold">{edu.degree}{edu.field_of_study ? ` in ${edu.field_of_study}` : ''}</div>
                  {edu.gpa && <div className="text-[10pt] text-[#64748b] mt-[2px]">GPA: {edu.gpa}</div>}
                </div>
              ))}
            </div>
          );
        }
        if (section === 'projects' && data.projects?.length) {
          return (
            <div key="projects" className="mb-[16px] resume-section">
              <h2 className="text-[12pt] font-bold uppercase tracking-[1.5px] text-[#0f172a] border-b border-slate-300 pb-[4px] mb-[8px]">Key Initiatives</h2>
              {data.projects.map((proj, i) => (
                <div key={i} className="mb-[12px] resume-entry">
                  <div className="flex justify-between items-baseline mb-[2px]">
                    <span className="font-bold text-[11pt] text-[#0f172a] font-sans">{proj.name}</span>
                    {proj.link && <span className="text-[10pt] text-[#475569] ml-3 whitespace-nowrap font-sans">{proj.link}</span>}
                  </div>
                  {proj.technologies && <div className="text-[10pt] text-[#475569] mb-[4px] italic">{proj.technologies}</div>}
                  {proj.description && <div className="text-[10.5pt] leading-[1.6] text-[#334155] whitespace-pre-wrap">{proj.description}</div>}
                </div>
              ))}
            </div>
          );
        }
        if (section === 'skills' && data.skills?.length) {
          return (
            <div key="skills" className="mb-[16px] resume-section">
              <h2 className="text-[12pt] font-bold uppercase tracking-[1.5px] text-[#0f172a] border-b border-slate-300 pb-[4px] mb-[8px]">Core Competencies</h2>
              <div className="text-[10.5pt] text-[#334155] leading-[1.6] font-sans flex flex-wrap gap-x-4 gap-y-2">
                {data.skills.map((skill, i) => (
                  <span key={i} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-[#cbd5e1] rounded-full"></span>
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          );
        }
        if (section === 'certifications' && data.certifications?.length) {
          return (
            <div key="certifications" className="mb-[16px] resume-section">
              <h2 className="text-[12pt] font-bold uppercase tracking-[1.5px] text-[#0f172a] border-b border-slate-300 pb-[4px] mb-[8px]">Certifications</h2>
              <ul className="ml-[20px] list-disc text-[10.5pt] text-[#334155] font-sans">
                {data.certifications.map((cert, i) => <li key={i} className="pl-1 mb-[4px]">{cert}</li>)}
              </ul>
            </div>
          );
        }
        return null;
      })}
    </div>
  );
}
