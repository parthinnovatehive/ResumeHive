import React from 'react';
import type { ResumeFormData } from '@/lib/validations/resume.schema';

export function ModernTemplate({ data }: { data: ResumeFormData }) {
  return (
    <div className="w-full text-[10.5pt] font-sans text-[#1a1a1a] leading-[1.45] bg-white">
      <div className="mb-6">
        <h1 className="text-[24pt] font-bold tracking-tight text-[#0f172a]">{data.full_name || "Your Name"}</h1>
        <div className="h-[3px] bg-blue-600 w-[64px] rounded-sm my-[6px]" />
        <div className="text-[9.5pt] text-[#475569] flex gap-4 flex-wrap mt-[8px]">
          {data.email && <span>{data.email}</span>}
          {data.phone && <span>{data.phone}</span>}
          {data.location && <span>{data.location}</span>}
          {data.linkedin_url && <span>{data.linkedin_url}</span>}
        </div>
      </div>

      {data.section_order.map(section => {
        if (section === 'summary' && data.summary) {
          return (
            <div key="summary" className="mb-[11px] resume-section">
              <h2 className="text-[11pt] font-bold uppercase tracking-[1.5px] text-blue-600 border-b-[1.5px] border-blue-100 pb-[2px] mb-[6px]">Professional Summary</h2>
              <div className="text-[10pt] mt-[2px] leading-[1.4] text-[#1e293b] whitespace-pre-wrap">{data.summary}</div>
            </div>
          );
        }
        if (section === 'experience' && data.experience?.length) {
          return (
            <div key="experience" className="mb-[11px] resume-section">
              <h2 className="text-[11pt] font-bold uppercase tracking-[1.5px] text-blue-600 border-b-[1.5px] border-blue-100 pb-[2px] mb-[6px]">Experience</h2>
              {data.experience.map((exp, i) => (
                <div key={i} className="mb-[7px] resume-entry">
                  <div className="flex justify-between items-baseline">
                    <span className="font-semibold text-[10.5pt] text-[#0f172a]">{exp.title}</span>
                    <span className="text-[9.5pt] text-[#64748b] ml-3 whitespace-nowrap">{exp.start_date} – {exp.end_date}{exp.is_current ? ' (Present)' : ''}</span>
                  </div>
                  <div className="text-[9.5pt] text-[#475569] mt-[1px]">{exp.company}</div>
                  {exp.description && <div className="text-[10pt] mt-[2px] leading-[1.4] text-[#1e293b] whitespace-pre-wrap">{exp.description}</div>}
                </div>
              ))}
            </div>
          );
        }
        if (section === 'education' && data.education?.length) {
          return (
            <div key="education" className="mb-[11px] resume-section">
              <h2 className="text-[11pt] font-bold uppercase tracking-[1.5px] text-blue-600 border-b-[1.5px] border-blue-100 pb-[2px] mb-[6px]">Education</h2>
              {data.education.map((edu, i) => (
                <div key={i} className="mb-[7px] resume-entry">
                  <div className="flex justify-between items-baseline">
                    <span className="font-semibold text-[10.5pt] text-[#0f172a]">{edu.institution}</span>
                    <span className="text-[9.5pt] text-[#64748b] ml-3 whitespace-nowrap">{edu.start_date} – {edu.end_date}</span>
                  </div>
                  <div className="text-[9.5pt] text-[#475569] mt-[1px]">{edu.degree}{edu.field_of_study ? ` in ${edu.field_of_study}` : ''}{edu.gpa ? ` | GPA: ${edu.gpa}` : ''}</div>
                </div>
              ))}
            </div>
          );
        }
        if (section === 'projects' && data.projects?.length) {
          return (
            <div key="projects" className="mb-[11px] resume-section">
              <h2 className="text-[11pt] font-bold uppercase tracking-[1.5px] text-blue-600 border-b-[1.5px] border-blue-100 pb-[2px] mb-[6px]">Projects</h2>
              {data.projects.map((proj, i) => (
                <div key={i} className="mb-[7px] resume-entry">
                  <div className="flex justify-between items-baseline">
                    <span className="font-semibold text-[10.5pt] text-[#0f172a]">{proj.name}</span>
                    {proj.link && <span className="text-[9.5pt] text-[#64748b] ml-3 whitespace-nowrap">{proj.link}</span>}
                  </div>
                  {proj.technologies && <div className="text-[9.5pt] text-[#475569] mt-[1px] italic">{proj.technologies}</div>}
                  {proj.description && <div className="text-[10pt] mt-[2px] leading-[1.4] text-[#1e293b] whitespace-pre-wrap">{proj.description}</div>}
                </div>
              ))}
            </div>
          );
        }
        if (section === 'skills' && data.skills?.length) {
          return (
            <div key="skills" className="mb-[11px] resume-section">
              <h2 className="text-[11pt] font-bold uppercase tracking-[1.5px] text-blue-600 border-b-[1.5px] border-blue-100 pb-[2px] mb-[6px]">Skills</h2>
              <div className="text-[10pt] text-[#1e293b] leading-[1.6]">{data.skills.join(' • ')}</div>
            </div>
          );
        }
        if (section === 'certifications' && data.certifications?.length) {
          return (
            <div key="certifications" className="mb-[11px] resume-section">
              <h2 className="text-[11pt] font-bold uppercase tracking-[1.5px] text-blue-600 border-b-[1.5px] border-blue-100 pb-[2px] mb-[6px]">Certifications</h2>
              <ul className="ml-[16px] list-disc text-[10pt] text-[#1e293b]">
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
