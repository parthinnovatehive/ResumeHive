"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  fetchCompanies,
  fetchCompanyQuestions,
  setQuestionStatus,
  setQuestionRevisit,
  clearQuestionStatus,
} from "@/lib/api/practice";
import type { Company, Question } from "@/types/practice";

const TIME_WINDOWS = [
  { key: "thirty_days", label: "Last 30 Days" },
  { key: "three_months", label: "3 Months" },
  { key: "six_months", label: "6 Months" },
  { key: "more_than_six_months", label: "6+ Months" },
  { key: "all", label: "All Time" },
] as const;

const DIFFICULTIES = ["EASY", "MEDIUM", "HARD"] as const;

function difficultyColor(d: string) {
  switch (d) {
    case "EASY":
      return "text-green-600 bg-green-50 border-green-200";
    case "MEDIUM":
      return "text-orange-600 bg-orange-50 border-orange-200";
    case "HARD":
      return "text-red-600 bg-red-50 border-red-200";
    default:
      return "text-gray-600 bg-gray-50 border-gray-200";
  }
}

function formatPercent(rate: number) {
  return `${(rate * 100).toFixed(2)}%`;
}

function AcceptanceRateInfo() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <span className="relative inline-flex items-center" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="ml-1 w-4 h-4 rounded-full border border-gray-400 text-gray-400 text-[10px] leading-none flex items-center justify-center hover:border-gray-600 hover:text-gray-600 transition-colors"
        title="What is this?"
      >
        i
      </button>
      {open && (
        <div className="absolute z-20 top-6 right-0 w-64 bg-white border rounded-lg shadow-lg p-3 text-xs text-gray-700 leading-relaxed">
          <strong className="block mb-1 text-gray-900">Acceptance Rate</strong>
          The percentage of LeetCode submissions for this question that were accepted. This is a global stat from LeetCode, not specific to any company or time window.
        </div>
      )}
    </span>
  );
}

export default function CompanyPracticePage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

  const [timeWindow, setTimeWindow] = useState("all");
  const [difficultyFilter, setDifficultyFilter] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [offset, setOffset] = useState(0);
  const limit = 50;

  useEffect(() => {
    fetchCompanies().then(setCompanies).catch(() => {});
  }, []);

  const loadQuestions = useCallback(
    async (slug: string, tw: string, diff: string | null, off: number) => {
      setLoading(true);
      try {
        const res = await fetchCompanyQuestions(slug, {
          time_window: tw,
          difficulty: diff || undefined,
          sort: "frequency",
          limit,
          offset: off,
        });
        setQuestions(res.items);
        setTotal(res.total);
      } catch {
        setQuestions([]);
        setTotal(0);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    if (selectedCompany) {
      loadQuestions(selectedCompany.slug, timeWindow, difficultyFilter, 0);
      setOffset(0);
    }
  }, [selectedCompany, timeWindow, difficultyFilter, loadQuestions]);

  const handleSelectCompany = (c: Company) => {
    setSelectedCompany(c);
  };

  const handlePrev = () => {
    const newOff = Math.max(0, offset - limit);
    setOffset(newOff);
    if (selectedCompany)
      loadQuestions(selectedCompany.slug, timeWindow, difficultyFilter, newOff);
  };

  const handleNext = () => {
    const newOff = offset + limit;
    setOffset(newOff);
    if (selectedCompany)
      loadQuestions(selectedCompany.slug, timeWindow, difficultyFilter, newOff);
  };

  const handleStatus = async (q: Question, newStatus: string) => {
    await setQuestionStatus(q.id, newStatus);
    setQuestions((prev) =>
      prev.map((x) => (x.id === q.id ? { ...x, status: newStatus } : x))
    );
  };

  const handleClearStatus = async (q: Question) => {
    const res = await clearQuestionStatus(q.id);
    setQuestions((prev) =>
      prev.map((x) =>
        x.id === q.id ? { ...x, status: null, revisit_later: res.revisit_later } : x
      )
    );
  };

  const handleRevisit = async (q: Question) => {
    const res = await setQuestionRevisit(q.id, !q.revisit_later);
    setQuestions((prev) =>
      prev.map((x) =>
        x.id === q.id ? { ...x, revisit_later: res.revisit_later } : x
      )
    );
  };

  const filteredCompanies = companies.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const hasMore = offset + limit < total;

  const solvedCount = questions.filter((q) => q.status === "solved").length;
  const attemptedCount = questions.filter((q) => q.status === "attempted").length;
  const notStartedCount = questions.filter((q) => q.status === null).length;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Company-Wise Coding Practice</h1>

      <div className="flex gap-6">
        {/* Company list — left sidebar */}
        <div className="w-56 shrink-0">
          <input
            type="text"
            placeholder="Search companies..."
            className="w-full border rounded-lg px-3 py-2 text-sm mb-3 outline-none focus:border-blue-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="border rounded-lg overflow-hidden max-h-[70vh] overflow-y-auto">
            {filteredCompanies.length === 0 ? (
              <div className="px-3 py-4 text-sm text-gray-400 text-center">
                No companies found
              </div>
            ) : (
              filteredCompanies.map((c) => (
                <div
                  key={c.id}
                  className={`px-3 py-2 text-sm cursor-pointer border-b last:border-b-0 hover:bg-blue-50 ${
                    selectedCompany?.id === c.id
                      ? "bg-blue-100 font-semibold text-blue-800"
                      : ""
                  }`}
                  onClick={() => handleSelectCompany(c)}
                >
                  {c.name}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Questions area — right content */}
        <div className="flex-1 min-w-0">
          {!selectedCompany ? (
            <div className="text-center py-24 text-gray-400 border rounded-lg bg-gray-50">
              Select a company from the list
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                <h2 className="text-xl font-bold">{selectedCompany.name}</h2>
                <div className="flex items-center gap-3 text-xs">
                  <span className="text-green-600 font-medium">● {solvedCount} solved</span>
                  <span className="text-amber-600 font-medium">● {attemptedCount} attempted</span>
                  <span className="text-gray-400">{notStartedCount} not started</span>
                  <span className="text-gray-300">|</span>
                  <span className="text-gray-500">{total} total</span>
                </div>
              </div>

              {/* Time Window Tabs */}
              <div className="flex flex-wrap gap-2 mb-4">
                {TIME_WINDOWS.map((tw) => (
                  <button
                    key={tw.key}
                    onClick={() => setTimeWindow(tw.key)}
                    className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                      timeWindow === tw.key
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {tw.label}
                  </button>
                ))}
              </div>

              {/* Difficulty Filter */}
              <div className="flex items-center gap-2 mb-4">
                <span className="text-sm text-gray-600">Difficulty:</span>
                <button
                  onClick={() => setDifficultyFilter(null)}
                  className={`px-3 py-1 text-sm rounded-full border ${
                    difficultyFilter === null
                      ? "bg-gray-800 text-white border-gray-800"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  All
                </button>
                {DIFFICULTIES.map((d) => (
                  <button
                    key={d}
                    onClick={() => setDifficultyFilter(d)}
                    className={`px-3 py-1 text-sm rounded-full border ${
                      difficultyFilter === d
                        ? "bg-gray-800 text-white border-gray-800"
                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {d.charAt(0) + d.slice(1).toLowerCase()}
                  </button>
                ))}
              </div>

              {/* Questions Table */}
              {loading ? (
                <div className="text-center py-12 text-gray-500">
                  Loading questions...
                </div>
              ) : questions.length === 0 ? (
                <div className="text-center py-12 text-gray-400 border rounded-lg">
                  No questions found for the selected filters.
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto border rounded-lg">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 border-b">
                        <tr>
                          <th className="text-left px-4 py-3 font-medium text-gray-600">
                            Title
                          </th>
                          <th className="text-left px-4 py-3 font-medium text-gray-600">
                            Difficulty
                          </th>
                          <th className="text-right px-4 py-3 font-medium text-gray-600">
                            Frequency
                          </th>
                          <th className="text-right px-4 py-3 font-medium text-gray-600">
                            <span className="inline-flex items-center">
                              Acceptance Rate
                              <AcceptanceRateInfo />
                            </span>
                          </th>
                          <th className="text-center px-4 py-3 font-medium text-gray-600">
                            Status
                          </th>
                          <th className="text-center px-4 py-3 font-medium text-gray-600">
                            Revisit
                          </th>
                          <th className="text-right px-4 py-3 font-medium text-gray-600">
                            Action
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {questions.map((q, i) => (
                          <tr
                            key={q.link}
                            className={`border-b ${
                              i % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                            }`}
                          >
                            <td className="px-4 py-3 font-medium max-w-[240px] truncate">
                              {q.title}
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`inline-block px-2 py-0.5 text-xs font-semibold rounded border ${difficultyColor(
                                  q.difficulty
                                )}`}
                              >
                                {q.difficulty}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right">{q.frequency}</td>
                            <td className="px-4 py-3 text-right">
                              {formatPercent(q.acceptance_rate)}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <StatusBadge
                                status={q.status}
                                onChange={(s) =>
                                  s === null
                                    ? handleClearStatus(q)
                                    : handleStatus(q, s)
                                }
                              />
                            </td>
                            <td className="px-4 py-3 text-center">
                              <button
                                onClick={() => handleRevisit(q)}
                                className={`text-lg leading-none transition-colors ${
                                  q.revisit_later
                                    ? "text-amber-500"
                                    : "text-gray-300 hover:text-amber-400"
                                }`}
                                title={
                                  q.revisit_later
                                    ? "Remove revisit flag"
                                    : "Mark for revisit"
                                }
                              >
                                {q.revisit_later ? "★" : "☆"}
                              </button>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <a
                                href={q.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded hover:bg-blue-100 transition-colors whitespace-nowrap"
                              >
                                Solve
                                <svg
                                  className="w-3 h-3"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                  />
                                </svg>
                              </a>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  <div className="flex items-center justify-between mt-4 text-sm text-gray-600">
                    <span>
                      Showing {offset + 1}–{Math.min(offset + limit, total)} of{" "}
                      {total}
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={handlePrev}
                        disabled={offset === 0}
                        className="px-3 py-1 border rounded disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
                      >
                        Previous
                      </button>
                      <button
                        onClick={handleNext}
                        disabled={!hasMore}
                        className="px-3 py-1 border rounded disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Status Badge ─────────────────────────────────────────────── */

function StatusBadge({
  status,
  onChange,
}: {
  status: string | null;
  onChange: (s: string | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const label =
    status === "solved"
      ? "Solved"
      : status === "attempted"
        ? "Attempted"
        : "Not Started";

  const color =
    status === "solved"
      ? "text-green-700 bg-green-50 border-green-300"
      : status === "attempted"
        ? "text-amber-700 bg-amber-50 border-amber-300"
        : "text-gray-400 bg-gray-50 border-gray-200";

  return (
    <span className="relative inline-block" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded border ${color} cursor-pointer whitespace-nowrap`}
      >
        {status === "solved" && "✓ "}
        {status === "attempted" && "◷ "}
        {label}
      </button>
      {open && (
        <div className="absolute z-20 top-7 left-1/2 -translate-x-1/2 bg-white border rounded-lg shadow-lg py-1 min-w-[130px]">
          <button
            onClick={() => {
              onChange("solved");
              setOpen(false);
            }}
            className={`block w-full text-left px-3 py-1.5 text-xs hover:bg-gray-50 ${
              status === "solved" ? "font-semibold text-green-700" : "text-gray-700"
            }`}
          >
            ✓ Solved
          </button>
          <button
            onClick={() => {
              onChange("attempted");
              setOpen(false);
            }}
            className={`block w-full text-left px-3 py-1.5 text-xs hover:bg-gray-50 ${
              status === "attempted" ? "font-semibold text-amber-700" : "text-gray-700"
            }`}
          >
            ◷ Attempted
          </button>
          {status && (
            <button
              onClick={() => {
                onChange(null);
                setOpen(false);
              }}
              className="block w-full text-left px-3 py-1.5 text-xs text-gray-500 hover:bg-gray-50"
            >
              Clear
            </button>
          )}
        </div>
      )}
    </span>
  );
}


