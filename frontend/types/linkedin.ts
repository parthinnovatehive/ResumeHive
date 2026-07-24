export interface LinkedinExperienceEntry {
  title: string;
  company: string;
  date_range: string;
  description: string;
}

export interface LinkedinEducationEntry {
  info: string;
  date_range: string;
}

export interface LinkedinSections {
  full_name: string;
  email: string;
  phone: string;
  linkedin_url: string;
  headline: string;
  about: string;
  experience: LinkedinExperienceEntry[];
  education: LinkedinEducationEntry[];
  skills: string[];
  certifications: string[];
}

export interface LinkedinScoreBreakdown {
  headline: number;
  about_keywords: number;
  skills_coverage: number;
  experience_quality: number;
}

export interface LinkedinScoreMax {
  headline: number;
  about_keywords: number;
  skills_coverage: number;
  experience_quality: number;
}

export interface LinkedinScoreResult {
  score: number;
  breakdown: LinkedinScoreBreakdown;
  max: LinkedinScoreMax;
  suggestions: string[];
  role: string | null;
}

export interface LinkedinAnalysis {
  id: number;
  raw_text: string;
  sections: LinkedinSections;
  detected_sections: string[];
  warnings: string[];
  scores: LinkedinScoreResult | null;
  created_at: string;
}

export interface LinkedinAnalysisListItem {
  id: number;
  created_at: string;
  detected_sections: string[];
  warnings: string[];
  score: number | null;
}

export interface LinkedinRewriteResult {
  original: string;
  rewritten: string;
  rewrite_type: string;
}

export interface LinkedinRole {
  key: string;
  name: string;
}
