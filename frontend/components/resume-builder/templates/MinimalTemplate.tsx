import React from 'react';
import type { ResumeFormData } from '@/lib/validations/resume.schema';

export function MinimalTemplate({ data }: { data: ResumeFormData }) {
  return (
    <div className="w-full text-[10pt] font-sans text-[#1a1a1a] leading-[1.5] bg-white">
      <div className="mb-8">
        <h1 className="text-[20pt] font-light tracking-[2px] text-[#000] mb-2">{data.full_name || "Your Name"}</h1>
        <div className="text-[9pt] tracking-[0.5px] text-[#666] flex gap-4 flex-wrap">
          {data.email && <span>{data.email}</span>}
          {data.phone && <span>{data.phone}</span>}
          {data.location && <span>{data.location}</span>}
          {data.linkedin_url && <span>{data.linkedin_url}</span>}
        </div>
      </div>

      {data.section_order.map(section => {
        if (section === 'summary' && data.summary) {
          return (
            <div key="summary" className="mb-[14px] resume-section flex">
              <div className="w-[120px] shrink-0 text-[8.5pt] font-semibold uppercase tracking-[2px] text-[#888] pt-[2px]">Profile</div>
              <div className="flex-1 text-[10pt] leading-[1.5] text-[#222] whitespace-pre-wrap">{data.summary}</div>
            </div>
          );
        }
        if (section === 'experience' && data.experience?.length) {
          return (
            <div key="experience" className="mb-[14px] resume-section flex">
              <div className="w-[120px] shrink-0 text-[8.5pt] font-semibold uppercase tracking-[2px] text-[#888] pt-[2px]">Experience</div>
              <div className="flex-1">
                {data.experience.map((exp, i) => (
                  <div key={i} className="mb-[10px] resume-entry">
                    <div className="font-semibold text-[10pt] text-[#111]">{exp.title}</div>
                    <div className="text-[9pt] text-[#555] mb-[4px]">{exp.company} | {exp.start_date} – {exp.end_date}{exp.is_current ? ' (Present)' : ''}</div>
                    {exp.description && <div className="text-[10pt] leading-[1.5] text-[#333] whitespace-pre-wrap">{exp.description}</div>}
                  </div>
                ))}
              </div>
            </div>
          );
        }
        if (section === 'education' && data.education?.length) {
          return (
            <div key="education" className="mb-[14px] resume-section flex">
              <div className="w-[120px] shrink-0 text-[8.5pt] font-semibold uppercase tracking-[2px] text-[#888] pt-[2px]">Education</div>
              <div className="flex-1">
                {data.education.map((edu, i) => (
                  <div key={i} className="mb-[10px] resume-entry">
                    <div className="font-semibold text-[10pt] text-[#111]">{edu.institution}</div>
                    <div className="text-[9pt] text-[#555] mb-[2px]">{edu.start_date} – {edu.end_date}</div>
                    <div className="text-[10pt] text-[#333]">{edu.degree}{edu.field_of_study ? ` in ${edu.field_of_study}` : ''}{edu.gpa ? ` | GPA: ${edu.gpa}` : ''}</div>
                  </div>
                ))}
              </div>
            </div>
          );
        }
        if (section === 'projects' && data.projects?.length) {
          return (
            <div key="projects" className="mb-[14px] resume-section flex">
              <div className="w-[120px] shrink-0 text-[8.5pt] font-semibold uppercase tracking-[2px] text-[#888] pt-[2px]">Projects</div>
              <div className="flex-1">
                {data.projects.map((proj, i) => (
                  <div key={i} className="mb-[10px] resume-entry">
                    <div className="font-semibold text-[10pt] text-[#111]">{proj.name} {proj.link && <span className="font-normal text-[#555]">| {proj.link}</span>}</div>
                    {proj.technologies && <div className="text-[9pt] text-[#555] mb-[4px] italic">{proj.technologies}</div>}
                    {proj.description && <div className="text-[10pt] leading-[1.5] text-[#333] whitespace-pre-wrap">{proj.description}</div>}
                  </div>
                ))}
              </div>
            </div>
          );
        }
        if (section === 'skills' && data.skills?.length) {
          return (
            <div key="skills" className="mb-[14px] resume-section flex">
              <div className="w-[120px] shrink-0 text-[8.5pt] font-semibold uppercase tracking-[2px] text-[#888] pt-[2px]">Skills</div>
              <div className="flex-1 text-[10pt] text-[#333] leading-[1.6]">{data.skills.join(' · ')}</div>
            </div>
          );
        }
        if (section === 'certifications' && data.certifications?.length) {
          return (
            <div key="certifications" className="mb-[14px] resume-section flex">
              <div className="w-[120px] shrink-0 text-[8.5pt] font-semibold uppercase tracking-[2px] text-[#888] pt-[2px]">Awards</div>
              <ul className="flex-1 ml-[16px] list-disc text-[10pt] text-[#333]">
                {data.certifications.map((cert, i) => <li key={i} className="mb-[2px]">{cert}</li>)}
              </ul>
            </div>
          );
        }
        return null;
      })}
    </div>
  );
}
