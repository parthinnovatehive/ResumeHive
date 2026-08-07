"use client";

import React, { useState } from "react";
import { 
  Settings, 
  ShieldCheck, 
  Key, 
  Sliders, 
  History, 
  Save, 
  CheckCircle2, 
  Cpu, 
  Lock,
  Database
} from "lucide-react";

export default function SuperAdminSettingsPage() {
  const [model, setModel] = useState("llama-3.1-8b-instant");
  const [proctorSensitivity, setProctorSensitivity] = useState("Strict");
  const [maxTabSwitches, setMaxTabSwitches] = useState(3);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Mock Audit Log History
  const [auditLogs] = useState([
    { id: 101, admin: "superadmin@gmail.com", action: "Seeded Assessment Questions CSV", entity: "Question Bank (27 Questions)", timestamp: "2026-08-07 09:20:14" },
    { id: 102, admin: "superadmin@gmail.com", action: "Updated System Prompt", entity: "Category #1 (Full Stack Persona)", timestamp: "2026-08-07 09:04:10" },
    { id: 103, admin: "superadmin@gmail.com", action: "Created User Account", entity: "teacher@college.edu (College Teacher)", timestamp: "2026-08-07 08:45:00" },
    { id: 104, admin: "superadmin@gmail.com", action: "Updated Role Privilege", entity: "hod@college.edu -> College HOD", timestamp: "2026-08-07 08:30:12" }
  ]);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-8">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <Settings className="text-indigo-400" size={24} /> System Settings &amp; Audit Logs
          </h1>
          <p className="text-xs text-slate-400">Configure LLM providers, candidate proctoring thresholds, and review administrative audit logs.</p>
        </div>

        {savedSuccess && (
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-2xl animate-fade-in">
            <CheckCircle2 size={16} /> System Settings Saved!
          </div>
        )}
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* LLM & AI Engine Settings */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
          <h3 className="text-base font-extrabold text-white flex items-center gap-2">
            <Cpu className="text-indigo-400" size={18} /> LLM Model &amp; AI Engine Configuration
          </h3>

          <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-400 font-bold mb-1">Active AI Inference Model</label>
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full p-3 bg-slate-950 border border-slate-800 rounded-2xl text-white outline-none font-semibold focus:border-indigo-500"
              >
                <option value="llama-3.1-8b-instant">Groq LLaMA 3.1 8B Instant (Ultra Fast - Default)</option>
                <option value="llama-3.3-70b-versatile">Groq LLaMA 3.3 70B Versatile (Deep Reasoning)</option>
                <option value="mixtral-8x7b-32768">Mixtral 8x7B Instruct</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 font-bold mb-1">Max Token Generation per Response</label>
              <input
                type="number"
                defaultValue={1024}
                className="w-full p-3 bg-slate-950 border border-slate-800 rounded-2xl text-white outline-none font-semibold"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-bold mb-1">Temperature (Creativity Scale)</label>
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.1"
                defaultValue={0.7}
                className="w-full accent-indigo-500"
              />
              <span className="text-[10px] text-slate-500 font-mono">Current: 0.7 (Balanced for Interviews)</span>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl transition-all shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2"
            >
              <Save size={16} /> Save AI Engine Settings
            </button>
          </form>
        </div>

        {/* Candidate Proctoring Controls */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
          <h3 className="text-base font-extrabold text-white flex items-center gap-2">
            <Lock className="text-amber-400" size={18} /> Candidate Proctoring &amp; Test Security
          </h3>

          <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-400 font-bold mb-1">Proctoring Enforcer Sensitivity</label>
              <select
                value={proctorSensitivity}
                onChange={(e) => setProctorSensitivity(e.target.value)}
                className="w-full p-3 bg-slate-950 border border-slate-800 rounded-2xl text-white outline-none font-semibold"
              >
                <option value="Strict">Strict (Camera Feed + Tab Violation Logging)</option>
                <option value="Moderate">Moderate (Tab Violation Logging Only)</option>
                <option value="Disabled">Disabled (Practice Mode)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 font-bold mb-1">Max Tab-Switch Warnings Before Auto-Terminate</label>
              <input
                type="number"
                value={maxTabSwitches}
                onChange={(e) => setMaxTabSwitches(Number(e.target.value))}
                className="w-full p-3 bg-slate-950 border border-slate-800 rounded-2xl text-white outline-none font-semibold"
              />
            </div>

            <div className="p-3 bg-slate-950 border border-slate-800 rounded-2xl text-[11px] text-slate-400 space-y-1">
              <span className="text-amber-400 font-bold block">SECURITY NOTE:</span>
              <p>When a candidate exceeds {maxTabSwitches} tab-switch violations during an assessment, the test session will automatically flag as suspicious.</p>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-2xl transition-all shadow-md shadow-amber-600/20 flex items-center justify-center gap-2"
            >
              <Save size={16} /> Save Security Thresholds
            </button>
          </form>
        </div>

      </div>

      {/* Admin Audit Logs Datatable */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <h3 className="text-base font-extrabold text-white flex items-center gap-2">
          <History className="text-purple-400" size={18} /> Administrative Audit Logs
        </h3>
        <p className="text-xs text-slate-400">Complete log history of CRUD operations, user role modifications, and system configuration updates.</p>

        <div className="overflow-x-auto pt-2">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider font-extrabold border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Log ID</th>
                <th className="py-3.5 px-4">Admin Account</th>
                <th className="py-3.5 px-4">Action Performed</th>
                <th className="py-3.5 px-4">Target Entity</th>
                <th className="py-3.5 px-4 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4 font-mono text-slate-500">#{log.id}</td>
                  <td className="py-3.5 px-4 font-extrabold text-indigo-400">{log.admin}</td>
                  <td className="py-3.5 px-4 font-bold text-white">{log.action}</td>
                  <td className="py-3.5 px-4 text-slate-400">{log.entity}</td>
                  <td className="py-3.5 px-4 text-right font-mono text-[10px] text-slate-500">{log.timestamp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
