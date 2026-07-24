import { api } from "./client";
import type { ApiResponse } from "@/types/resume";
import type {
  LinkedinAnalysis,
  LinkedinAnalysisListItem,
  LinkedinRewriteResult,
  LinkedinScoreResult,
  LinkedinRole,
} from "@/types/linkedin";

export const linkedinApi = {
  parseUpload: (file: File): Promise<LinkedinAnalysis> => {
    const formData = new FormData();
    formData.append("file", file);
    return api
      .post<ApiResponse<LinkedinAnalysis>>("/linkedin/parse-upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((r) => r.data.data!);
  },

  list: (): Promise<LinkedinAnalysisListItem[]> => {
    return api
      .get<ApiResponse<LinkedinAnalysisListItem[]>>("/linkedin")
      .then((r) => r.data.data!);
  },

  get: (id: number): Promise<LinkedinAnalysis> => {
    return api
      .get<ApiResponse<LinkedinAnalysis>>(`/linkedin/${id}`)
      .then((r) => r.data.data!);
  },

  delete: (id: number): Promise<void> => {
    return api
      .delete<ApiResponse<null>>(`/linkedin/${id}`)
      .then(() => undefined);
  },

  score: (id: number, role?: string | null): Promise<LinkedinScoreResult> => {
    return api
      .post<ApiResponse<LinkedinScoreResult>>(
        `/linkedin/${id}/score`,
        { role: role || null },
      )
      .then((r) => r.data.data!);
  },

  getRoles: (): Promise<LinkedinRole[]> => {
    return api
      .get<ApiResponse<{ roles: LinkedinRole[] }>>("/linkedin/roles")
      .then((r) => r.data.data!.roles);
  },

  rewriteHeadline: (id: number, role?: string | null): Promise<LinkedinRewriteResult> => {
    return api
      .post<ApiResponse<LinkedinRewriteResult>>(
        `/linkedin/${id}/rewrite-headline`,
        { role: role || null },
      )
      .then((r) => r.data.data!);
  },

  rewriteAbout: (id: number, role?: string | null): Promise<LinkedinRewriteResult> => {
    return api
      .post<ApiResponse<LinkedinRewriteResult>>(
        `/linkedin/${id}/rewrite-about`,
        { role: role || null },
      )
      .then((r) => r.data.data!);
  },
};
