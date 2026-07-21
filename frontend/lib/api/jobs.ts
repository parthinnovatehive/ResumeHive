import { api } from "./client";
import type { ApiResponse } from "@/types/resume";
import type {
  JobSearchParams,
  JobSearchResponse,
  CountryOption,
} from "@/types/job";

export async function searchJobs(params: JobSearchParams): Promise<JobSearchResponse> {
  const query = new URLSearchParams();
  query.set("what", params.what);
  if (params.where) query.set("where", params.where);
  if (params.country) query.set("country", params.country);
  if (params.page) query.set("page", String(params.page));
  if (params.results_per_page) query.set("results_per_page", String(params.results_per_page));
  if (params.salary_min) query.set("salary_min", String(params.salary_min));
  if (params.full_time !== undefined) query.set("full_time", String(params.full_time));
  if (params.permanent !== undefined) query.set("permanent", String(params.permanent));
  if (params.sort_by) query.set("sort_by", params.sort_by);

  const { data } = await api.get<ApiResponse<JobSearchResponse>>(
    `/jobs/search?${query.toString()}`
  );
  return data.data!;
}

export async function getCountries(): Promise<CountryOption[]> {
  const { data } = await api.get<ApiResponse<CountryOption[]>>("/jobs/countries");
  return data.data!;
}
