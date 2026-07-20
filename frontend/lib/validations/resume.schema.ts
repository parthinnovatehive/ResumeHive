import { z } from "zod";

export const educationSchema = z.object({
  institution: z.string().optional().default(""),
  degree: z.string().optional().default(""),
  field_of_study: z.string().optional().default(""),
  start_date: z.string().optional().default(""),
  end_date: z.string().optional().default(""),
  gpa: z.string().optional().default(""),
});

export const experienceSchema = z.object({
  company: z.string().optional().default(""),
  title: z.string().optional().default(""),
  start_date: z.string().optional().default(""),
  end_date: z.string().optional().default(""),
  description: z.string().optional().default(""),
  is_current: z.boolean().optional().default(false),
});

export const projectSchema = z.object({
  name: z.string().optional().default(""),
  description: z.string().optional().default(""),
  technologies: z.string().optional().default(""),
  link: z
    .string()
    .url("Must be a valid URL")
    .optional()
    .or(z.literal(""))
    .default(""),
});

export const resumeFormSchema = z.object({
  full_name: z.string().optional().default(""),

  email: z
    .string()
    .email("Enter a valid email address")
    .optional()
    .or(z.literal(""))
    .default(""),

  phone: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian number")
    .optional()
    .or(z.literal(""))
    .default(""),

  location: z.string().optional().default(""),

  linkedin_url: z
    .string()
    .url("Must be a valid URL")
    .optional()
    .or(z.literal(""))
    .default(""),

  summary: z.string().optional().default(""),

  education: z.array(educationSchema).optional().default([]),

  experience: z.array(experienceSchema).optional().default([]),

  projects: z.array(projectSchema).optional().default([]),

  skills: z.array(z.string()).optional().default([]),

  certifications: z.array(z.string()).optional().default([]),

  section_order: z
    .array(z.string())
    .optional()
    .default([
      "summary",
      "experience",
      "education",
      "projects",
      "skills",
      "certifications",
    ]),
});

export type ResumeFormData = z.infer<typeof resumeFormSchema>;
export type EducationInput = z.infer<typeof educationSchema>;
export type ExperienceInput = z.infer<typeof experienceSchema>;
export type ProjectInput = z.infer<typeof projectSchema>;
