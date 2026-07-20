"use client";

import React from "react";
import { useFormContext, Controller } from "react-hook-form";
import type { ResumeFormData } from "@/lib/validations/resume.schema";
import { ResumeFormStep } from "./ResumeFormStep";
import { DynamicList } from "./DynamicList";
import { TagsInput } from "./TagsInput";

const SKILL_SUGGESTIONS = [
  "JavaScript",
  "TypeScript",
  "Python",
  "Java",
  "C++",
  "React",
  "Next.js",
  "Node.js",
  "Express",
  "Django",
  "FastAPI",
  "SQL",
  "PostgreSQL",
  "MongoDB",
  "Git",
  "Docker",
  "AWS",
  "REST APIs",
  "GraphQL",
  "HTML",
  "CSS",
  "Tailwind CSS",
  "Machine Learning",
  "Data Structures",
  "Algorithms",
];

const TOTAL_STEPS = 7;

interface Props {
  step: number;
}

export function FormStep({ step }: Props) {
  const { register, control, watch } = useFormContext<ResumeFormData>();
  const summary = watch("summary");

  switch (step) {
    // ── Step 1: Personal Info ──────────────────────────────────
    case 0:
      return (
        <ResumeFormStep
          title="Contact Information"
          description="How employers will reach you."
          stepNumber={1}
          totalSteps={TOTAL_STEPS}
        >
          <div className="space-y-4">
            <Field
              label="Full Name"
              error={undefined}
              {...register("full_name")}
              placeholder="Priya Sharma"
            />
            <div className="grid grid-cols-2 gap-4">
              <Field
                label="Email"
                type="email"
                error={undefined}
                {...register("email")}
                placeholder="priya@example.com"
              />
              <Field
                label="Phone"
                type="tel"
                error={undefined}
                {...register("phone")}
                placeholder="9876543210"
              />
            </div>
            <Field
              label="Location"
              error={undefined}
              {...register("location")}
              placeholder="Bangalore, India"
            />
            <Field
              label="LinkedIn URL"
              error={undefined}
              {...register("linkedin_url")}
              placeholder="https://linkedin.com/in/priya"
            />
          </div>
        </ResumeFormStep>
      );

    // ── Step 2: Professional Summary ───────────────────────────
    case 1:
      return (
        <ResumeFormStep
          title="Professional Summary"
          description="2-3 sentences about your experience and goals."
          stepNumber={2}
          totalSteps={TOTAL_STEPS}
        >
          <div>
            <textarea
              {...register("summary")}
              rows={6}
              placeholder="Software engineer with 3+ years of experience building scalable web applications..."
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              aria-label="Professional summary"
            />
            <div className="mt-1 flex justify-between text-xs text-gray-400">
              <span>Aim for 50-200 words</span>
              <span>{summary?.length || 0} characters</span>
            </div>
          </div>
        </ResumeFormStep>
      );

    // ── Step 3: Education ──────────────────────────────────────
    case 2:
      return (
        <ResumeFormStep
          title="Education"
          description="Add your educational background."
          stepNumber={3}
          totalSteps={TOTAL_STEPS}
        >
          <Controller
            name="education"
            control={control}
            render={({ field }) => (
              <DynamicList
                items={field.value as Record<string, unknown>[]}
                onChange={field.onChange}
                addButtonLabel="Add education"
                emptyMessage="No education entries yet."
                fields={[
                  { name: "institution", placeholder: "College / University", span: "full" },
                  { name: "degree", placeholder: "Degree (e.g. B.Tech)" },
                  { name: "field_of_study", placeholder: "Field of Study (e.g. CS)" },
                  { name: "start_date", placeholder: "Start", type: "month" },
                  { name: "end_date", placeholder: "End", type: "month" },
                  { name: "gpa", placeholder: "GPA / Percentage" },
                ]}
              />
            )}
          />
        </ResumeFormStep>
      );

    // ── Step 4: Experience ─────────────────────────────────────
    case 3:
      return (
        <ResumeFormStep
          title="Work Experience"
          description="Internships, part-time, or full-time roles."
          stepNumber={4}
          totalSteps={TOTAL_STEPS}
        >
          <Controller
            name="experience"
            control={control}
            render={({ field }) => (
              <DynamicList
                items={field.value as Record<string, unknown>[]}
                onChange={field.onChange}
                addButtonLabel="Add experience"
                emptyMessage="No experience entries yet."
                fields={[
                  { name: "company", placeholder: "Company", span: "full" },
                  { name: "title", placeholder: "Job Title" },
                  { name: "start_date", placeholder: "Start", type: "month" },
                  { name: "end_date", placeholder: "End", type: "month" },
                  { name: "is_current", placeholder: "Currently working here", type: "checkbox" },
                  { name: "description", placeholder: "Describe your role, achievements, and impact...", type: "textarea", span: "full", bulletFeedback: true },
                ]}
              />
            )}
          />
        </ResumeFormStep>
      );

    // ── Step 5: Projects ───────────────────────────────────────
    case 4:
      return (
        <ResumeFormStep
          title="Projects"
          description="Highlight key projects and contributions."
          stepNumber={5}
          totalSteps={TOTAL_STEPS}
        >
          <Controller
            name="projects"
            control={control}
            render={({ field }) => (
              <DynamicList
                items={field.value as Record<string, unknown>[]}
                onChange={field.onChange}
                addButtonLabel="Add project"
                emptyMessage="No projects yet."
                fields={[
                  { name: "name", placeholder: "Project Name", span: "full" },
                  { name: "technologies", placeholder: "Technologies (e.g. React, Node.js, PostgreSQL)", span: "full" },
                  { name: "description", placeholder: "What does this project do? What was your contribution?", type: "textarea", span: "full", bulletFeedback: true },
                  { name: "link", placeholder: "https://github.com/...", span: "full" },
                ]}
              />
            )}
          />
        </ResumeFormStep>
      );

    // ── Step 6: Skills ─────────────────────────────────────────
    case 5:
      return (
        <ResumeFormStep
          title="Skills"
          description="Add your technical and soft skills."
          stepNumber={6}
          totalSteps={TOTAL_STEPS}
        >
          <Controller
            name="skills"
            control={control}
            render={({ field }) => (
              <TagsInput
                value={field.value as string[]}
                onChange={field.onChange}
                label="Skills"
                placeholder="Type a skill and press Enter"
                suggestions={SKILL_SUGGESTIONS}
              />
            )}
          />
        </ResumeFormStep>
      );

    // ── Step 7: Certifications ─────────────────────────────────
    case 6:
      return (
        <ResumeFormStep
          title="Certifications"
          description="Any relevant certifications or courses."
          stepNumber={7}
          totalSteps={TOTAL_STEPS}
        >
          <Controller
            name="certifications"
            control={control}
            render={({ field }) => (
              <TagsInput
                value={field.value as string[]}
                onChange={field.onChange}
                label="Certifications"
                placeholder="Type a certification and press Enter"
                suggestions={[
                  "AWS Certified Solutions Architect",
                  "Google Cloud Professional",
                  "Meta Front-End Developer",
                  "Microsoft Azure Fundamentals",
                  "Cisco CCNA",
                  "ISTQB Foundation",
                ]}
              />
            )}
          />
        </ResumeFormStep>
      );

    default:
      return null;
  }
}

/* ── Small helper to keep field markup DRY ────────────────────── */

import type { InputHTMLAttributes } from "react";

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

const Field = React.forwardRef<HTMLInputElement, FieldProps>(
  ({ label, error, ...props }, ref) => (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700">
        {label}
      </label>
      <input
        ref={ref}
        {...props}
        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
      />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  ),
);
Field.displayName = "Field";
