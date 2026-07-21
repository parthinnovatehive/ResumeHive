"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, Bell, Search, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/resumes", label: "My Resumes" },
  { href: "/resume-builder", label: "Resume Builder" },
  { href: "/resume-enhance", label: "ATS Analyzer" },
  { href: "/gap-analysis", label: "Portfolio" },
  { href: "/practice", label: "Practice" },
  { href: "/jobs", label: "Jobs" },
  { href: "/interview", label: "Interview" },
  { href: "/linkedin", label: "LinkedIn" },
  { href: "/analytics", label: "Analytics" },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  useEffect(() => {
    setIsLoggedIn(Boolean(localStorage.getItem("access_token")));
    setEmail(localStorage.getItem("user_email"));
    setMobileOpen(false);
    
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user_email");
    localStorage.removeItem("resumehive_draft");
    setIsLoggedIn(false);
    setEmail(null);
    router.push("/login");
  };

  const isCurrentPage = (href: string) => {
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 pt-4 px-4 transition-all duration-500 ease-out">
      <nav 
        className={cn(
          "mx-auto flex h-[72px] max-w-[1200px] items-center justify-between px-6 lg:px-8 rounded-full transition-all duration-500",
          scrolled 
            ? "bg-white/70 backdrop-blur-2xl border border-white/60 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.08),_0_2px_8px_-2px_rgba(0,0,0,0.04)]" 
            : "bg-transparent border border-transparent"
        )}
      >
        <div className="flex items-center gap-8">
          <Link href="/" className="group flex items-center text-xl font-extrabold tracking-tight">
            <span className="text-slate-800 transition-colors group-hover:text-slate-900">Resume</span>
            <span className="bg-gradient-to-r from-premium-blue via-premium-indigo to-premium-purple bg-[length:200%_auto] animate-shimmer bg-clip-text text-transparent ml-[1px]">
              Hive
            </span>
          </Link>
          
          <div className="hidden items-center gap-1 lg:flex">
            {NAV_LINKS.map((link) => {
              const active = isCurrentPage(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "relative rounded-full px-4 py-2 text-sm font-medium transition-all duration-300",
                    active ? "text-slate-900" : "text-slate-500 hover:text-slate-900"
                  )}
                >
                  <span className="relative z-10">{link.label}</span>
                  {active && (
                    <motion.div
                      layoutId="navbar-indicator"
                      className="absolute inset-0 z-0 rounded-full bg-white shadow-sm border border-slate-100"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="hidden items-center gap-2 lg:flex">
          {isLoggedIn ? (
            <>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="relative group p-2 rounded-full hover:bg-slate-50 cursor-pointer transition-colors">
                <Search className="h-[18px] w-[18px] text-slate-400 group-hover:text-slate-600 transition-colors" />
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="relative group p-2 rounded-full hover:bg-slate-50 cursor-pointer transition-colors mr-2">
                <Bell className="h-[18px] w-[18px] text-slate-400 group-hover:text-slate-600 transition-colors" />
              </motion.div>
              
              <div className="relative ml-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-tr from-premium-blue to-premium-purple text-white shadow-premium transition-shadow hover:shadow-premium-hover"
                >
                  <User size={16} />
                </motion.button>
                
                <AnimatePresence>
                  {profileDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-3 w-56 rounded-2xl bg-white/90 p-2 shadow-premium backdrop-blur-xl border border-white/20"
                    >
                      <div className="px-3 py-2 border-b border-slate-100 mb-2">
                        <p className="truncate text-sm font-medium text-slate-900">{email}</p>
                      </div>
                      <button className="w-full rounded-xl px-3 py-2 text-left text-sm text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900">
                        Profile
                      </button>
                      <button className="w-full rounded-xl px-3 py-2 text-left text-sm text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900">
                        Settings
                      </button>
                      <button
                        onClick={handleLogout}
                        className="w-full rounded-xl px-3 py-2 text-left text-sm text-premium-red transition-colors hover:bg-red-50"
                      >
                        Log out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="rounded-full px-5 py-2 text-sm font-medium text-slate-600 transition-all hover:bg-slate-100 hover:text-slate-900"
              >
                Sign in
              </Link>
              <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
                <Link
                  href="/signup"
                  className="rounded-full bg-gradient-to-r from-premium-blue to-premium-purple px-6 py-2.5 text-sm font-medium text-white shadow-premium transition-all hover:shadow-premium-hover relative overflow-hidden group"
                >
                  <span className="relative z-10">Get Started</span>
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                </Link>
              </motion.div>
            </div>
          )}
        </div>

        <button
          className="rounded-full p-2 text-slate-500 hover:bg-slate-100 lg:hidden transition-colors"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -10, filter: "blur(10px)" }}
            transition={{ duration: 0.2 }}
            className="absolute top-[80px] left-4 right-4 rounded-3xl overflow-hidden border border-white/60 bg-white/80 backdrop-blur-2xl lg:hidden shadow-premium"
          >
            <div className="flex flex-col gap-1 px-4 py-4">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "rounded-xl px-4 py-3 text-sm font-medium transition-colors",
                    isCurrentPage(link.href)
                      ? "bg-slate-50 text-slate-900"
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </div>
            <div className="border-t border-slate-100 px-4 py-4">
              {isLoggedIn ? (
                <div className="flex flex-col gap-3">
                  {email && <span className="px-4 text-sm font-medium text-slate-900 truncate">{email}</span>}
                  <button
                    onClick={handleLogout}
                    className="w-full rounded-xl bg-slate-100 px-4 py-3 text-center text-sm font-medium text-slate-900 transition-colors hover:bg-slate-200"
                  >
                    Log out
                  </button>
                </div>
              ) : (
                <div className="flex gap-3">
                  <Link
                    href="/login"
                    className="flex-1 rounded-xl bg-slate-100 px-4 py-3 text-center text-sm font-medium text-slate-900 transition-colors hover:bg-slate-200"
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/signup"
                    className="flex-1 rounded-xl bg-slate-900 px-4 py-3 text-center text-sm font-medium text-white transition-colors hover:bg-slate-800"
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
