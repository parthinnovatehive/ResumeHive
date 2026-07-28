import { api } from "./client";
import type { Company, PaginatedQuestions, PaginatedProgress } from "@/types/practice";

export async function fetchCompanies(): Promise<Company[]> {
  const { data } = await api.get<Company[]>("/companies");
  return data;
}

export interface QuestionsParams {
  time_window?: string;
  difficulty?: string;
  sort?: string;
  limit?: number;
  offset?: number;
}

export async function fetchCompanyQuestions(
  slug: string,
  params: QuestionsParams = {}
): Promise<PaginatedQuestions> {
  const query = new URLSearchParams();
  if (params.time_window) query.set("time_window", params.time_window);
  if (params.difficulty) query.set("difficulty", params.difficulty);
  if (params.sort) query.set("sort", params.sort);
  if (params.limit !== undefined) query.set("limit", String(params.limit));
  if (params.offset !== undefined) query.set("offset", String(params.offset));

  const { data } = await api.get<PaginatedQuestions>(
    `/companies/${slug}/questions?${query.toString()}`
  );
  return data;
}

export async function setQuestionStatus(
  questionId: number,
  status: string
): Promise<{ status: string | null; revisit_later: boolean }> {
  const { data } = await api.post(`/questions/${questionId}/status`, { status });
  return data;
}

export async function setQuestionRevisit(
  questionId: number,
  revisit_later: boolean
): Promise<{ status: string | null; revisit_later: boolean }> {
  const { data } = await api.post(`/questions/${questionId}/revisit`, { revisit_later });
  return data;
}

export async function clearQuestionStatus(
  questionId: number
): Promise<{ status: null; revisit_later: boolean }> {
  const { data } = await api.delete(`/questions/${questionId}/status`);
  return data;
}

export interface MyProgressParams {
  status?: string;
  revisit_later?: boolean;
  company_slug?: string;
  limit?: number;
  offset?: number;
}

export async function fetchMyProgress(
  params: MyProgressParams = {}
): Promise<PaginatedProgress> {
  const query = new URLSearchParams();
  if (params.status) query.set("status", params.status);
  if (params.revisit_later !== undefined)
    query.set("revisit_later", String(params.revisit_later));
  if (params.company_slug) query.set("company_slug", params.company_slug);
  if (params.limit !== undefined) query.set("limit", String(params.limit));
  if (params.offset !== undefined) query.set("offset", String(params.offset));

  const { data } = await api.get<PaginatedProgress>(
    `/questions/my-progress?${query.toString()}`
  );
  return data;
}
