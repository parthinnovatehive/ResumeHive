import React from 'react';
import type { ResumeFormData } from '@/lib/validations/resume.schema';

export function CompactTemplate({ data }: { data: ResumeFormData }) {
  return (
    <div className="w-full text-[9.5pt] font-sans text-[#1a1a1a] leading-[1.35] bg-white">
      <div className="mb-3 text-center">
        <h1 className="text-[20pt] font-bold tracking-tight text-[#000] mb-0.5">{data.full_name || "Your Name"}</h1>
        <div className="text-[8.5pt] text-[#444] flex justify-center gap-3 flex-wrap">
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
              <h2 className="text-[10pt] font-bold uppercase tracking-wider text-[#000] border-b border-[#ccc] pb-[1px] mb-[3px]">Summary</h2>
              <div className="text-[9pt] leading-[1.4] text-[#222] whitespace-pre-wrap">{data.summary}</div>
            </div>
          );
        }
        if (section === 'experience' && data.experience?.length) {
          return (
            <div key="experience" className="mb-[8px] resume-section">
              <h2 className="text-[10pt] font-bold uppercase tracking-wider text-[#000] border-b border-[#ccc] pb-[1px] mb-[3px]">Experience</h2>
              {data.experience.map((exp, i) => (
                <div key={i} className="mb-[5px] resume-entry">
                  <div className="flex justify-between items-baseline">
                    <span className="font-bold text-[9.5pt] text-[#000]">{exp.title} <span className="font-normal text-[#444] ml-1">| {exp.company}</span></span>
                    <span className="text-[8.5pt] text-[#555] ml-2 whitespace-nowrap">{exp.start_date} – {exp.end_date}{exp.is_current ? ' (Present)' : ''}</span>
                  </div>
                  {exp.description && <div className="text-[9pt] mt-[1px] leading-[1.35] text-[#222] whitespace-pre-wrap">{exp.description}</div>}
                </div>
              ))}
            </div>
          );
        }
        if (section === 'education' && data.education?.length) {
          return (
            <div key="education" className="mb-[8px] resume-section">
              <h2 className="text-[10pt] font-bold uppercase tracking-wider text-[#000] border-b border-[#ccc] pb-[1px] mb-[3px]">Education</h2>
              {data.education.map((edu, i) => (
                <div key={i} className="mb-[4px] resume-entry">
                  <div className="flex justify-between items-baseline">
                    <span className="font-bold text-[9.5pt] text-[#000]">{edu.institution}</span>
                    <span className="text-[8.5pt] text-[#555] ml-2 whitespace-nowrap">{edu.start_date} – {edu.end_date}</span>
                  </div>
                  <div className="text-[9pt] text-[#222]">{edu.degree}{edu.field_of_study ? ` in ${edu.field_of_study}` : ''}{edu.gpa ? ` | GPA: ${edu.gpa}` : ''}</div>
                </div>
              ))}
            </div>
          );
        }
        if (section === 'projects' && data.projects?.length) {
          return (
            <div key="projects" className="mb-[8px] resume-section">
              <h2 className="text-[10pt] font-bold uppercase tracking-wider text-[#000] border-b border-[#ccc] pb-[1px] mb-[3px]">Projects</h2>
              {data.projects.map((proj, i) => (
                <div key={i} className="mb-[5px] resume-entry">
                  <div className="flex justify-between items-baseline">
                    <span className="font-bold text-[9.5pt] text-[#000]">{proj.name} {proj.link && <span className="font-normal text-[#555] ml-2 text-[8.5pt]">{proj.link}</span>}</span>
                  </div>
                  {proj.technologies && <div className="text-[8.5pt] text-[#555] italic mb-[1px]">{proj.technologies}</div>}
                  {proj.description && <div className="text-[9pt] leading-[1.35] text-[#222] whitespace-pre-wrap">{proj.description}</div>}
                </div>
              ))}
            </div>
          );
        }
        if (section === 'skills' && data.skills?.length) {
          return (
            <div key="skills" className="mb-[8px] resume-section">
              <h2 className="text-[10pt] font-bold uppercase tracking-wider text-[#000] border-b border-[#ccc] pb-[1px] mb-[3px]">Skills</h2>
              <div className="text-[9pt] text-[#222] leading-[1.4]">{data.skills.join(' • ')}</div>
            </div>
          );
        }
        if (section === 'certifications' && data.certifications?.length) {
          return (
            <div key="certifications" className="mb-[8px] resume-section">
              <h2 className="text-[10pt] font-bold uppercase tracking-wider text-[#000] border-b border-[#ccc] pb-[1px] mb-[3px]">Certifications</h2>
              <div className="text-[9pt] text-[#222] leading-[1.4]">{data.certifications.join(' • ')}</div>
            </div>
          );
        }
        return null;
      })}
    </div>
  );
}
