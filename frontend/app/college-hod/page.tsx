"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Building2, 
  Users, 
  GraduationCap, 
  Award, 
  BarChart3, 
  FileText, 
  CheckCircle2, 
  Clock, 
  Search, 
  ShieldAlert, 
  TrendingUp,
  Briefcase
} from "lucide-react";
import { api } from "@/lib/api/client";

export default function CollegeHodDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState("");
  const [collegeName, setCollegeName] = useState("");
  const [students, setStudents] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    const role = localStorage.getItem("user_role");
    const email = localStorage.getItem("user_email");

    if (!token || (role !== "college_hod" && role !== "superadmin")) {
      router.push("/login?from=/college-hod");
      return;
    }

    setUserEmail(email || "hod@college.edu");
    
    // Fetch profile and data
    api.get("/auth/me/profile")
      .then(res => {
        setCollegeName(res.data.college_name || "Department of Computer Science & Engineering");
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white">
        <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="font-semibold text-slate-400">Loading HOD Portal Workspace...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pt-20 pb-16 px-4 md:px-8">
      
      {/* Header Bar */}
      <div className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-teal-600 to-emerald-600 flex items-center justify-center shadow-lg text-white">
            <Building2 size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
              Head of Department (HOD) Portal
              <span className="text-xs bg-teal-500/20 text-teal-400 border border-teal-500/30 px-2.5 py-0.5 rounded-full font-extrabold uppercase tracking-wider">
                HOD Role
              </span>
            </h1>
            <p className="text-xs text-slate-400">{collegeName} • {userEmail}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-slate-900 border border-slate-800 px-4 py-2 rounded-2xl text-xs font-semibold text-teal-400 flex items-center gap-2">
            <TrendingUp size={16} /> Placement Readiness: <span className="font-black text-white">88.4%</span>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center">
              <Users size={22} />
            </div>
            <span className="text-xs font-bold text-slate-500">Department</span>
          </div>
          <h3 className="text-3xl font-black text-white">240</h3>
          <p className="text-xs text-slate-400 mt-1">Total Department Students</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
              <GraduationCap size={22} />
            </div>
            <span className="text-xs font-bold text-slate-500">Faculty</span>
          </div>
          <h3 className="text-3xl font-black text-white">14</h3>
          <p className="text-xs text-slate-400 mt-1">Assigned Department Faculty</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
              <Award size={22} />
            </div>
            <span className="text-xs font-bold text-slate-500">Assessments</span>
          </div>
          <h3 className="text-3xl font-black text-white">520+</h3>
          <p className="text-xs text-slate-400 mt-1">Coding Tests Completed</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
              <Briefcase size={22} />
            </div>
            <span className="text-xs font-bold text-slate-500">Placements</span>
          </div>
          <h3 className="text-3xl font-black text-white">92</h3>
          <p className="text-xs text-slate-400 mt-1">Students Shortlisted in Drive</p>
        </div>
      </div>

      {/* Main Section */}
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Department Batches Breakdown */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
          <h3 className="text-lg font-extrabold text-white mb-4">Department Batches Performance</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex justify-between items-center">
                <h4 className="font-extrabold text-sm text-white">Batch 2026 (Final Year)</h4>
                <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded">91% Ready</span>
              </div>
              <p className="text-xs text-slate-400">120 Students • 4 Faculty Mentors</p>
              <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full w-[91%]" />
              </div>
            </div>

            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex justify-between items-center">
                <h4 className="font-extrabold text-sm text-white">Batch 2027 (Pre-Final Year)</h4>
                <span className="text-[10px] font-bold bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded">84% Ready</span>
              </div>
              <p className="text-xs text-slate-400">70 Students • 5 Faculty Mentors</p>
              <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                <div className="bg-blue-500 h-full w-[84%]" />
              </div>
            </div>

            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex justify-between items-center">
                <h4 className="font-extrabold text-sm text-white">Batch 2028 (Sophomore)</h4>
                <span className="text-[10px] font-bold bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded">76% Ready</span>
              </div>
              <p className="text-xs text-slate-400">50 Students • 5 Faculty Mentors</p>
              <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full w-[76%]" />
              </div>
            </div>
          </div>
        </div>

        {/* Faculty Roster */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
          <h3 className="text-lg font-extrabold text-white mb-4">Department Faculty Roster &amp; Assigned Roles</h3>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider font-extrabold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Faculty Member</th>
                  <th className="py-3 px-4">Designation</th>
                  <th className="py-3 px-4">Assigned Batch</th>
                  <th className="py-3 px-4">Students Mentored</th>
                  <th className="py-3 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                <tr className="hover:bg-slate-800/40">
                  <td className="py-3.5 px-4 font-bold text-white">Dr. Ramesh Verma</td>
                  <td className="py-3.5 px-4 text-slate-400">Associate Professor</td>
                  <td className="py-3.5 px-4 text-teal-400 font-semibold">Batch 2026 - CSE A</td>
                  <td className="py-3.5 px-4 font-bold">40 Students</td>
                  <td className="py-3.5 px-4 text-right"><span className="text-emerald-400 font-bold text-[10px] bg-emerald-500/10 px-2 py-0.5 rounded">Active</span></td>
                </tr>
                <tr className="hover:bg-slate-800/40">
                  <td className="py-3.5 px-4 font-bold text-white">Prof. Priya Kulkarni</td>
                  <td className="py-3.5 px-4 text-slate-400">Assistant Professor</td>
                  <td className="py-3.5 px-4 text-teal-400 font-semibold">Batch 2026 - CSE B</td>
                  <td className="py-3.5 px-4 font-bold">40 Students</td>
                  <td className="py-3.5 px-4 text-right"><span className="text-emerald-400 font-bold text-[10px] bg-emerald-500/10 px-2 py-0.5 rounded">Active</span></td>
                </tr>
                <tr className="hover:bg-slate-800/40">
                  <td className="py-3.5 px-4 font-bold text-white">Dr. Amit Shah</td>
                  <td className="py-3.5 px-4 text-slate-400">Professor</td>
                  <td className="py-3.5 px-4 text-teal-400 font-semibold">Batch 2027 - CSE A</td>
                  <td className="py-3.5 px-4 font-bold">35 Students</td>
                  <td className="py-3.5 px-4 text-right"><span className="text-emerald-400 font-bold text-[10px] bg-emerald-500/10 px-2 py-0.5 rounded">Active</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  );
}
