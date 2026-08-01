"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, Bell, Search, User, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { MagneticWrapper } from "./MagneticWrapper";

const NAV_LINKS = [
  { href: "/dashboard", label: "Dashboard" },
  { 
    href: "/resume-builder", 
    label: "Resume Builder",
    children: [
      { href: "/resumes", label: "My Resumes" },
      { href: "/ats-analyzer", label: "ATS Score" }
    ]
  },
  { href: "/portfolio", label: "Portfolio" },
  { href: "/practice", label: "Practice" },
  { href: "/jobs", label: "Jobs" },
  { href: "/interview", label: "Interview" },
  { href: "/linkedin", label: "LinkedIn" },
  { href: "/analytics", label: "Analytics" },
  { href: "/test", label: "Test" },
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
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);

  useEffect(() => {
    setIsLoggedIn(Boolean(localStorage.getItem("access_token")));
    setEmail(localStorage.getItem("user_email"));
    setMobileOpen(false);
    
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    
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

  const isHeroTop = pathname === "/" && !scrolled;

  return (
    <header className="fixed top-0 left-0 right-0 z-[100] pt-4 px-4 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]">
      <nav 
        className={cn(
          "mx-auto flex items-center justify-between px-4 lg:px-6 2xl:px-8 rounded-full transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] relative",
          scrolled 
            ? "h-[64px] w-[98%] max-w-[1600px] bg-white/70 dark:bg-slate-950/70 backdrop-blur-3xl border border-white/40 dark:border-white/10 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.15)] ring-1 ring-slate-900/5 dark:ring-white/10" 
            : "h-[80px] w-full max-w-[1800px] bg-transparent border border-transparent"
        )}
      >
        {scrolled && (
          <div className="absolute inset-0 z-0 pointer-events-none opacity-50 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full animate-[shimmer_3s_infinite] rounded-full overflow-hidden" />
        )}

        <div className="flex items-center gap-4 2xl:gap-8 relative z-10">
          <Link href="/" className="group flex items-center text-xl font-extrabold tracking-tight shrink-0">
            <span className={cn("transition-colors", isHeroTop ? "text-black" : "text-black dark:text-white")}>Resume</span>
            <span className={cn("transition-colors ml-[1px]", isHeroTop ? "text-slate-700" : "text-blue-600 dark:text-blue-400")}>
              Hive
            </span>
          </Link>
          
          <div className="hidden items-center gap-1 xl:flex">
            {NAV_LINKS.map((link) => {
              const active = pathname === link.href || (pathname.startsWith(link.href + "/") && link.href !== "/");
              const isHovered = hoveredLink === link.href;
              
              return (
                <div 
                  key={link.href}
                  className="relative group"
                  onMouseEnter={() => setHoveredLink(link.href)}
                  onMouseLeave={() => setHoveredLink(null)}
                >
                  <Link
                    href={link.href}
                    className={cn(
                      "relative flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[14px] font-bold transition-all duration-300 whitespace-nowrap z-10",
                      isHovered
                        ? (isHeroTop ? "text-black" : "text-black dark:text-white") 
                        : (isHeroTop 
                            ? (active ? "text-black" : "text-black/70") 
                            : (active ? "text-blue-600 dark:text-blue-400" : "text-slate-600 dark:text-slate-300"))
                    )}
                  >
                    <span className="relative z-10">{link.label}</span>
                    {link.children && (
                      <ChevronDown className={cn(
                        "w-3.5 h-3.5 relative z-10 transition-transform duration-300",
                        isHovered ? "rotate-180" : ""
                      )} />
                    )}
                  </Link>

                  {/* Active Indicator */}
                  {active && !isHovered && (
                    <motion.div
                      layoutId="navbar-active-indicator"
                      className={cn(
                        "absolute inset-0 z-0 rounded-full border",
                        isHeroTop 
                          ? "bg-black/5 border-black/10" 
                          : "bg-slate-100/80 dark:bg-white/10 border-slate-200/50 dark:border-white/10"
                      )}
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}

                  {/* Premium Hover Pill Indicator */}
                  {isHovered && !active && (
                    <motion.div
                      layoutId="navbar-hover-indicator"
                      className={cn(
                        "absolute inset-0 z-0 rounded-full",
                        isHeroTop ? "bg-black/10 backdrop-blur-md" : "bg-gradient-to-r from-premium-blue/10 to-premium-purple/10 dark:from-premium-blue/20 dark:to-premium-purple/20 shadow-sm border border-premium-blue/20 dark:border-white/10"
                      )}
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}

                  {/* Dropdown Menu */}
                  {link.children && (
                    <AnimatePresence>
                      {isHovered && (
                        <motion.div
                          initial={{ opacity: 0, y: 15, scale: 0.95, filter: "blur(8px)" }}
                          animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
                          exit={{ opacity: 0, y: 15, scale: 0.95, filter: "blur(8px)" }}
                          transition={{ type: "spring", stiffness: 400, damping: 25 }}
                          className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-52 rounded-2xl bg-white/90 dark:bg-slate-900/90 p-2 shadow-[0_30px_60px_rgba(15,82,186,0.15)] backdrop-blur-3xl border border-premium-blue/20 dark:border-white/10 ring-1 ring-black/5 dark:ring-white/10 origin-top z-50"
                        >
                          <div className="flex flex-col gap-1">
                            {link.children.map((child) => (
                              <Link
                                key={child.href}
                                href={child.href}
                                className="block w-full rounded-xl px-4 py-3 text-left text-sm font-semibold text-slate-800 dark:text-slate-200 transition-all hover:bg-slate-100 dark:hover:bg-white/10 hover:text-black dark:hover:text-white hover:translate-x-1 hover:shadow-sm"
                              >
                                {child.label}
                              </Link>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="hidden items-center gap-2 2xl:gap-3 lg:flex relative z-10 shrink-0">
          {isLoggedIn ? (
            <>
              <MagneticWrapper strength={10}>
                <div className={cn("relative group p-2 rounded-full cursor-pointer transition-all", isHeroTop ? "hover:bg-black/10" : "hover:bg-slate-100 dark:hover:bg-white/10")}>
                  <Search className={cn("h-5 w-5 transition-colors", isHeroTop ? "text-black/80 group-hover:text-black" : "text-slate-600 dark:text-slate-400 group-hover:text-black dark:group-hover:text-white")} />
                </div>
              </MagneticWrapper>
              
              <MagneticWrapper strength={10}>
                <div className={cn("relative group p-2 rounded-full cursor-pointer transition-all mr-2", isHeroTop ? "hover:bg-black/10" : "hover:bg-slate-100 dark:hover:bg-white/10")}>
                  <Bell className={cn("h-5 w-5 transition-colors", isHeroTop ? "text-black/80 group-hover:text-black" : "text-slate-600 dark:text-slate-400 group-hover:text-black dark:group-hover:text-white")} />
                </div>
              </MagneticWrapper>
              
              <div className="relative ml-1">
                <MagneticWrapper strength={15}>
                  <button
                     onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                     className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-lg transition-all hover:shadow-xl hover:scale-105"
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
                      className="absolute right-0 mt-3 w-56 rounded-2xl bg-white/90 dark:bg-slate-900/90 p-2 shadow-[0_30px_60px_rgba(15,82,186,0.15)] backdrop-blur-3xl border border-premium-blue/20 dark:border-white/10 ring-1 ring-black/5 dark:ring-white/10 origin-top-right z-50"
                    >
                      <div className="px-3 py-2 border-b border-slate-200 dark:border-slate-800 mb-2">
                        <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{email}</p>
                      </div>
                      <Link href="/dashboard" className="block w-full rounded-xl px-3 py-2 text-left text-sm font-semibold text-slate-700 dark:text-slate-300 transition-colors hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white">Dashboard</Link>
                      <Link href="/profile" className="block w-full rounded-xl px-3 py-2 text-left text-sm font-semibold text-slate-700 dark:text-slate-300 transition-colors hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white">My Profile</Link>
                      <button className="w-full rounded-xl px-3 py-2 text-left text-sm font-semibold text-slate-700 dark:text-slate-300 transition-colors hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white">Settings</button>
                      <button
                        onClick={handleLogout}
                        className="w-full rounded-xl px-3 py-2 mt-1 text-left text-sm font-bold text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-500/10"
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
                className={cn(
                  "rounded-full px-5 py-2.5 text-[14px] font-bold transition-all whitespace-nowrap",
                  isHeroTop 
                    ? "text-black hover:bg-black/10" 
                    : "text-black dark:text-white hover:bg-premium-blue/10 hover:text-premium-blue dark:hover:bg-white/10 hover:shadow-sm"
                )}
              >
                Sign in
              </Link>
              <MagneticWrapper strength={15}>
                <Link
                  href="/signup"
                  className={cn(
                    "rounded-full px-6 py-2.5 text-[14px] font-bold shadow-lg transition-all hover:scale-105 relative overflow-hidden group whitespace-nowrap shrink-0",
                    isHeroTop 
                      ? "bg-black text-white hover:shadow-[0_0_30px_rgba(0,0,0,0.3)]" 
                      : "bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:shadow-[0_0_30px_rgba(15,23,42,0.3)] dark:hover:shadow-[0_0_30px_rgba(255,255,255,0.4)]"
                  )}
                >
                  <span className="relative z-10 flex items-center gap-2 tracking-wide">
                    Get Started
                    <motion.span
                      initial={{ x: 0 }}
                      whileHover={{ x: 3 }}
                      className="inline-block"
                    >
                      →
                    </motion.span>
                  </span>
                  <div className={cn(
                    "absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300 ease-out",
                    isHeroTop ? "bg-white" : "bg-gradient-to-r from-blue-500 to-indigo-500"
                  )} />
                </Link>
              </MagneticWrapper>
            </div>
          )}
        </div>

        <button
          className={cn(
            "rounded-full p-2 lg:hidden transition-colors relative z-10",
            isHeroTop ? "text-black hover:bg-black/10" : "text-black dark:text-white hover:bg-slate-100 dark:hover:bg-white/10"
          )}
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
            className="absolute top-[80px] left-4 right-4 rounded-3xl overflow-hidden border border-slate-200/50 dark:border-white/10 bg-white/95 dark:bg-slate-900/95 backdrop-blur-3xl lg:hidden shadow-[0_30px_60px_rgba(0,0,0,0.3)] transform-gpu z-[200]"
          >
            <div className="flex flex-col gap-1 px-4 py-4 max-h-[60vh] overflow-y-auto">
              {NAV_LINKS.map((link) => {
                const active = pathname === link.href || (pathname.startsWith(link.href + "/") && link.href !== "/");
                return (
                  <div key={link.href} className="flex flex-col gap-1">
                    <Link
                      href={link.href}
                      onClick={() => !link.children && setMobileOpen(false)}
                      className={cn(
                        "rounded-xl px-4 py-3 text-[15px] font-bold transition-colors flex justify-between items-center",
                        active
                          ? "bg-blue-50 dark:bg-white/10 text-blue-600 dark:text-white"
                          : "text-slate-900 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-white/5"
                      )}
                    >
                      {link.label}
                      {link.children && <ChevronDown className="w-4 h-4" />}
                    </Link>
                    {link.children && (
                      <div className="flex flex-col gap-1 pl-4 border-l-2 border-slate-100 dark:border-slate-800 ml-4 mt-1">
                        {link.children.map(child => (
                          <Link
                            key={child.href}
                            href={child.href}
                            onClick={() => setMobileOpen(false)}
                            className="rounded-xl px-4 py-2.5 text-[14px] font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-black dark:hover:text-white transition-colors"
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="border-t border-slate-200 dark:border-slate-800 px-4 py-5 bg-slate-50/80 dark:bg-slate-900/80">
              {isLoggedIn ? (
                <div className="flex flex-col gap-3">
                  {email && <span className="px-4 text-sm font-semibold text-slate-900 dark:text-white truncate">{email}</span>}
                  <Link href="/dashboard" className="w-full rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-3.5 text-center text-[15px] font-bold text-slate-900 dark:text-white transition-colors shadow-sm">Dashboard</Link>
                  <Link href="/profile" className="w-full rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-3.5 text-center text-[15px] font-bold text-slate-900 dark:text-white transition-colors shadow-sm">My Profile</Link>
                  <button
                    onClick={handleLogout}
                    className="w-full rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 px-4 py-3.5 text-center text-[15px] font-bold text-red-600 dark:text-red-400 transition-colors mt-2"
                  >
                    Log out
                  </button>
                </div>
              ) : (
                <div className="flex gap-3">
                  <Link
                    href="/login"
                    className="flex-1 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-3.5 text-center text-[15px] font-bold text-slate-900 dark:text-white transition-colors shadow-sm"
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/signup"
                    className="flex-1 rounded-xl bg-slate-900 dark:bg-white px-4 py-3.5 text-center text-[15px] font-bold text-white dark:text-slate-900 transition-colors shadow-md"
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
