import { api } from "./client";

export interface Category {
  name: string;
  slug: string;
  question_count: number;
  levels: string[];
}

export interface AptitudeQuestion {
  Level: string;
  Question: string;
  Option_A: string;
  Option_B: string;
  Option_C: string;
  Option_D: string;
  Correct_Option: string;
  Solution: string;
}

export interface PaginatedAptitudeQuestions {
  items: AptitudeQuestion[];
  total: number;
  limit: number;
  offset: number;
}

export async function fetchAptitudeCategories(): Promise<Category[]> {
  const { data } = await api.get<Category[]>("/aptitude/categories");
  return data;
}

export async function fetchAptitudeQuestions(
  categorySlug: string,
  params: { level?: string; limit?: number; offset?: number } = {}
): Promise<PaginatedAptitudeQuestions> {
  const query = new URLSearchParams();
  if (params.level) query.set("level", params.level);
  if (params.limit !== undefined) query.set("limit", String(params.limit));
  if (params.offset !== undefined) query.set("offset", String(params.offset));

  const { data } = await api.get<PaginatedAptitudeQuestions>(
    `/aptitude/categories/${categorySlug}/questions?${query.toString()}`
  );
  return data;
}
