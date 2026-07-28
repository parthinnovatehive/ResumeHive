"use client";

import React, { useEffect, useState, useCallback } from "react";
import { fetchMyProgress } from "@/lib/api/practice";
import type { ProgressQuestion } from "@/types/practice";

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

export default function MyProgressPage() {
  const [items, setItems] = useState<ProgressQuestion[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const [statusFilter, setStatusFilter] = useState<string>("");
  const [revisitFilter, setRevisitFilter] = useState<string>("");
  const [offset, setOffset] = useState(0);
  const limit = 50;

  const load = useCallback(async (off: number) => {
    setLoading(true);
    try {
      const params: Record<string, any> = { limit, offset: off };
      if (statusFilter) params.status = statusFilter;
      if (revisitFilter === "true") params.revisit_later = true;
      else if (revisitFilter === "false") params.revisit_later = false;
      const res = await fetchMyProgress(params);
      setItems(res.items);
      setTotal(res.total);
    } catch {
      setItems([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, revisitFilter]);

  useEffect(() => {
    setOffset(0);
    load(0);
  }, [statusFilter, revisitFilter, load]);

  const handlePrev = () => {
    const newOff = Math.max(0, offset - limit);
    setOffset(newOff);
    load(newOff);
  };

  const handleNext = () => {
    const newOff = offset + limit;
    setOffset(newOff);
    load(newOff);
  };

  const hasMore = offset + limit < total;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">My Progress</h1>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border rounded-lg px-3 py-1.5 text-sm outline-none"
          >
            <option value="">All</option>
            <option value="attempted">Attempted</option>
            <option value="solved">Solved</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Revisit:</span>
          <select
            value={revisitFilter}
            onChange={(e) => setRevisitFilter(e.target.value)}
            className="border rounded-lg px-3 py-1.5 text-sm outline-none"
          >
            <option value="">All</option>
            <option value="true">Flagged</option>
            <option value="false">Not Flagged</option>
          </select>
        </div>

        <span className="text-sm text-gray-400 ml-auto">
          {total} question{total !== 1 ? "s" : ""}
        </span>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading...</div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 text-gray-400 border rounded-lg">
          No tracked questions yet. Start marking progress on company questions!
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
                  <th className="text-center px-4 py-3 font-medium text-gray-600">
                    Status
                  </th>
                  <th className="text-center px-4 py-3 font-medium text-gray-600">
                    Revisit
                  </th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">
                    Acceptance Rate
                  </th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">
                    Last Updated
                  </th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {items.map((q, i) => (
                  <tr
                    key={q.id}
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
                    <td className="px-4 py-3 text-center">
                      {q.status === "solved" ? (
                        <span className="text-green-600 font-semibold text-xs">
                          ✓ Solved
                        </span>
                      ) : q.status === "attempted" ? (
                        <span className="text-amber-600 font-semibold text-xs">
                          ◷ Attempted
                        </span>
                      ) : (
                        <span className="text-gray-400 text-xs">Not Started</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center text-lg">
                      {q.revisit_later ? (
                        <span className="text-amber-500">★</span>
                      ) : (
                        <span className="text-gray-300">☆</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {formatPercent(q.acceptance_rate)}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-500 text-xs">
                      {new Date(q.updated_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <a
                        href={q.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded hover:bg-blue-100 transition-colors"
                      >
                        Solve
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
              Showing {offset + 1}–{Math.min(offset + limit, total)} of {total}
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
    </div>
  );
}
