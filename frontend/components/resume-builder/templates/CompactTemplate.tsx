import React from 'react';
import type { ResumeFormData } from '@/lib/validations/resume.schema';

export function CompactTemplate({ data }: { data: ResumeFormData }) {
  return (
    <div className="w-full text-[9.5pt] font-sans text-[#000] leading-[1.3] bg-white">
      <div className="text-center mb-3">
        <h1 className="text-[18pt] font-bold tracking-tight text-[#000] mb-0">{data.full_name || "Your Name"}</h1>
        <div className="w-full h-[1.5px] bg-[#000] mt-1 mb-1"></div>
        <div className="text-[8.5pt] text-[#333] flex justify-center gap-3 flex-wrap">
          {data.email && <span>{data.email}</span>}
          {data.phone && <span>{data.phone}</span>}
          {data.location && <span>{data.location}</span>}
          {data.linkedin_url && <span>{data.linkedin_url}</span>}
        </div>
      </div>

      {data.section_order.map(section => {
        if (section === 'summary' && data.summary) {
          return (
            <div key="summary" className="mb-[8px] resume-section">
              <h2 className="text-[10pt] font-bold uppercase text-[#000] bg-gray-100 px-1 py-0.5 mb-[4px]">Summary</h2>
              <div className="text-[9.5pt] leading-[1.3] text-[#111] whitespace-pre-wrap">{data.summary}</div>
            </div>
          );
        }
        if (section === 'experience' && data.experience?.length) {
          return (
            <div key="experience" className="mb-[8px] resume-section">
              <h2 className="text-[10pt] font-bold uppercase text-[#000] bg-gray-100 px-1 py-0.5 mb-[4px]">Experience</h2>
              {data.experience.map((exp, i) => (
                <div key={i} className="mb-[5px] resume-entry">
                  <div className="flex justify-between items-baseline">
                    <span className="font-bold text-[9.5pt] text-[#000]">{exp.title}{exp.company ? ` — ${exp.company}` : ''}</span>
                    <span className="text-[8.5pt] text-[#444] ml-2 whitespace-nowrap">{exp.start_date} – {exp.end_date}{exp.is_current ? ' (Present)' : ''}</span>
                  </div>
                  {exp.description && <div className="text-[9.5pt] mt-[1px] leading-[1.3] text-[#111] whitespace-pre-wrap">{exp.description}</div>}
                </div>
              ))}
            </div>
          );
        }
        if (section === 'education' && data.education?.length) {
          return (
            <div key="education" className="mb-[8px] resume-section">
              <h2 className="text-[10pt] font-bold uppercase text-[#000] bg-gray-100 px-1 py-0.5 mb-[4px]">Education</h2>
              {data.education.map((edu, i) => (
                <div key={i} className="mb-[5px] resume-entry">
                  <div className="flex justify-between items-baseline">
                    <span className="font-bold text-[9.5pt] text-[#000]">{edu.institution}</span>
                    <span className="text-[8.5pt] text-[#444] ml-2 whitespace-nowrap">{edu.start_date} – {edu.end_date}</span>
                  </div>
                  <div className="text-[9.5pt] text-[#222] mt-[1px]">{edu.degree}{edu.field_of_study ? ` in ${edu.field_of_study}` : ''}{edu.gpa ? ` | GPA: ${edu.gpa}` : ''}</div>
                </div>
              ))}
            </div>
          );
        }
        if (section === 'projects' && data.projects?.length) {
          return (
            <div key="projects" className="mb-[8px] resume-section">
              <h2 className="text-[10pt] font-bold uppercase text-[#000] bg-gray-100 px-1 py-0.5 mb-[4px]">Projects</h2>
              {data.projects.map((proj, i) => (
                <div key={i} className="mb-[5px] resume-entry">
                  <div className="flex justify-between items-baseline">
                    <span className="font-bold text-[9.5pt] text-[#000]">{proj.name}{proj.technologies ? ` (${proj.technologies})` : ''}</span>
                    {proj.link && <span className="text-[8.5pt] text-[#444] ml-2 whitespace-nowrap">{proj.link}</span>}
                  </div>
                  {proj.description && <div className="text-[9.5pt] mt-[1px] leading-[1.3] text-[#111] whitespace-pre-wrap">{proj.description}</div>}
                </div>
              ))}
            </div>
          );
        }
        if (section === 'skills' && data.skills?.length) {
          return (
            <div key="skills" className="mb-[8px] resume-section">
              <h2 className="text-[10pt] font-bold uppercase text-[#000] bg-gray-100 px-1 py-0.5 mb-[4px]">Skills</h2>
              <div className="text-[9.5pt] text-[#111] leading-[1.4]">{data.skills.join(' | ')}</div>
            </div>
          );
        }
        if (section === 'certifications' && data.certifications?.length) {
          return (
            <div key="certifications" className="mb-[8px] resume-section">
              <h2 className="text-[10pt] font-bold uppercase text-[#000] bg-gray-100 px-1 py-0.5 mb-[4px]">Certifications</h2>
              <ul className="ml-[14px] list-disc text-[9.5pt] text-[#111]">
                {data.certifications.map((cert, i) => <li key={i} className="mb-[1px]">{cert}</li>)}
              </ul>
            </div>
          );
        }
        return null;
      })}
    </div>
  );
}
