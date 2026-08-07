"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  GraduationCap, 
  Users, 
  CheckCircle2, 
  FileCode2, 
  Award, 
  Clock, 
  Search, 
  BarChart3, 
  ChevronRight,
  BookOpen
} from "lucide-react";
import { api } from "@/lib/api/client";

export default function CollegeTeacherDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState("");
  const [collegeName, setCollegeName] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    const role = localStorage.getItem("user_role");
    const email = localStorage.getItem("user_email");

    if (!token || (role !== "college_teacher" && role !== "superadmin" && role !== "college_hod")) {
      router.push("/login?from=/college-teacher");
      return;
    }

    setUserEmail(email || "teacher@college.edu");

    api.get("/auth/me/profile")
      .then(res => {
        setCollegeName(res.data.college_name || "Department of Computer Engineering");
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="font-semibold text-slate-400">Loading Teacher Workspace...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pt-20 pb-16 px-4 md:px-8">
      
      {/* Header Bar */}
      <div className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg text-white">
            <GraduationCap size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
              Faculty / Teacher Portal
              <span className="text-xs bg-blue-500/20 text-blue-400 border border-blue-500/30 px-2.5 py-0.5 rounded-full font-extrabold uppercase tracking-wider">
                Teacher Role
              </span>
            </h1>
            <p className="text-xs text-slate-400">{collegeName} • {userEmail}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-slate-900 border border-slate-800 px-4 py-2 rounded-2xl text-xs font-semibold text-blue-400 flex items-center gap-2">
            <BookOpen size={16} /> Class Performance: <span className="font-black text-white">85.2% Avg Score</span>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
              <Users size={22} />
            </div>
            <span className="text-xs font-bold text-slate-500">Mentored Students</span>
          </div>
          <h3 className="text-3xl font-black text-white">45</h3>
          <p className="text-xs text-slate-400 mt-1">Assigned Division CSE-A</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <FileCode2 size={22} />
            </div>
            <span className="text-xs font-bold text-slate-500">Coding Practice</span>
          </div>
          <h3 className="text-3xl font-black text-white">184</h3>
          <p className="text-xs text-slate-400 mt-1">Coding Submissions Evaluated</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
              <Award size={22} />
            </div>
            <span className="text-xs font-bold text-slate-500">Resumes Reviewed</span>
          </div>
          <h3 className="text-3xl font-black text-white">42</h3>
          <p className="text-xs text-slate-400 mt-1">ATS Resumes Approved</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
              <CheckCircle2 size={22} />
            </div>
            <span className="text-xs font-bold text-slate-500">Interview Rating</span>
          </div>
          <h3 className="text-3xl font-black text-white">8.4<span className="text-sm font-normal text-slate-400">/10</span></h3>
          <p className="text-xs text-slate-400 mt-1">Average Mock Score</p>
        </div>
      </div>

      {/* Class Students Datatable */}
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
          <h3 className="text-lg font-extrabold text-white mb-4">Assigned Students Roster (Division CSE-A)</h3>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider font-extrabold border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">Student</th>
                  <th className="py-3.5 px-4">ATS Resume Score</th>
                  <th className="py-3.5 px-4">Coding Tests Passed</th>
                  <th className="py-3.5 px-4">Mock Interview Score</th>
                  <th className="py-3.5 px-4 text-right">Readiness Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                <tr className="hover:bg-slate-800/40">
                  <td className="py-3.5 px-4">
                    <span className="font-bold text-white block">Arjun Sharma</span>
                    <span className="text-[10px] text-slate-500">arjun.s@college.edu</span>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-blue-400">92 / 100</td>
                  <td className="py-3.5 px-4 font-bold text-amber-400">12 Tests Passed</td>
                  <td className="py-3.5 px-4 font-bold text-purple-400">8.8 / 10</td>
                  <td className="py-3.5 px-4 text-right"><span className="text-emerald-400 font-bold text-[10px] bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">Placement Ready</span></td>
                </tr>
                <tr className="hover:bg-slate-800/40">
                  <td className="py-3.5 px-4">
                    <span className="font-bold text-white block">Sneha Patil</span>
                    <span className="text-[10px] text-slate-500">sneha.p@college.edu</span>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-blue-400">88 / 100</td>
                  <td className="py-3.5 px-4 font-bold text-amber-400">9 Tests Passed</td>
                  <td className="py-3.5 px-4 font-bold text-purple-400">8.2 / 10</td>
                  <td className="py-3.5 px-4 text-right"><span className="text-emerald-400 font-bold text-[10px] bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">Placement Ready</span></td>
                </tr>
                <tr className="hover:bg-slate-800/40">
                  <td className="py-3.5 px-4">
                    <span className="font-bold text-white block">Rahul Deshmukh</span>
                    <span className="text-[10px] text-slate-500">rahul.d@college.edu</span>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-blue-400">76 / 100</td>
                  <td className="py-3.5 px-4 font-bold text-amber-400">6 Tests Passed</td>
                  <td className="py-3.5 px-4 font-bold text-purple-400">7.1 / 10</td>
                  <td className="py-3.5 px-4 text-right"><span className="text-amber-400 font-bold text-[10px] bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">In Training</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

    </div>
  );
}
