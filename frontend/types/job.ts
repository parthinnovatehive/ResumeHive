export interface JobCompany {
  display_name: string;
}

export interface JobLocation {
  display_name: string;
  area: string[];
}

export interface JobCategory {
  label: string;
  tag: string;
}

export interface JobListing {
  id: string;
  title: string;
  company: JobCompany;
  location: JobLocation;
  description: string;
  salary_min: number | null;
  salary_max: number | null;
  contract_type: string | null;
  contract_time: string | null;
  category: JobCategory | null;
  redirect_url: string;
  created: string;
}

export interface JobSearchResponse {
  results: JobListing[];
  count: number;
  page: number;
  results_per_page: number;
}

export interface CountryOption {
  code: string;
  name: string;
}

export interface JobSearchParams {
  what: string | string[];
  where?: string | string[];
  country?: string;
  page?: number;
  results_per_page?: number;
  salary_min?: number;
  full_time?: boolean;
  permanent?: boolean;
  sort_by?: "relevance" | "salary" | "date";
}
