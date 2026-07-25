import { api } from "./client";

export interface UserProfile {
  id: number;
  email: string;
  college_name: string;
  created_at: string;
  linkedin_url: string | null;
  linkedin_id: string | null;
  headline: string | null;
  about: string | null;
  top_skills: string[];
  certifications: string[];
  experience: Record<string, unknown>[];
  education: Record<string, unknown>[];
  linkedin_profile_stored: boolean;
}

export interface ProfileUpdatePayload {
  college_name?: string;
  linkedin_url?: string;
  linkedin_id?: string;
  headline?: string;
  about?: string;
  top_skills?: string[];
  certifications?: string[];
  experience?: Record<string, unknown>[];
  education?: Record<string, unknown>[];
}

export function authApi() {
  return {
    login: (email: string, password: string) =>
      api.post("/auth/login", { email, password }).then((r) => r.data),
    signup: (email: string, password: string, college_name = "") =>
      api
        .post("/auth/signup", { email, password, college_name })
        .then((r) => r.data),
    getProfile: (): Promise<UserProfile> =>
      api.get("/auth/me/profile").then((r) => r.data),
    updateProfile: (payload: ProfileUpdatePayload): Promise<UserProfile> =>
      api.put("/auth/me/profile", payload).then((r) => r.data),
  };
}
