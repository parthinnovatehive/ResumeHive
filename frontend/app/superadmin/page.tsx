"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { 
  Users, 
  FileCode2, 
  Video, 
  FileText, 
  BarChart3, 
  Plus, 
  UploadCloud, 
  RefreshCw, 
  TrendingUp, 
  Activity, 
  CheckCircle2, 
  ShieldCheck, 
  ArrowRight,
  Server,
  Zap,
  Database
} from "lucide-react";
import { api } from "@/lib/api/client";

export default function SuperAdminOverviewPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    loadOverviewStats();
  }, []);

  const loadOverviewStats = async () => {
    setLoading(true);
    try {
      const res = await api.get("/superadmin/stats");
      setStats(res.data);
    } catch (err) {
      console.error("Failed to load superadmin stats", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !stats) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-white">
        <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin mb-3" />
        <p className="text-xs font-bold text-slate-400">Loading System Analytics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            System Overview &amp; Analytics
          </h1>
          <p className="text-xs text-slate-400">Real-time database statistics, active users, test suites &amp; platform health.</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadOverviewStats}
            className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 transition-all"
            title="Refresh Metrics"
          >
            <RefreshCw size={16} />
          </button>
          <Link
            href="/superadmin/assessments"
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 transition-all flex items-center gap-2"
          >
            <UploadCloud size={16} />
            <span>Import CSV Tests</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-colors" />
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
              <Users size={22} />
            </div>
            <span className="text-[10px] font-extrabold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full uppercase">Students</span>
          </div>
          <h3 className="text-3xl font-black text-white">{stats?.total_students || 0}</h3>
          <p className="text-xs text-slate-400 mt-1">Total Registered Student Accounts</p>
          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
            <Link href="/superadmin/students" className="text-blue-400 font-bold hover:underline flex items-center gap-1">
              Manage Accounts <ArrowRight size={13} />
            </Link>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-colors" />
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <FileText size={22} />
            </div>
            <span className="text-[10px] font-extrabold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full uppercase">Resumes</span>
          </div>
          <h3 className="text-3xl font-black text-white">{stats?.total_resumes || 0}</h3>
          <p className="text-xs text-slate-400 mt-1">Total ATS Resumes Built</p>
          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
            <span className="text-slate-500 text-[10px]">AI Scanner Active</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-colors" />
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
              <FileCode2 size={22} />
            </div>
            <span className="text-[10px] font-extrabold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full uppercase">Questions</span>
          </div>
          <h3 className="text-3xl font-black text-white">{stats?.total_questions || 0}</h3>
          <p className="text-xs text-slate-400 mt-1">Across {stats?.total_assessments || 0} Test Suites</p>
          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
            <Link href="/superadmin/assessments" className="text-amber-400 font-bold hover:underline flex items-center gap-1">
              View Question Bank <ArrowRight size={13} />
            </Link>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition-colors" />
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
              <Video size={22} />
            </div>
            <span className="text-[10px] font-extrabold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full uppercase">Interviews</span>
          </div>
          <h3 className="text-3xl font-black text-white">{stats?.total_interviews || 0}</h3>
          <p className="text-xs text-slate-400 mt-1">{stats?.completed_interviews || 0} Completed Sessions</p>
          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
            <Link href="/superadmin/interviews" className="text-purple-400 font-bold hover:underline flex items-center gap-1">
              Candidate Logs <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Launchers */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-3">
              <Users size={20} />
            </div>
            <h3 className="text-base font-extrabold text-white mb-1">Users &amp; Roles Control</h3>
            <p className="text-xs text-slate-400 mb-6 leading-relaxed">Manage student accounts, assign faculty roles (HOD, Teacher), or inspect candidate resumes.</p>
          </div>
          <Link
            href="/superadmin/students"
            className="w-full py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2 shadow-md shadow-blue-600/20"
          >
            Manage Users <ArrowRight size={15} />
          </Link>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-3">
              <FileCode2 size={20} />
            </div>
            <h3 className="text-base font-extrabold text-white mb-1">Coding Question Bank</h3>
            <p className="text-xs text-slate-400 mb-6 leading-relaxed">Create custom coding test suites or upload LeetCode-style questions via CSV bulk import.</p>
          </div>
          <Link
            href="/superadmin/assessments"
            className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20"
          >
            Manage Assessments <ArrowRight size={15} />
          </Link>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-3">
              <Video size={20} />
            </div>
            <h3 className="text-base font-extrabold text-white mb-1">AI Mock Interview Personas</h3>
            <p className="text-xs text-slate-400 mb-6 leading-relaxed">Configure system prompts for AI mock interviewers and monitor candidate proctoring logs.</p>
          </div>
          <Link
            href="/superadmin/interviews"
            className="w-full py-3 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2 shadow-md shadow-purple-600/20"
          >
            Manage Interview Prompts <ArrowRight size={15} />
          </Link>
        </div>
      </div>

      {/* Platform Infrastructure Health */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
        <h3 className="text-base font-extrabold text-white mb-4 flex items-center gap-2">
          <Server className="text-indigo-400" size={18} /> Platform Infrastructure &amp; Health
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-slate-500 font-bold block">SQLite Database Engine</span>
              <span className="text-white font-extrabold text-sm">resumehive.db</span>
            </div>
            <Database className="text-emerald-400" size={20} />
          </div>

          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-slate-500 font-bold block">AI Groq Model</span>
              <span className="text-white font-extrabold text-sm">llama-3.1-8b-instant</span>
            </div>
            <Zap className="text-amber-400" size={20} />
          </div>

          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-slate-500 font-bold block">API Latency Status</span>
              <span className="text-emerald-400 font-extrabold text-sm">&lt; 45ms (Optimal)</span>
            </div>
            <Activity className="text-emerald-400 animate-pulse" size={20} />
          </div>
        </div>
      </div>

      {/* Recent Student Signups */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-base font-extrabold text-white">Recent Registered Students</h3>
          <Link href="/superadmin/students" className="text-xs font-bold text-indigo-400 hover:underline">
            View All Students &rarr;
          </Link>
        </div>
        <div className="divide-y divide-slate-800">
          {stats?.recent_students?.map((st: any) => (
            <div key={st.id} className="py-3 flex items-center justify-between text-xs">
              <div>
                <p className="font-extrabold text-white">{st.email}</p>
                <p className="text-[10px] text-slate-400">{st.college || "No College Specified"}</p>
              </div>
              <span className="text-[10px] font-mono text-slate-500">{st.created_at?.slice(0, 10)}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
