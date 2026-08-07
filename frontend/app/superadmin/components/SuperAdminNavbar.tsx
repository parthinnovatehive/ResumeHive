"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  ShieldCheck, 
  BarChart3, 
  Users, 
  FileCode2, 
  Video, 
  CreditCard,
  Settings, 
  LogOut, 
  Activity, 
  Bell, 
  Search,
  ExternalLink
} from "lucide-react";

export default function SuperAdminNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [adminEmail, setAdminEmail] = useState<string>("superadmin@gmail.com");

  useEffect(() => {
    const email = localStorage.getItem("user_email");
    if (email) setAdminEmail(email);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user_email");
    localStorage.removeItem("user_role");
    router.push("/login");
  };

  const navLinks = [
    { name: "Overview", href: "/superadmin", icon: BarChart3 },
    { name: "Students & Users", href: "/superadmin/students", icon: Users },
    { name: "Subscriptions & Licenses", href: "/superadmin/subscriptions", icon: CreditCard },
    { name: "Assessments & Tests", href: "/superadmin/assessments", icon: FileCode2 },
    { name: "Mock Interviews", href: "/superadmin/interviews", icon: Video },
    { name: "Settings & Audit", href: "/superadmin/settings", icon: Settings },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-slate-950/90 backdrop-blur-2xl border-b border-slate-800/80 shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Left Branding */}
        <div className="flex items-center gap-3 shrink-0">
          <Link href="/superadmin" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/30 group-hover:scale-105 transition-transform">
              <ShieldCheck size={20} />
            </div>
            <div>
              <span className="font-black text-sm text-white tracking-tight block leading-none">
                ResumeHive
              </span>
              <span className="text-[10px] font-extrabold text-indigo-400 uppercase tracking-widest">
                Super Admin
              </span>
            </div>
          </Link>

          <div className="hidden sm:flex items-center gap-1.5 ml-3 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-extrabold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            System Healthy
          </div>
        </div>

        {/* Center Route Links */}
        <nav className="hidden lg:flex items-center gap-1 bg-slate-900/90 p-1 border border-slate-800 rounded-2xl">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                }`}
              >
                <Icon size={14} />
                <span>{link.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right Section / Profile */}
        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/dashboard"
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-bold transition-all"
            title="View Student Portal"
          >
            <span>Student App</span>
            <ExternalLink size={13} />
          </Link>

          <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
            <div className="hidden sm:block text-right">
              <span className="text-xs font-bold text-white block truncate max-w-[140px]">{adminEmail}</span>
              <span className="text-[9px] font-extrabold text-indigo-400 uppercase tracking-wider block">Super Admin</span>
            </div>

            <button
              onClick={handleLogout}
              className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-all"
              title="Logout Super Admin"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>

      </div>

      {/* Mobile Sub-Navigation Bar */}
      <div className="lg:hidden flex items-center gap-1 overflow-x-auto px-4 py-2 bg-slate-900/60 border-t border-slate-800/60 custom-scrollbar">
        {navLinks.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                isActive
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Icon size={13} />
              <span>{link.name}</span>
            </Link>
          );
        })}
      </div>
    </header>
  );
}
