import { api } from "./client";
import type { Resume, ApiResponse, PaginatedData, TemplateName } from "@/types/resume";

export interface EducationItem {
  institution?: string;
  degree?: string;
  field_of_study?: string;
  start_date?: string;
  end_date?: string;
  gpa?: string;
}

export interface ExperienceItem {
  company?: string;
  title?: string;
  start_date?: string;
  end_date?: string;
  description?: string;
  is_current?: boolean;
}

export interface ProjectItem {
  name?: string;
  description?: string;
  technologies?: string;
  link?: string;
}

export type { Resume as ResumeData };

export interface AtsScoreBreakdown {
  format: number;
  contact: number;
  keywords: number;
  achievements: number;
  length: number;
  education: number;
  /** Present only when the score was computed against a pasted JD. */
  jd_match?: number;
}

export interface MissingKeyword {
  keyword: string;
  /** Normalized TF-IDF weight, 0-1 — higher = more important to the JD. */
  weight: number;
}

export interface JdMatchResult {
  similarity: number;
  matched_keywords: string[];
  missing_keywords: MissingKeyword[];
  match_pct: number;
}

export interface AtsScoreResult {
  score: number;
  breakdown: AtsScoreBreakdown;
  max: AtsScoreBreakdown;
  suggestions: string[];
  /** Present only when a job description was provided. */
  jd_match?: JdMatchResult | null;
}

export interface BulletIssue {
  type: "weak_start" | "no_action_verb" | "no_metric" | "passive_voice" | "too_long";
  message: string;
}

export interface BulletAnalysis {
  text: string;
  has_quantification: boolean;
  has_action_verb: boolean;
  is_passive: boolean;
  issues: BulletIssue[];
}

export interface BulletStats {
  total: number;
  with_quantification: number;
  with_action_verb: number;
  passive: number;
}

export interface AnalyzeBulletsResult {
  bullets: BulletAnalysis[];
  stats: BulletStats;
}

export type FieldConfidence = "high" | "low";

export interface ParsedResumeData {
  full_name: string;
  email: string;
  phone: string;
  location: string;
  linkedin_url: string;
  summary: string;
  education: EducationItem[];
  experience: ExperienceItem[];
  projects: ProjectItem[];
  skills: string[];
  certifications: string[];
}

export interface ParseUploadResult {
  data: ParsedResumeData;
  /** Per-field confidence: "high" = likely correct (green), "low" = verify (yellow). */
  confidence: Record<string, FieldConfidence>;
  warnings: string[];
  used_ocr: boolean;
  detected_sections: string[];
}

export interface AtsPreviewResult {
  /** Raw text extracted from the generated PDF — the ATS's-eye view. */
  text: string;
  detected_sections: string[];
  warnings: string[];
}

export interface GapItem {
  item: string;
  category: string;
}
export interface GapMissingItem {
  item: string;
  category: string;
  suggestion: string;
}

export interface GapAnalysisResult {
  role: string;
  role_name: string;
  total_skills: number;
  present_count: number;
  coverage_pct: number;
  present: GapItem[];
  missing: GapMissingItem[];
}

export interface RoleInfo {
  [key: string]: string;
}

export interface GapRolesData {
  roles: RoleInfo;
  categories: { [category: string]: string[] };
}

export const resumesApi = {
  create: (data?: Record<string, unknown>) =>
    api.post<ApiResponse<Resume>>("/resumes", data ?? {}).then((r) => r.data.data),

  list: (page = 1, pageSize = 20) =>
    api
      .get<ApiResponse<PaginatedData<Resume>>>("/resumes", {
        params: { page, page_size: pageSize },
      })
      .then((r) => r.data.data),

  get: (id: number) =>
    api.get<ApiResponse<Resume>>(`/resumes/${id}`).then((r) => r.data.data),

  update: (id: number, data: Record<string, unknown>) =>
    api.put<ApiResponse<Resume>>(`/resumes/${id}`, data).then((r) => r.data.data),

  patch: (id: number, data: Record<string, unknown>) =>
    api.patch<ApiResponse<Resume>>(`/resumes/${id}`, data).then((r) => r.data.data),

  delete: (id: number) =>
    api.delete<ApiResponse<null>>(`/resumes/${id}`).then((r) => r.data),

  duplicate: (id: number) =>
    api.post<ApiResponse<Resume>>(`/resumes/${id}/duplicate`).then((r) => r.data.data),

  generate: (id: number, template: TemplateName = "classic") =>
    api
      .post<ApiResponse<{ pdf_path: string }>>(`/resumes/${id}/generate`, null, {
        params: { template },
      })
      .then((r) => r.data.data),

  download: (id: number, template: TemplateName = "classic") =>
    api
      .get(`/resumes/${id}/download`, {
        params: { template },
        responseType: "blob",
      })
      .then((r) => {
        // Use the server's recruiter-friendly filename (Name_Resume.pdf)
        const dispo: string = r.headers["content-disposition"] ?? "";
        const match = /filename="?([^";]+)"?/.exec(dispo);
        const filename = match?.[1] ?? "Resume.pdf";
        const url = URL.createObjectURL(r.data);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      }),

  score: (id: number, role?: string) =>
    api
      .get<ApiResponse<AtsScoreResult>>(`/resumes/${id}/score`, {
        params: role ? { role } : undefined,
      })
      .then((r) => r.data.data),

  /** Score with an optional pasted job description (POST body — JD is too long for a query string). */
  scoreWithJd: (id: number, jdText?: string, role?: string) =>
    api
      .post<ApiResponse<AtsScoreResult>>(`/resumes/${id}/score`, {
        role: role || null,
        jd_text: jdText || null,
      })
      .then((r) => r.data.data),

  /** Plain-text extraction of the generated PDF — what an ATS parser sees. */
  atsPreview: (id: number, template: TemplateName = "classic") =>
    api
      .get<ApiResponse<AtsPreviewResult>>(`/resumes/${id}/ats-preview`, {
        params: { template },
      })
      .then((r) => r.data.data),

  /** Fork a resume for a specific job — copy carries the JD for re-scoring. */
  tailor: (id: number, jdText: string) =>
    api
      .post<ApiResponse<Resume>>(`/resumes/${id}/tailor`, { jd_text: jdText })
      .then((r) => r.data.data),

  analyzeBullets: (text: string) =>
    api
      .post<ApiResponse<AnalyzeBulletsResult>>("/resumes/analyze-bullets", { text })
      .then((r) => r.data.data),

  parseUpload: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return api
      .post<ApiResponse<ParseUploadResult>>("/resumes/parse-upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((r) => r.data.data);
  },

  gapAnalysis: (id: number, targetRole: string, targetCompany?: string) =>
    api
      .post<ApiResponse<GapAnalysisResult>>(
        `/resumes/${id}/gap-analysis`,
        { target_role: targetRole, target_company: targetCompany || null },
      )
      .then((r) => r.data.data),

  gapRoles: () =>
    api
      .get<ApiResponse<GapRolesData>>("/resumes/gap-roles")
      .then((r) => r.data.data),
};
