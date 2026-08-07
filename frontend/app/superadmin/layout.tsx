"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw, ShieldCheck } from "lucide-react";
import SuperAdminNavbar from "./components/SuperAdminNavbar";

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    const role = localStorage.getItem("user_role");
    const email = localStorage.getItem("user_email");

    if (!token || (role !== "superadmin" && email !== "superadmin@gmail.com")) {
      router.push("/login?from=/superadmin");
      return;
    }

    setAuthorized(true);
  }, []);

  if (!authorized) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white">
        <ShieldCheck className="w-12 h-12 text-indigo-500 animate-pulse mb-4" />
        <p className="font-extrabold text-sm text-slate-300">Authenticating Super Admin Credentials...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      <SuperAdminNavbar />
      <main className="pt-20 md:pt-20 pb-16 px-4 md:px-8 max-w-7xl mx-auto">
        {children}
      </main>
    </div>
  );
}
