"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, MapPin, ExternalLink, Briefcase, Clock, DollarSign, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { searchJobs, getCountries } from "@/lib/api/jobs";
import type { JobListing, CountryOption, JobSearchParams } from "@/types/job";

const SORT_OPTIONS = [
  { value: "relevance", label: "Relevance" },
  { value: "date", label: "Date" },
  { value: "salary", label: "Salary" },
] as const;

export default function JobsPage() {
  const [countries, setCountries] = useState<CountryOption[]>([]);
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [what, setWhat] = useState("");
  const [where, setWhere] = useState("");
  const [country, setCountry] = useState("in");
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<JobSearchParams["sort_by"]>("relevance");
  const [salaryMin, setSalaryMin] = useState("");
  const [fullTimeOnly, setFullTimeOnly] = useState(false);
  const [permanentOnly, setPermanentOnly] = useState(false);

  const resultsPerPage = 20;
  const totalPages = Math.ceil(totalCount / resultsPerPage);

  useEffect(() => {
    getCountries()
      .then(setCountries)
      .catch(() => setCountries([{ code: "in", name: "India" }]));

    setLoading(true);
    searchJobs({ what: "software developer", country: "in", sort_by: "date", results_per_page: 20 })
      .then((res) => { setJobs(res.results); setTotalCount(res.count); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const doSearch = useCallback(async (p: number) => {
    if (!what.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await searchJobs({
        what: what.trim(),
        where: where.trim() || undefined,
        country,
        page: p,
        results_per_page: resultsPerPage,
        sort_by: sortBy,
        salary_min: salaryMin ? Number(salaryMin) : undefined,
        full_time: fullTimeOnly || undefined,
        permanent: permanentOnly || undefined,
      });
      setJobs(res.results);
      setTotalCount(res.count);
      setPage(p);
    } catch (err: any) {
      const msg = err?.response?.data?.detail || err?.message || "Failed to fetch jobs";
      setError(msg);
      setJobs([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [what, where, country, sortBy, salaryMin, fullTimeOnly, permanentOnly]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    doSearch(1);
  };

  const formatSalary = (min: number | null, max: number | null) => {
    const hasMin = min && min > 0;
    const hasMax = max && max > 0;
    if (!hasMin && !hasMax) return null;
    const fmt = (n: number) => {
      if (n >= 1000) return `${Math.round(n / 1000)}k`;
      return String(n);
    };
    if (hasMin && hasMax) return `${fmt(min!)} - ${fmt(max!)}`;
    if (hasMin) return `From ${fmt(min!)}`;
    return `Up to ${fmt(max!)}`;
  };

  const timeAgo = (dateStr: string) => {
    if (!dateStr) return "";
    const diff = Date.now() - new Date(dateStr).getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days}d ago`;
    if (days < 30) return `${Math.floor(days / 7)}w ago`;
    return `${Math.floor(days / 30)}mo ago`;
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-2 text-2xl font-bold text-gray-900">Job Search</h1>
      <p className="mb-6 text-sm text-gray-500">Powered by Adzuna — find jobs across India and worldwide</p>

      <form onSubmit={handleSubmit} className="mb-8 rounded-lg border bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
          <div className="relative md:col-span-2">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Job title or keywords (e.g. javascript developer)"
              value={what}
              onChange={(e) => setWhat(e.target.value)}
              className="w-full rounded-lg border bg-gray-50 py-2 pl-9 pr-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              required
            />
          </div>
          <div className="relative">
            <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Location (optional)"
              value={where}
              onChange={(e) => setWhere(e.target.value)}
              className="w-full rounded-lg border bg-gray-50 py-2 pl-9 pr-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <select
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="rounded-lg border bg-gray-50 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            {countries.map((c) => (
              <option key={c.code} value={c.code}>{c.name}</option>
            ))}
          </select>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-3">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="rounded-lg border bg-gray-50 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>

          <input
            type="number"
            placeholder="Min salary"
            value={salaryMin}
            onChange={(e) => setSalaryMin(e.target.value)}
            className="w-28 rounded-lg border bg-gray-50 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
          />

          <label className="flex items-center gap-1.5 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={fullTimeOnly}
              onChange={(e) => setFullTimeOnly(e.target.checked)}
              className="rounded"
            />
            Full-time
          </label>

          <label className="flex items-center gap-1.5 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={permanentOnly}
              onChange={(e) => setPermanentOnly(e.target.checked)}
              className="rounded"
            />
            Permanent
          </label>

          <button
            type="submit"
            disabled={loading || !what.trim()}
            className="ml-auto rounded-lg bg-blue-600 px-5 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : "Search"}
          </button>
        </div>
      </form>

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
      )}

      {!loading && jobs.length === 0 && !error && what.trim() && (
        <p className="py-12 text-center text-gray-400">No jobs found. Try different keywords or filters.</p>
      )}

      {!loading && jobs.length === 0 && !error && !what.trim() && (
        <div className="py-16 text-center">
          <Briefcase size={48} className="mx-auto mb-4 text-gray-300" />
          <p className="text-gray-400">No jobs found. Try different keywords or filters.</p>
        </div>
      )}

      {jobs.length > 0 && (
        <>
          <p className="mb-4 text-sm text-gray-500">
            {totalCount.toLocaleString()} jobs found
          </p>

          <div className="space-y-3">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="rounded-lg border bg-white p-4 shadow-sm transition hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base font-semibold text-gray-900">{job.title}</h3>
                    <p className="mt-0.5 text-sm text-gray-600">{job.company.display_name}</p>

                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <MapPin size={12} />
                        {job.location.display_name || job.location.area[job.location.area.length - 1] || "Remote"}
                      </span>

                      <span className="flex items-center gap-1">
                        <DollarSign size={12} />
                        {formatSalary(job.salary_min, job.salary_max) || "Not specified"}
                      </span>

                      {job.contract_time && (
                        <span className="flex items-center gap-1 capitalize">
                          <Clock size={12} />
                          {job.contract_time.replace("_", " ")}
                        </span>
                      )}

                      {job.contract_type && (
                        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs capitalize text-gray-600">
                          {job.contract_type}
                        </span>
                      )}

                      {job.category && (
                        <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs text-blue-600">
                          {job.category.label}
                        </span>
                      )}

                      <span>{timeAgo(job.created)}</span>
                    </div>

                    <p
                      className="mt-2 line-clamp-2 text-xs leading-relaxed text-gray-500"
                      dangerouslySetInnerHTML={{ __html: job.description }}
                    />
                  </div>

                  <a
                    href={job.redirect_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex shrink-0 items-center gap-1 rounded-lg border px-3 py-1.5 text-xs font-medium text-blue-600 transition hover:bg-blue-50"
                  >
                    Apply <ExternalLink size={12} />
                  </a>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                onClick={() => doSearch(page - 1)}
                disabled={page <= 1 || loading}
                className="flex items-center gap-1 rounded-lg border px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40"
              >
                <ChevronLeft size={14} /> Prev
              </button>
              <span className="text-sm text-gray-500">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => doSearch(page + 1)}
                disabled={page >= totalPages || loading}
                className="flex items-center gap-1 rounded-lg border px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40"
              >
                Next <ChevronRight size={14} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
