export interface Company {
  id: number;
  name: string;
  slug: string;
}

export interface Question {
  id: number;
  title: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  frequency: number;
  acceptance_rate: number;
  link: string;
  status: string | null;
  revisit_later: boolean;
}

export interface PaginatedQuestions {
  items: Question[];
  total: number;
  limit: number;
  offset: number;
}

export interface ProgressQuestion {
  id: number;
  title: string;
  link: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  acceptance_rate: number;
  status: string | null;
  revisit_later: boolean;
  created_at: string;
  updated_at: string;
}

export interface PaginatedProgress {
  items: ProgressQuestion[];
  total: number;
  limit: number;
  offset: number;
}
