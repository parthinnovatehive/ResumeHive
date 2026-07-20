import { api } from "./client";

export function authApi() {
  return {
    login: (email: string, password: string) =>
      api.post("/auth/login", { email, password }).then((r) => r.data),
    signup: (email: string, password: string, college_name = "") =>
      api
        .post("/auth/signup", { email, password, college_name })
        .then((r) => r.data),
  };
}
