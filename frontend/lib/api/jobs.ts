import { api } from "./client";
import type { ApiResponse } from "@/types/resume";
import type {
  JobSearchParams,
  JobSearchResponse,
  CountryOption,
} from "@/types/job";

export async function searchJobs(params: JobSearchParams): Promise<JobSearchResponse> {
  const query = new URLSearchParams();

  const toComma = (v: string | string[]) =>
    Array.isArray(v) ? v.filter((s) => s?.trim()).join(",") : v;

  if (params.what) query.set("what", toComma(params.what));
  if (params.where) query.set("where", toComma(params.where));
  if (params.country) query.set("country", params.country);
  if (params.page) query.set("page", String(params.page));
  if (params.results_per_page) query.set("results_per_page", String(params.results_per_page));
  if (params.salary_min !== undefined) query.set("salary_min", String(params.salary_min));
  if (params.sort_by) query.set("sort_by", params.sort_by);
  if (params.full_time !== undefined) query.set("full_time", params.full_time ? "true" : "false");
  if (params.permanent !== undefined) query.set("permanent", params.permanent ? "true" : "false");

  const { data } = await api.get<ApiResponse<JobSearchResponse>>(
    `/jobs/search?${query.toString()}`
  );
  return data.data!;
}

export async function getCountries(): Promise<CountryOption[]> {
  const { data } = await api.get<ApiResponse<CountryOption[]>>("/jobs/countries");
  return data.data!;
}
