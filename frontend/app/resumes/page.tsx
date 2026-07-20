"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { resumesApi } from "@/lib/api/resumes";
import { useToast } from "@/components/ui/Toast";
import type { Resume } from "@/types/resume";

export default function ResumesPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<number | null>(null);

  const fetchResumes = useCallback(async () => {
    try {
      const data = await resumesApi.list();
      setResumes(data.items);
    } catch {
      toast("Failed to load resumes.", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchResumes();
  }, [fetchResumes]);

  const handleCreate = async () => {
    try {
      const resume = await resumesApi.create();
      toast("Resume created!", "success");
      router.push(`/resume-builder?resume=${resume.id}`);
    } catch {
      toast("Failed to create resume.", "error");
    }
  };

  const handleDuplicate = async (id: number) => {
    setActionId(id);
    try {
      await resumesApi.duplicate(id);
      toast("Resume duplicated!", "success");
      fetchResumes();
    } catch {
      toast("Failed to duplicate resume.", "error");
    } finally {
      setActionId(null);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this resume?")) return;
    setActionId(id);
    try {
      await resumesApi.delete(id);
      toast("Resume deleted.", "success");
      setResumes((prev) => prev.filter((r) => r.id !== id));
    } catch {
      toast("Failed to delete resume.", "error");
    } finally {
      setActionId(null);
    }
  };

  const handleDownload = async (id: number) => {
    setActionId(id);
    try {
      await resumesApi.download(id, "classic");
    } catch {
      toast("Failed to generate PDF.", "error");
    } finally {
      setActionId(null);
    }
  };

  const formatDate = (iso: string) => {
    if (!iso) return "";
    try {
      return new Date(iso).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return iso;
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Resumes</h1>
          <p className="mt-1 text-sm text-gray-500">
            {resumes.length} resume{resumes.length !== 1 && "s"}
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
        >
          + Create New Resume
        </button>
      </div>

      {resumes.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-gray-300 py-16 text-center">
          <p className="text-gray-400">No resumes yet.</p>
          <button
            onClick={handleCreate}
            className="mt-4 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
          >
            Create your first resume
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {resumes.map((r) => (
            <div
              key={r.id}
              className="flex items-center justify-between rounded-xl border bg-white p-4 shadow-sm transition hover:shadow-md"
            >
              <div className="min-w-0 flex-1">
                <Link
                  href={`/resume-builder?resume=${r.id}`}
                  className="truncate text-lg font-semibold text-gray-900 hover:text-blue-600"
                >
                  {r.full_name || `Resume #${r.id}`}
                </Link>
                <div className="mt-0.5 flex items-center gap-3 text-sm text-gray-500">
                  <span>Modified {formatDate(r.updated_at)}</span>
                  {r.ats_score !== null && r.ats_score !== undefined && (
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                        r.ats_score >= 80
                          ? "bg-green-100 text-green-800"
                          : r.ats_score >= 50
                            ? "bg-amber-100 text-amber-800"
                            : "bg-red-100 text-red-800"
                      }`}
                    >
                      ATS {r.ats_score}
                    </span>
                  )}
                </div>
              </div>

              <div className="ml-4 flex items-center gap-2">
                <Link
                  href={`/resume-builder?resume=${r.id}`}
                  className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-100"
                >
                  Edit
                </Link>
                <button
                  onClick={() => handleDuplicate(r.id)}
                  disabled={actionId === r.id}
                  className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-100 disabled:opacity-40"
                >
                  Duplicate
                </button>
                <button
                  onClick={() => handleDownload(r.id)}
                  disabled={actionId === r.id}
                  className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-100 disabled:opacity-40"
                >
                  PDF
                </button>
                <button
                  onClick={() => handleDelete(r.id)}
                  disabled={actionId === r.id}
                  className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-40"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
