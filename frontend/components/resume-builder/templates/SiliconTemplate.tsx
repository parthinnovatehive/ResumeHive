import React from 'react';
import type { ResumeFormData } from '@/lib/validations/resume.schema';

export function SiliconTemplate({ data }: { data: ResumeFormData }) {
  return (
    <div className="w-full text-[10.5pt] font-sans text-[#111827] leading-[1.5] bg-white">
      {/* HEADER - Two Column High Contrast */}
      <div className="mb-6 flex flex-col md:flex-row justify-between md:items-end border-b-[3px] border-[#111827] pb-4">
        <div>
          <h1 className="text-[28pt] font-extrabold tracking-tighter text-[#111827] uppercase leading-[1]">{data.full_name || "Your Name"}</h1>
        </div>
        <div className="text-[9.5pt] font-medium text-[#4b5563] flex flex-col md:text-right mt-2 md:mt-0">
          {data.email && <span>{data.email}</span>}
          {data.phone && <span>{data.phone}</span>}
          {data.location && <span>{data.location}</span>}
          {data.linkedin_url && <span>{data.linkedin_url}</span>}
        </div>
      </div>

      {data.section_order.map(section => {
        if (section === 'summary' && data.summary) {
          return (
            <div key="summary" className="mb-[14px] resume-section flex flex-col md:flex-row gap-4">
              <div className="md:w-[120px] shrink-0">
                <h2 className="text-[10pt] font-bold uppercase tracking-[2px] text-[#4b5563]">Profile</h2>
              </div>
              <div className="flex-1 text-[10.5pt] text-[#1f2937] whitespace-pre-wrap leading-[1.6]">
                {data.summary}
              </div>
            </div>
          );
        }
        if (section === 'experience' && data.experience?.length) {
          return (
            <div key="experience" className="mb-[14px] resume-section flex flex-col md:flex-row gap-4">
              <div className="md:w-[120px] shrink-0">
                <h2 className="text-[10pt] font-bold uppercase tracking-[2px] text-[#4b5563]">Experience</h2>
              </div>
              <div className="flex-1">
                {data.experience.map((exp, i) => (
                  <div key={i} className="mb-[10px] resume-entry">
                    <div className="flex justify-between items-baseline mb-[2px]">
                      <span className="font-bold text-[11pt] text-[#111827]">{exp.title}</span>
                      <span className="text-[9.5pt] font-semibold text-[#111827] tracking-wider whitespace-nowrap bg-gray-100 px-2 py-0.5 rounded">{exp.start_date} – {exp.end_date}{exp.is_current ? ' (Present)' : ''}</span>
                    </div>
                    <div className="text-[10pt] text-[#4b5563] font-medium mb-[4px] uppercase tracking-wide">{exp.company}</div>
                    {exp.description && <div className="text-[10.5pt] leading-[1.5] text-[#1f2937] whitespace-pre-wrap">{exp.description}</div>}
                  </div>
                ))}
              </div>
            </div>
          );
        }
        if (section === 'education' && data.education?.length) {
          return (
            <div key="education" className="mb-[14px] resume-section flex flex-col md:flex-row gap-4">
              <div className="md:w-[120px] shrink-0">
                <h2 className="text-[10pt] font-bold uppercase tracking-[2px] text-[#4b5563]">Education</h2>
              </div>
              <div className="flex-1">
                {data.education.map((edu, i) => (
                  <div key={i} className="mb-[8px] resume-entry">
                    <div className="flex justify-between items-baseline mb-[2px]">
                      <span className="font-bold text-[11pt] text-[#111827]">{edu.institution}</span>
                      <span className="text-[9.5pt] font-semibold text-[#111827] tracking-wider whitespace-nowrap bg-gray-100 px-2 py-0.5 rounded">{edu.start_date} – {edu.end_date}</span>
                    </div>
                    <div className="text-[10.5pt] text-[#4b5563]">{edu.degree}{edu.field_of_study ? ` in ${edu.field_of_study}` : ''}{edu.gpa ? ` | GPA: ${edu.gpa}` : ''}</div>
                  </div>
                ))}
              </div>
            </div>
          );
        }
        if (section === 'projects' && data.projects?.length) {
          return (
            <div key="projects" className="mb-[14px] resume-section flex flex-col md:flex-row gap-4">
              <div className="md:w-[120px] shrink-0">
                <h2 className="text-[10pt] font-bold uppercase tracking-[2px] text-[#4b5563]">Projects</h2>
              </div>
              <div className="flex-1">
                {data.projects.map((proj, i) => (
                  <div key={i} className="mb-[10px] resume-entry">
                    <div className="flex justify-between items-baseline mb-[2px]">
                      <span className="font-bold text-[11pt] text-[#111827]">{proj.name}</span>
                      {proj.link && <span className="text-[9.5pt] text-[#4b5563] underline whitespace-nowrap">{proj.link}</span>}
                    </div>
                    {proj.technologies && <div className="text-[9.5pt] text-[#6b7280] font-medium tracking-wide mb-[4px] uppercase">{proj.technologies}</div>}
                    {proj.description && <div className="text-[10.5pt] leading-[1.5] text-[#1f2937] whitespace-pre-wrap">{proj.description}</div>}
                  </div>
                ))}
              </div>
            </div>
          );
        }
        if (section === 'skills' && data.skills?.length) {
          return (
            <div key="skills" className="mb-[14px] resume-section flex flex-col md:flex-row gap-4">
              <div className="md:w-[120px] shrink-0">
                <h2 className="text-[10pt] font-bold uppercase tracking-[2px] text-[#4b5563]">Skills</h2>
              </div>
              <div className="flex-1 text-[10.5pt] text-[#1f2937] leading-[1.8] font-medium flex flex-wrap gap-x-3 gap-y-1">
                {data.skills.map((skill, i) => (
                  <span key={i} className="inline-block relative">
                    {skill}
                    {i < data.skills.length - 1 && <span className="absolute -right-[8px] top-1/2 -translate-y-1/2 w-1 h-1 bg-[#d1d5db] rounded-full"></span>}
                  </span>
                ))}
              </div>
            </div>
          );
        }
        if (section === 'certifications' && data.certifications?.length) {
          return (
            <div key="certifications" className="mb-[14px] resume-section flex flex-col md:flex-row gap-4">
              <div className="md:w-[120px] shrink-0">
                <h2 className="text-[10pt] font-bold uppercase tracking-[2px] text-[#4b5563]">Certifications</h2>
              </div>
              <div className="flex-1">
                <ul className="list-inside list-square text-[10.5pt] text-[#1f2937] font-medium">
                  {data.certifications.map((cert, i) => <li key={i} className="mb-[2px] marker:text-[#9ca3af]">{cert}</li>)}
                </ul>
              </div>
            </div>
          );
        }
        return null;
      })}
    </div>
  );
}
