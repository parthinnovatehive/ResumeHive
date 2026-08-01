import React from 'react';
import type { ResumeFormData } from '@/lib/validations/resume.schema';

export function ClassicTemplate({ data }: { data: ResumeFormData }) {
  return (
    <div className="w-full text-[10.5pt] font-serif text-[#111] leading-[1.5] bg-white">
      <div className="text-center mb-6">
        <h1 className="text-[28pt] font-bold tracking-tight text-[#000] mb-2 uppercase">{data.full_name || "Your Name"}</h1>
        <div className="text-[10pt] text-[#333] flex justify-center gap-4 flex-wrap font-sans tracking-wide">
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
              <h2 className="text-[12pt] font-bold uppercase tracking-[2px] text-[#000] border-b-[2px] border-[#000] pb-[4px] mb-[8px]">Professional Summary</h2>
              <div className="text-[10.5pt] leading-[1.6] text-[#222] whitespace-pre-wrap">{data.summary}</div>
            </div>
          );
        }
        if (section === 'experience' && data.experience?.length) {
          return (
            <div key="experience" className="mb-[14px] resume-section">
              <h2 className="text-[12pt] font-bold uppercase tracking-[2px] text-[#000] border-b-[2px] border-[#000] pb-[4px] mb-[8px]">Experience</h2>
              {data.experience.map((exp, i) => (
                <div key={i} className="mb-[10px] resume-entry">
                  <div className="flex justify-between items-baseline mb-[2px]">
                    <span className="font-bold text-[11pt] text-[#000]">{exp.title}</span>
                    <span className="text-[10pt] text-[#333] ml-3 whitespace-nowrap italic">{exp.start_date} – {exp.end_date}{exp.is_current ? ' (Present)' : ''}</span>
                  </div>
                  <div className="text-[10.5pt] text-[#222] font-semibold mb-[4px]">{exp.company}</div>
                  {exp.description && <div className="text-[10.5pt] leading-[1.5] text-[#333] whitespace-pre-wrap">{exp.description}</div>}
                </div>
              ))}
            </div>
          );
        }
        if (section === 'education' && data.education?.length) {
          return (
            <div key="education" className="mb-[14px] resume-section">
              <h2 className="text-[12pt] font-bold uppercase tracking-[2px] text-[#000] border-b-[2px] border-[#000] pb-[4px] mb-[8px]">Education</h2>
              {data.education.map((edu, i) => (
                <div key={i} className="mb-[10px] resume-entry">
                  <div className="flex justify-between items-baseline mb-[2px]">
                    <span className="font-bold text-[11pt] text-[#000]">{edu.institution}</span>
                    <span className="text-[10pt] text-[#333] ml-3 whitespace-nowrap italic">{edu.start_date} – {edu.end_date}</span>
                  </div>
                  <div className="text-[10.5pt] text-[#222] font-semibold">{edu.degree}{edu.field_of_study ? ` in ${edu.field_of_study}` : ''}</div>
                  {edu.gpa && <div className="text-[10pt] text-[#444] mt-[2px]">GPA: {edu.gpa}</div>}
                </div>
              ))}
            </div>
          );
        }
        if (section === 'projects' && data.projects?.length) {
          return (
            <div key="projects" className="mb-[14px] resume-section">
              <h2 className="text-[12pt] font-bold uppercase tracking-[2px] text-[#000] border-b-[2px] border-[#000] pb-[4px] mb-[8px]">Projects</h2>
              {data.projects.map((proj, i) => (
                <div key={i} className="mb-[10px] resume-entry">
                  <div className="flex justify-between items-baseline mb-[2px]">
                    <span className="font-bold text-[11pt] text-[#000]">{proj.name}</span>
                    {proj.link && <span className="text-[10pt] text-[#333] ml-3 whitespace-nowrap">{proj.link}</span>}
                  </div>
                  {proj.technologies && <div className="text-[10pt] text-[#444] mb-[4px] italic">Technologies: {proj.technologies}</div>}
                  {proj.description && <div className="text-[10.5pt] leading-[1.5] text-[#333] whitespace-pre-wrap">{proj.description}</div>}
                </div>
              ))}
            </div>
          );
        }
        if (section === 'skills' && data.skills?.length) {
          return (
            <div key="skills" className="mb-[14px] resume-section">
              <h2 className="text-[12pt] font-bold uppercase tracking-[2px] text-[#000] border-b-[2px] border-[#000] pb-[4px] mb-[8px]">Skills</h2>
              <div className="text-[10.5pt] text-[#222] leading-[1.6]">{data.skills.join(', ')}</div>
            </div>
          );
        }
        if (section === 'certifications' && data.certifications?.length) {
          return (
            <div key="certifications" className="mb-[14px] resume-section">
              <h2 className="text-[12pt] font-bold uppercase tracking-[2px] text-[#000] border-b-[2px] border-[#000] pb-[4px] mb-[8px]">Certifications</h2>
              <ul className="ml-[20px] list-disc text-[10.5pt] text-[#222] leading-[1.6]">
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
