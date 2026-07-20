export interface Education {
  institution: string;
  degree: string;
  field_of_study: string;
  start_date: string;
  end_date: string;
  gpa: string;
}

export interface Experience {
  company: string;
  title: string;
  start_date: string;
  end_date: string;
  description: string;
  is_current: boolean;
}

export interface Project {
  name: string;
  description: string;
  technologies: string;
  link: string;
}

export interface ResumeFormData {
  full_name: string;
  email: string;
  phone: string;
  location: string;
  linkedin_url: string;
  summary: string;
  education: Education[];
  experience: Experience[];
  projects: Project[];
  skills: string[];
  certifications: string[];
  section_order: string[];
}

export interface Resume extends ResumeFormData {
  id: number;
  user_id: number;
  ats_score: number | null;
  jd_text: string | null;
  created_at: string;
  updated_at: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

export interface PaginatedData<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export type SaveStatus = "idle" | "saving" | "saved" | "error";

export type TemplateName = "classic" | "modern" | "minimal" | "professional" | "compact";

export const TEMPLATE_CONFIG: Record<TemplateName, { label: string; description: string }> = {
  classic: { label: "Classic", description: "Clean traditional layout" },
  modern: { label: "Modern", description: "Blue accents, contemporary type" },
  minimal: { label: "Minimal", description: "Whitespace-optimized, elegant serif" },
  professional: { label: "Professional", description: "Navy executive style" },
  compact: { label: "Compact", description: "Dense — fits more per page" },
};

export const TEMPLATE_NAMES = Object.keys(TEMPLATE_CONFIG) as TemplateName[];

export function isTemplateName(v: string | null): v is TemplateName {
  return !!v && v in TEMPLATE_CONFIG;
}

export const DEFAULT_SECTIONS = [
  "summary",
  "experience",
  "education",
  "projects",
  "skills",
  "certifications",
] as const;

export const STEP_CONFIG = [
  { key: "personal", label: "Contact Info", icon: "user" },
  { key: "summary", label: "Summary", icon: "file-text" },
  { key: "education", label: "Education", icon: "graduation-cap" },
  { key: "experience", label: "Experience", icon: "briefcase" },
  { key: "projects", label: "Projects", icon: "folder" },
  { key: "skills", label: "Skills", icon: "wrench" },
  { key: "certifications", label: "Certifications", icon: "award" },
] as const;

export type StepKey = (typeof STEP_CONFIG)[number]["key"];
