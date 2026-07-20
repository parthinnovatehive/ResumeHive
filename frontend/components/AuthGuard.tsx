"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

// Routes accessible without login. Everything else requires a token.
const PUBLIC_PATHS = ["/", "/login", "/signup"];

function isPublic(pathname: string): boolean {
  return PUBLIC_PATHS.includes(pathname);
}

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  // null = not checked yet (localStorage is unavailable during SSR)
  const [allowed, setAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    if (isPublic(pathname)) {
      setAllowed(true);
      return;
    }
    const token = localStorage.getItem("access_token");
    if (token) {
      setAllowed(true);
    } else {
      setAllowed(false);
      router.replace(`/login?from=${encodeURIComponent(pathname)}`);
    }
  }, [pathname, router]);

  // Never flash protected content while checking or redirecting
  if (allowed !== true && !isPublic(pathname)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  return <>{children}</>;
}
