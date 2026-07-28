"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, Bell, Search, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { MagneticWrapper } from "./MagneticWrapper";

const NAV_LINKS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/resumes", label: "My Resumes" },
  { href: "/resume-builder", label: "Resume Builder" },
  { href: "/ats-analyzer", label: "ATS Analyzer" },
  { href: "/portfolio", label: "Portfolio" },
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
  const [activeSection, setActiveSection] = useState<string>("");

  useEffect(() => {
    setIsLoggedIn(Boolean(localStorage.getItem("access_token")));
    setEmail(localStorage.getItem("user_email"));
    setMobileOpen(false);
    
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    
    // Intersection Observer for scroll spy
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setActiveSection(`#${entry.target.id}`);
        }
      });
    }, { rootMargin: "-20% 0px -80% 0px" });

    document.querySelectorAll('section[id]').forEach((section) => {
      observer.observe(section);
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      observer.disconnect();
    };
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user_email");
    localStorage.removeItem("resumehive_draft");
    setIsLoggedIn(false);
    setEmail(null);
    router.push("/login");
  };

  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith("#") && pathname === "/") {
      e.preventDefault();
      const targetId = href.substring(1);
      const element = document.getElementById(targetId);
      if (element) {
        window.scrollTo({
          top: element.offsetTop - 100, // Offset for fixed navbar
          behavior: "smooth"
        });
        setActiveSection(href);
        setMobileOpen(false);
      }
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-[100] pt-4 px-4 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]">
      <nav 
        className={cn(
          "mx-auto flex items-center justify-between px-4 lg:px-6 2xl:px-8 rounded-full transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] relative",
          scrolled 
            ? "h-[64px] w-[98%] max-w-[1600px] bg-white/40 dark:bg-slate-900/40 backdrop-blur-3xl border border-white/60 dark:border-white/10 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.1)]" 
            : "h-[80px] w-full max-w-[1800px] bg-transparent border border-transparent"
        )}
      >
        {/* Glass Reflection Sweep (Only visible on scroll) */}
        {scrolled && (
          <div className="absolute inset-0 z-0 pointer-events-none opacity-50 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full animate-[shimmer_3s_infinite] rounded-full overflow-hidden" />
        )}

        <div className="flex items-center gap-4 2xl:gap-8 relative z-10">
          <Link href="/" className="group flex items-center text-xl font-extrabold tracking-tight shrink-0">
            <span className="text-slate-900 dark:text-white transition-colors">Resume</span>
            <span className="bg-gradient-to-r from-premium-blue to-premium-purple bg-[length:200%_auto] animate-shimmer bg-clip-text text-transparent ml-[1px]">
              Hive
            </span>
          </Link>
          
          <div className="hidden items-center gap-0.5 xl:flex">
            {NAV_LINKS.map((link) => {
              const active = pathname === link.href || (pathname.startsWith(link.href + "/") && link.href !== "/");
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "relative rounded-full px-2.5 2xl:px-3 py-1.5 2xl:py-2 text-[13px] 2xl:text-sm font-medium transition-colors duration-300 group whitespace-nowrap",
                    active ? "text-slate-900 dark:text-white" : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                  )}
                >
                  <span className="relative z-10">{link.label}</span>
                  {active && (
                    <motion.div
                      layoutId="navbar-indicator"
                      className="absolute inset-0 z-0 rounded-full bg-white/80 dark:bg-white/10 shadow-sm border border-slate-200/50 dark:border-slate-700/50 backdrop-blur-md"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  {/* Subtle hover background */}
                  {!active && (
                    <div className="absolute inset-0 z-0 rounded-full bg-slate-100/0 group-hover:bg-slate-100/50 dark:group-hover:bg-white/5 transition-colors duration-300" />
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="hidden items-center gap-2 2xl:gap-3 lg:flex relative z-10 shrink-0">
          {isLoggedIn ? (
            <>
              <MagneticWrapper strength={10}>
                <div className="relative group p-2 rounded-full hover:bg-slate-100/50 dark:hover:bg-white/10 cursor-pointer transition-colors">
                  <Search className="h-5 w-5 text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors" />
                </div>
              </MagneticWrapper>
              
              <MagneticWrapper strength={10}>
                <div className="relative group p-2 rounded-full hover:bg-slate-100/50 dark:hover:bg-white/10 cursor-pointer transition-colors mr-2">
                  <Bell className="h-5 w-5 text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors" />
                </div>
              </MagneticWrapper>
              
              <div className="relative ml-1">
                <MagneticWrapper strength={15}>
                  <button
                     onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                     className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-tr from-premium-blue to-premium-purple text-white shadow-premium transition-all hover:shadow-premium-bloom"
                   >
                     <User size={16} />
                   </button>
                </MagneticWrapper>
                
                <AnimatePresence>
                  {profileDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 15, scale: 0.95, filter: "blur(4px)" }}
                      animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
                      exit={{ opacity: 0, y: 15, scale: 0.95, filter: "blur(4px)" }}
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      className="absolute right-0 mt-3 w-56 rounded-2xl bg-white/80 dark:bg-slate-900/80 p-2 shadow-premium-hover backdrop-blur-3xl border border-white/60 dark:border-white/10 origin-top-right"
                    >
                      <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 mb-2">
                        <p className="truncate text-sm font-medium text-slate-900 dark:text-white">{email}</p>
                      </div>
                      <Link href="/dashboard" className="block w-full rounded-xl px-3 py-2 text-left text-sm text-slate-600 dark:text-slate-300 transition-colors hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white">Dashboard</Link>
                      <Link href="/profile" className="block w-full rounded-xl px-3 py-2 text-left text-sm text-slate-600 dark:text-slate-300 transition-colors hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white">My Profile</Link>
                      <button className="w-full rounded-xl px-3 py-2 text-left text-sm text-slate-600 dark:text-slate-300 transition-colors hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white">Settings</button>
                      <button
                        onClick={handleLogout}
                        className="w-full rounded-xl px-3 py-2 text-left text-sm text-premium-red transition-colors hover:bg-red-50 dark:hover:bg-red-500/10"
                      >
                        Log out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2 xl:gap-3 shrink-0">
              <Link
                href="/login"
                className="rounded-full px-4 py-2 text-[13px] xl:text-sm font-medium text-slate-600 dark:text-slate-300 transition-all hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white whitespace-nowrap"
              >
                Sign in
              </Link>
              <MagneticWrapper strength={15}>
                <Link
                  href="/signup"
                  className="rounded-full bg-gradient-to-r from-premium-blue to-premium-purple px-5 py-2 xl:px-6 xl:py-2.5 text-[13px] xl:text-sm font-medium text-white shadow-premium transition-all hover:shadow-premium-bloom relative overflow-hidden group whitespace-nowrap shrink-0"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    Get Started
                    <motion.span
                      initial={{ x: 0 }}
                      whileHover={{ x: 3 }}
                      className="inline-block"
                    >
                      →
                    </motion.span>
                  </span>
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]" />
                </Link>
              </MagneticWrapper>
            </div>
          )}
        </div>

        <button
          className="rounded-full p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-white/10 lg:hidden transition-colors relative z-10"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20, filter: "blur(10px)", scale: 0.95 }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)", scale: 1 }}
            exit={{ opacity: 0, y: -20, filter: "blur(10px)", scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="absolute top-[80px] left-4 right-4 rounded-3xl overflow-hidden border border-white/60 dark:border-white/10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-3xl lg:hidden shadow-premium-hover transform-gpu"
          >
            <div className="flex flex-col gap-1 px-4 py-4 max-h-[60vh] overflow-y-auto">
              {NAV_LINKS.map((link) => {
                const active = pathname === link.href || (pathname.startsWith(link.href + "/") && link.href !== "/");
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "rounded-xl px-4 py-3 text-sm font-medium transition-colors",
                      active
                        ? "bg-slate-50 dark:bg-white/10 text-slate-900 dark:text-white"
                        : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white"
                    )}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>
            <div className="border-t border-slate-100 dark:border-slate-800 px-4 py-4 bg-slate-50/50 dark:bg-slate-800/50">
              {isLoggedIn ? (
                <div className="flex flex-col gap-3">
                  {email && <span className="px-4 text-sm font-medium text-slate-900 dark:text-white truncate">{email}</span>}
                  <Link href="/dashboard" className="w-full rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-3 text-center text-sm font-medium text-slate-900 dark:text-white transition-colors hover:bg-slate-100 dark:hover:bg-slate-700">Dashboard</Link>
                  <Link href="/profile" className="w-full rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-3 text-center text-sm font-medium text-slate-900 dark:text-white transition-colors hover:bg-slate-100 dark:hover:bg-slate-700">My Profile</Link>
                  <button
                    onClick={handleLogout}
                    className="w-full rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-3 text-center text-sm font-medium text-slate-900 dark:text-white transition-colors hover:bg-slate-100 dark:hover:bg-slate-700"
                  >
                    Log out
                  </button>
                </div>
              ) : (
                <div className="flex gap-3">
                  <Link
                    href="/login"
                    className="flex-1 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-3 text-center text-sm font-medium text-slate-900 dark:text-white transition-colors hover:bg-slate-100 dark:hover:bg-slate-700"
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/signup"
                    className="flex-1 rounded-xl bg-slate-900 dark:bg-white px-4 py-3 text-center text-sm font-medium text-white dark:text-slate-900 transition-colors hover:bg-slate-800 dark:hover:bg-slate-100"
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
