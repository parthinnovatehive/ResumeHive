import React from 'react';
import type { ResumeFormData } from '@/lib/validations/resume.schema';

export function MinimalTemplate({ data }: { data: ResumeFormData }) {
  return (
    <div className="w-full text-[10pt] font-sans text-[#333] leading-[1.6] bg-white">
      <div className="mb-10 text-center">
        <h1 className="text-[24pt] font-light tracking-[2px] text-[#000] uppercase mb-4">{data.full_name || "Your Name"}</h1>
        <div className="text-[9pt] text-[#666] flex justify-center gap-6 flex-wrap tracking-wider uppercase">
          {data.email && <span>{data.email}</span>}
          {data.phone && <span>{data.phone}</span>}
          {data.location && <span>{data.location}</span>}
          {data.linkedin_url && <span>{data.linkedin_url}</span>}
        </div>
      </div>

      {data.section_order.map(section => {
        if (section === 'summary' && data.summary) {
          return (
            <div key="summary" className="mb-8 resume-section">
              <div className="text-[10.5pt] leading-[1.8] text-[#444] whitespace-pre-wrap text-center max-w-4xl mx-auto">{data.summary}</div>
            </div>
          );
        }
        if (section === 'experience' && data.experience?.length) {
          return (
            <div key="experience" className="mb-8 resume-section">
              <h2 className="text-[9pt] font-bold uppercase tracking-[3px] text-[#999] mb-6 text-center">Experience</h2>
              {data.experience.map((exp, i) => (
                <div key={i} className="mb-6 resume-entry">
                  <div className="flex justify-between items-baseline mb-1">
                    <span className="font-semibold text-[11pt] text-[#000]">{exp.title}</span>
                    <span className="text-[9pt] text-[#888] tracking-wider whitespace-nowrap">{exp.start_date} – {exp.end_date}{exp.is_current ? ' (Present)' : ''}</span>
                  </div>
                  <div className="text-[10pt] text-[#555] mb-3">{exp.company}</div>
                  {exp.description && <div className="text-[10pt] leading-[1.7] text-[#444] whitespace-pre-wrap">{exp.description}</div>}
                </div>
              ))}
            </div>
          );
        }
        if (section === 'education' && data.education?.length) {
          return (
            <div key="education" className="mb-8 resume-section">
              <h2 className="text-[9pt] font-bold uppercase tracking-[3px] text-[#999] mb-6 text-center">Education</h2>
              {data.education.map((edu, i) => (
                <div key={i} className="mb-6 resume-entry">
                  <div className="flex justify-between items-baseline mb-1">
                    <span className="font-semibold text-[11pt] text-[#000]">{edu.institution}</span>
                    <span className="text-[9pt] text-[#888] tracking-wider whitespace-nowrap">{edu.start_date} – {edu.end_date}</span>
                  </div>
                  <div className="text-[10pt] text-[#555]">{edu.degree}{edu.field_of_study ? ` in ${edu.field_of_study}` : ''}</div>
                  {edu.gpa && <div className="text-[9pt] text-[#888] mt-1">GPA: {edu.gpa}</div>}
                </div>
              ))}
            </div>
          );
        }
        if (section === 'projects' && data.projects?.length) {
          return (
            <div key="projects" className="mb-8 resume-section">
              <h2 className="text-[9pt] font-bold uppercase tracking-[3px] text-[#999] mb-6 text-center">Projects</h2>
              {data.projects.map((proj, i) => (
                <div key={i} className="mb-6 resume-entry">
                  <div className="flex justify-between items-baseline mb-1">
                    <span className="font-semibold text-[11pt] text-[#000]">{proj.name}</span>
                    {proj.link && <span className="text-[9pt] text-[#888] whitespace-nowrap">{proj.link}</span>}
                  </div>
                  {proj.technologies && <div className="text-[9pt] text-[#888] mb-2">{proj.technologies}</div>}
                  {proj.description && <div className="text-[10pt] leading-[1.7] text-[#444] whitespace-pre-wrap">{proj.description}</div>}
                </div>
              ))}
            </div>
          );
        }
        if (section === 'skills' && data.skills?.length) {
          return (
            <div key="skills" className="mb-8 resume-section">
              <h2 className="text-[9pt] font-bold uppercase tracking-[3px] text-[#999] mb-6 text-center">Skills</h2>
              <div className="text-[10pt] text-[#444] leading-[2] text-center max-w-4xl mx-auto">
                {data.skills.join('   /   ')}
              </div>
            </div>
          );
        }
        if (section === 'certifications' && data.certifications?.length) {
          return (
            <div key="certifications" className="mb-8 resume-section">
              <h2 className="text-[9pt] font-bold uppercase tracking-[3px] text-[#999] mb-6 text-center">Certifications</h2>
              <div className="text-[10pt] text-[#444] leading-[2] text-center max-w-4xl mx-auto flex flex-col gap-2">
                {data.certifications.map((cert, i) => <div key={i}>{cert}</div>)}
              </div>
            </div>
          );
        }
        return null;
      })}
    </div>
  );
}
