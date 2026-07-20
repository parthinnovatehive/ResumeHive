"use client";

import { useCallback, useEffect, useState } from "react";
import { resumesApi } from "@/lib/api/resumes";
import { useToast } from "@/components/ui/Toast";
import type {
  GapAnalysisResult,
  GapRolesData,
} from "@/lib/api/resumes";

interface Props {
  resumeId: number;
  onAddSkill?: (skill: string) => void;
}

const CATEGORY_LABELS: Record<string, { label: string; icon: string }> = {
  skills: { label: "Skills", icon: "W" },
  certifications: { label: "Certifications", icon: "C" },
  projects: { label: "Projects", icon: "P" },
  soft_skills: { label: "Soft Skills", icon: "S" },
};

const CATEGORY_COLORS: Record<string, string> = {
  skills: "bg-blue-100 text-blue-800",
  certifications: "bg-purple-100 text-purple-800",
  projects: "bg-amber-100 text-amber-800",
  soft_skills: "bg-teal-100 text-teal-800",
};

export function GapAnalysis({ resumeId, onAddSkill }: Props) {
  const { toast } = useToast();
  const [roles, setRoles] = useState<GapRolesData | null>(null);
  const [selectedRole, setSelectedRole] = useState("");
  const [company, setCompany] = useState("");
  const [result, setResult] = useState<GapAnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(["skills", "certifications", "projects", "soft_skills"]),
  );

  useEffect(() => {
    resumesApi.gapRoles().then(setRoles).catch(() => {});
  }, []);

  const handleAnalyze = useCallback(async () => {
    if (!selectedRole) return;
    setLoading(true);
    try {
      const res = await resumesApi.gapAnalysis(resumeId, selectedRole, company || undefined);
      setResult(res);
    } catch {
      toast("Failed to run gap analysis.", "error");
    } finally {
      setLoading(false);
    }
  }, [resumeId, selectedRole, company, toast]);

  const toggleCategory = (cat: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  };

  if (!roles) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  const roleList = Object.entries(roles.roles).sort((a, b) =>
    a[1].localeCompare(b[1]),
  );

  const groupedRoles: { category: string; roles: [string, string][] }[] = [];
  if (roles.categories) {
    for (const [cat, keys] of Object.entries(roles.categories)) {
      const items = keys
        .map((k): [string, string] | null => {
          const name = roles.roles[k];
          return name ? [k, name] : null;
        })
        .filter((x): x is [string, string] => x !== null);
      if (items.length) {
        groupedRoles.push({ category: cat, roles: items.sort((a, b) => a[1].localeCompare(b[1])) });
      }
    }
  }

  return (
    <div className="space-y-5">
      {/* Role selector */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700">
          Target Role
        </label>
        <select
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="">Select a role...</option>
          {groupedRoles.map((g) => (
            <optgroup key={g.category} label={g.category}>
              {g.roles.map(([key, name]) => (
                <option key={key} value={key}>
                  {name}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>

      {/* Company (optional) */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700">
          Target Company{" "}
          <span className="text-gray-400">(optional)</span>
        </label>
        <input
          type="text"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          placeholder="e.g. TCS, Google, Amazon"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      {/* Analyze button */}
      <button
        onClick={handleAnalyze}
        disabled={!selectedRole || loading}
        className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {loading ? "Analyzing..." : "Run Gap Analysis"}
      </button>

      {/* Results */}
      {result && (
        <div className="space-y-4">
          {/* Coverage bar */}
          <div>
            <div className="mb-1 flex items-center justify-between text-sm">
              <span className="font-medium text-gray-700">
                {result.role_name}
              </span>
              <span className="text-gray-500">
                {result.present_count}/{result.total_skills} covered
              </span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-gray-200">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  result.coverage_pct >= 70
                    ? "bg-green-500"
                    : result.coverage_pct >= 40
                      ? "bg-amber-500"
                      : "bg-red-500"
                }`}
                style={{ width: `${result.coverage_pct}%` }}
              />
            </div>
            <p className="mt-1 text-right text-xs text-gray-500">
              {result.coverage_pct}% coverage
            </p>
          </div>

          {/* Present items by category */}
          {(["skills", "certifications", "projects", "soft_skills"] as const).map(
            (cat) => {
              const presentItems = result.present.filter(
                (p) => p.category === cat,
              );
              const missingItems = result.missing.filter(
                (m) => m.category === cat,
              );
              const totalItems = presentItems.length + missingItems.length;
              if (totalItems === 0) return null;

              const isExpanded = expandedCategories.has(cat);
              const meta = CATEGORY_LABELS[cat] || { label: cat, icon: "?" };

              return (
                <div
                  key={cat}
                  className="overflow-hidden rounded-lg border border-gray-200"
                >
                  <button
                    onClick={() => toggleCategory(cat)}
                    className="flex w-full items-center justify-between bg-gray-50 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex h-6 w-6 items-center justify-center rounded text-xs font-bold ${CATEGORY_COLORS[cat] || "bg-gray-100 text-gray-600"}`}
                      >
                        {meta.icon}
                      </span>
                      <span>{meta.label}</span>
                      <span className="text-xs text-gray-400">
                        ({presentItems.length}/{totalItems})
                      </span>
                    </div>
                    <svg
                      className={`h-4 w-4 text-gray-400 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>

                  {isExpanded && (
                    <div className="divide-y divide-gray-100 px-4 py-2">
                      {/* Present */}
                      {presentItems.map((item) => (
                        <div
                          key={item.item}
                          className="flex items-center gap-2 py-1.5 text-sm"
                        >
                          <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-green-100 text-xs text-green-700">
                            &#10003;
                          </span>
                          <span className="text-gray-700">{item.item}</span>
                        </div>
                      ))}

                      {/* Missing */}
                      {missingItems.map((item) => (
                        <div
                          key={item.item}
                          className="flex items-start gap-2 py-1.5 text-sm"
                        >
                          <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-red-100 text-xs text-red-600">
                            &#10007;
                          </span>
                          <div className="min-w-0 flex-1">
                            <span className="text-gray-700">{item.item}</span>
                            <p className="mt-0.5 text-xs text-gray-500">
                              {item.suggestion}
                            </p>
                          </div>
                          {onAddSkill && cat === "skills" && (
                            <button
                              onClick={() => onAddSkill(item.item)}
                              className="flex-shrink-0 rounded border border-blue-200 px-2 py-0.5 text-xs font-medium text-blue-600 transition hover:bg-blue-50"
                            >
                              + Add
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            },
          )}
        </div>
      )}
    </div>
  );
}
