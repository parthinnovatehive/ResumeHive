import axios from "axios";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "/api";

export const api = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// If the backend rejects the token (expired/invalid), clear the session and
// send the user to login. Skip auth endpoints — a failed login attempt there
// should show its error message, not redirect.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const url: string = error?.config?.url ?? "";
    const isAuthCall = url.includes("/auth/login") || url.includes("/auth/signup");
    if (
      typeof window !== "undefined" &&
      error?.response?.status === 401 &&
      !isAuthCall
    ) {
      localStorage.removeItem("access_token");
      localStorage.removeItem("user_email");
      const from = window.location.pathname;
      window.location.href = `/login?from=${encodeURIComponent(from)}`;
    }
    return Promise.reject(error);
  }
);
