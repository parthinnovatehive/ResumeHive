"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { authApi } from "@/lib/api/auth";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

type LoginInput = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data: LoginInput) => {
    setServerError("");
    try {
      const res = await authApi().login(data.email, data.password);
      localStorage.setItem("access_token", res.access_token);
      localStorage.setItem("user_email", res.email);
      // Return to the page the user was trying to visit, if any
      const from = new URLSearchParams(window.location.search).get("from");
      router.push(from && from.startsWith("/") ? from : "/dashboard");
    } catch (err: any) {
      setServerError(
        err?.response?.data?.detail ??
          (err?.code === "ERR_NETWORK"
            ? "Cannot reach the server. Is the backend running?"
            : "Something went wrong. Please try again.")
      );
    }
  };

  return (
    <main className="flex min-h-[calc(100vh-61px)] items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        <h1 className="text-center text-2xl font-bold text-gray-900">
          Welcome back
        </h1>
        <p className="mt-1 text-center text-sm text-gray-500">
          Log in to ResumeHive
        </p>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mt-8 space-y-4 rounded-xl bg-white p-6 shadow"
          noValidate
        >
          {serverError && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
              {serverError}
            </p>
          )}

          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              {...register("email")}
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              {...register("password")}
            />
            {errors.password && (
              <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isSubmitting ? "Logging in..." : "Log in"}
          </button>

          <p className="text-center text-sm text-gray-500">
            No account?{" "}
            <Link href="/signup" className="font-medium text-blue-600 hover:text-blue-700">
              Sign up
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
}
