"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X } from "lucide-react";

const NAV_LINKS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/resumes", label: "My Resumes" },
  { href: "/resume-builder", label: "Resume Builder" },
  { href: "/resume-enhance", label: "Enhance" },
  { href: "/gap-analysis", label: "Gap Analysis" },
  { href: "/jobs", label: "Jobs" },
  { href: "/interview", label: "Interview" },
  { href: "/practice", label: "Practice" },
  { href: "/linkedin", label: "LinkedIn" },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setIsLoggedIn(Boolean(localStorage.getItem("access_token")));
    setEmail(localStorage.getItem("user_email"));
    setMobileOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user_email");
    localStorage.removeItem("resumehive_draft");
    setIsLoggedIn(false);
    setEmail(null);
    router.push("/login");
  };

  const linkClass = (href: string) =>
    `rounded-md px-3 py-2 text-sm font-medium transition ${
      pathname === href || pathname.startsWith(href + "/")
        ? "bg-blue-50 text-blue-700"
        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
    }`;

  return (
    <header className="sticky top-0 z-50 border-b bg-white">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-lg font-bold text-blue-600">
            ResumeHive
          </Link>
          <div className="hidden items-center gap-1 lg:flex">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={linkClass(link.href)}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
        <div className="hidden items-center gap-3 lg:flex">
          {isLoggedIn ? (
            <>
              {email && (
                <span className="text-sm text-gray-500">{email}</span>
              )}
              <button
                onClick={handleLogout}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
        <button
          className="rounded-md p-2 text-gray-600 hover:bg-gray-100 lg:hidden"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>
      {mobileOpen && (
        <div className="border-t bg-white px-4 py-3 lg:hidden">
          <div className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={linkClass(link.href)}
              >
                {link.label}
              </Link>
            ))}
          </div>
          <div className="mt-3 border-t pt-3">
            {isLoggedIn ? (
              <div className="flex items-center justify-between">
                {email && (
                  <span className="text-sm text-gray-500">{email}</span>
                )}
                <button
                  onClick={handleLogout}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
                >
                  Log out
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Link
                  href="/login"
                  className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-center text-sm font-medium text-gray-700 hover:bg-gray-100"
                >
                  Log in
                </Link>
                <Link
                  href="/signup"
                  className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-center text-sm font-medium text-white hover:bg-blue-700"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
