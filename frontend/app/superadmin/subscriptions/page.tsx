"use client";

import React, { useEffect, useState } from "react";
import { 
  CreditCard, 
  Building2, 
  Plus, 
  Trash2, 
  Edit3, 
  UploadCloud, 
  X, 
  CheckCircle2, 
  ShieldCheck, 
  Users, 
  Sparkles,
  Search,
  Globe,
  Lock,
  TrendingUp,
  DollarSign,
  PieChart,
  Check
} from "lucide-react";
import { api } from "@/lib/api/client";

export default function SuperAdminSubscriptionsPage() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"plans" | "colleges" | "sandbox">("plans");
  
  const [plans, setPlans] = useState<any[]>([]);
  const [colleges, setColleges] = useState<any[]>([]);

  // Modals
  const [showAddPlanModal, setShowAddPlanModal] = useState(false);
  const [editPlanModal, setEditPlanModal] = useState<any>(null);

  const [showAddCollegeModal, setShowAddCollegeModal] = useState(false);
  const [editCollegeModal, setEditCollegeModal] = useState<any>(null);

  const [csvUploadCollege, setCsvUploadCollege] = useState<any>(null);

  // Forms
  const [planForm, setPlanForm] = useState({
    name: "",
    plan_type: "individual",
    price_monthly: 499,
    price_yearly: 3999,
    currency: "INR",
    badge_tag: "Popular",
    discount_percentage: 15,
    trial_period_days: 7,
    max_resumes: 5,
    max_mock_interviews_per_month: 15,
    max_ats_scans_per_month: 20,
    allow_custom_questions: true,
    allow_advanced_analytics: true,
    allow_proctoring_reports: true,
    support_level: "Priority Email",
    is_popular: true,
    features_input: "5 Tailored ATS Resumes\n15 AI Mock Interviews\n20 Deep ATS Score Audits"
  });

  const [collegeForm, setCollegeForm] = useState({
    college_name: "",
    contract_code: "CONTRACT-2026-PCCOE-01",
    allowed_domain: "pccoe.edu.in",
    subscription_plan_id: 3,
    max_students_allowed: 500,
    hod_email: "hod.cse@pccoe.edu.in",
    billing_contact_name: "Dr. Finance Officer",
    college_logo_url: "",
    auto_approve_domain_signup: true,
    status: "Active"
  });

  const [csvFile, setCsvFile] = useState<File | null>(null);

  // Domain Sandbox State
  const [testEmail, setTestEmail] = useState("student@pccoe.edu.in");
  const [sandboxResult, setSandboxResult] = useState<any>(null);
  const [testingDomain, setTestingDomain] = useState(false);

  useEffect(() => {
    loadSubscriptionsData();
  }, []);

  const loadSubscriptionsData = async () => {
    setLoading(true);
    try {
      const [plansRes, collegesRes] = await Promise.all([
        api.get("/subscriptions/plans"),
        api.get("/subscriptions/superadmin/college-licenses")
      ]);
      setPlans(plansRes.data);
      setColleges(collegesRes.data);

      if (plansRes.data.length > 0) {
        setCollegeForm(prev => ({ ...prev, subscription_plan_id: plansRes.data[0].id }));
      }
    } catch (err) {
      console.error("Failed to load subscription data", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const features = planForm.features_input.split("\n").filter(f => f.trim().length > 0);
      await api.post("/subscriptions/superadmin/plans", {
        ...planForm,
        features
      });
      setShowAddPlanModal(false);
      loadSubscriptionsData();
      alert("Subscription pricing plan created!");
    } catch (err) {
      alert("Failed to create plan");
    }
  };

  const handleUpdatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editPlanModal) return;
    try {
      const features = typeof editPlanModal.features_input === "string" 
        ? editPlanModal.features_input.split("\n").filter((f: string) => f.trim().length > 0)
        : editPlanModal.features;

      await api.put(`/subscriptions/superadmin/plans/${editPlanModal.id}`, {
        ...editPlanModal,
        features
      });
      setEditPlanModal(null);
      loadSubscriptionsData();
      alert("Subscription plan updated successfully!");
    } catch (err) {
      alert("Failed to update plan");
    }
  };

  const handleDeletePlan = async (id: number) => {
    if (!confirm("Delete this subscription plan?")) return;
    try {
      await api.delete(`/subscriptions/superadmin/plans/${id}`);
      loadSubscriptionsData();
    } catch (err) {
      alert("Failed to delete plan");
    }
  };

  const handleCreateCollege = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/subscriptions/superadmin/college-licenses", collegeForm);
      setShowAddCollegeModal(false);
      loadSubscriptionsData();
      alert("College Enterprise Agreement created!");
    } catch (err) {
      alert("Failed to create college license");
    }
  };

  const handleUpdateCollege = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editCollegeModal) return;
    try {
      await api.put(`/subscriptions/superadmin/college-licenses/${editCollegeModal.id}`, editCollegeModal);
      setEditCollegeModal(null);
      loadSubscriptionsData();
      alert("College Enterprise License updated successfully!");
    } catch (err) {
      alert("Failed to update college license");
    }
  };

  const handleDeleteCollege = async (id: number) => {
    if (!confirm("Delete this college license agreement?")) return;
    try {
      await api.delete(`/subscriptions/superadmin/college-licenses/${id}`);
      loadSubscriptionsData();
    } catch (err) {
      alert("Failed to delete college license");
    }
  };

  const handleImportStudentsCsv = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!csvFile || !csvUploadCollege) return;

    const formData = new FormData();
    formData.append("file", csvFile);

    try {
      const res = await api.post(`/subscriptions/superadmin/college-licenses/${csvUploadCollege.id}/import-students-csv`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setCsvUploadCollege(null);
      setCsvFile(null);
      loadSubscriptionsData();
      alert(res.data.message || "College Students Registered Successfully!");
    } catch (err: any) {
      alert(err?.response?.data?.detail || "CSV registration failed");
    }
  };

  const handleTestDomainVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setTestingDomain(true);
    try {
      const res = await api.post("/subscriptions/superadmin/test-domain-verification", { email: testEmail });
      setSandboxResult(res.data);
    } catch (err) {
      alert("Failed to test domain");
    } finally {
      setTestingDomain(false);
    }
  };

  // Compute Total Metrics
  const totalCapacity = colleges.reduce((sum, c) => sum + (c.max_students_allowed || 0), 0);
  const totalOccupied = colleges.reduce((sum, c) => sum + (c.current_registered_count || 0), 0);
  const totalARR = colleges.reduce((sum, c) => {
    const plan = plans.find(p => p.id === c.subscription_plan_id);
    return sum + (plan ? (plan.price_yearly || plan.price_monthly * 12) : 0);
  }, 0);

  return (
    <div className="space-y-8">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <CreditCard className="text-emerald-400" size={24} /> Subscriptions &amp; Enterprise Licensing
          </h1>
          <p className="text-xs text-slate-400">Full CRUD for pricing plans, B2B college contracts, domain auto-verification, and student seat capacity.</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddCollegeModal(true)}
            className="px-4 py-2.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-bold text-xs rounded-2xl transition-all flex items-center gap-2 shadow-md shadow-emerald-600/20"
          >
            <Building2 size={16} /> New College Agreement
          </button>
          <button
            onClick={() => setShowAddPlanModal(true)}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-2xl transition-all flex items-center gap-2 shadow-md shadow-indigo-600/20"
          >
            <Plus size={16} /> New Pricing Plan
          </button>
        </div>
      </div>

      {/* KPI Financial Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
          <div className="flex justify-between items-start mb-2">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <DollarSign size={20} />
            </div>
            <span className="text-[10px] font-extrabold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full uppercase">Est. ARR</span>
          </div>
          <h3 className="text-2xl font-black text-white">₹{totalARR.toLocaleString()}</h3>
          <p className="text-xs text-slate-400 mt-1">Annual Recurring Revenue Contract Value</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
          <div className="flex justify-between items-start mb-2">
            <div className="w-10 h-10 rounded-2xl bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center">
              <Building2 size={20} />
            </div>
            <span className="text-[10px] font-extrabold text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded-full uppercase">Campus Agreements</span>
          </div>
          <h3 className="text-2xl font-black text-white">{colleges.length} Colleges</h3>
          <p className="text-xs text-slate-400 mt-1">Active Enterprise Contracts</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
          <div className="flex justify-between items-start mb-2">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <Users size={20} />
            </div>
            <span className="text-[10px] font-extrabold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full uppercase">Seat Utilization</span>
          </div>
          <h3 className="text-2xl font-black text-white">{totalOccupied} / {totalCapacity}</h3>
          <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden mt-2 border border-slate-800">
            <div className="bg-indigo-500 h-full" style={{ width: `${totalCapacity > 0 ? (totalOccupied / totalCapacity) * 100 : 0}%` }} />
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab("plans")}
          className={`px-5 py-2.5 rounded-2xl text-xs font-extrabold transition-all flex items-center gap-2 ${
            activeTab === "plans"
              ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
              : "bg-slate-900 text-slate-400 hover:text-white"
          }`}
        >
          <Sparkles size={16} /> Pricing Plans ({plans.length})
        </button>
        <button
          onClick={() => setActiveTab("colleges")}
          className={`px-5 py-2.5 rounded-2xl text-xs font-extrabold transition-all flex items-center gap-2 ${
            activeTab === "colleges"
              ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
              : "bg-slate-900 text-slate-400 hover:text-white"
          }`}
        >
          <Building2 size={16} /> College Contracts ({colleges.length})
        </button>
        <button
          onClick={() => setActiveTab("sandbox")}
          className={`px-5 py-2.5 rounded-2xl text-xs font-extrabold transition-all flex items-center gap-2 ${
            activeTab === "sandbox"
              ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
              : "bg-slate-900 text-slate-400 hover:text-white"
          }`}
        >
          <Globe size={16} /> Domain Verification Sandbox
        </button>
      </div>

      {/* TAB 1: SUBSCRIPTION PLANS */}
      {activeTab === "plans" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((p) => (
            <div key={p.id} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between relative overflow-hidden group">
              <div>
                <div className="flex justify-between items-start mb-3">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                    p.plan_type === "college" ? "bg-teal-500/20 text-teal-400 border border-teal-500/30" : "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30"
                  }`}>
                    {p.plan_type} Tier {p.badge_tag ? `• ${p.badge_tag}` : ""}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setEditPlanModal({
                        ...p,
                        features_input: p.features ? p.features.join("\n") : ""
                      })}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 transition-colors"
                      title="Edit Plan"
                    >
                      <Edit3 size={14} />
                    </button>
                    <button
                      onClick={() => handleDeletePlan(p.id)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 text-rose-400 transition-colors"
                      title="Delete Plan"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <h3 className="text-xl font-black text-white mb-1">{p.name}</h3>
                <div className="flex items-baseline gap-1 my-3">
                  <span className="text-3xl font-black text-white">₹{p.price_monthly}</span>
                  <span className="text-xs text-slate-400 font-semibold">/ month</span>
                  {p.discount_percentage > 0 && (
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded ml-2">
                      {p.discount_percentage}% OFF
                    </span>
                  )}
                </div>

                <div className="space-y-2 py-3 border-t border-b border-slate-800/80 my-4 text-xs font-medium">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Max Resumes:</span>
                    <span className="font-extrabold text-white">{p.max_resumes === -1 ? "Unlimited" : p.max_resumes}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Monthly AI Interviews:</span>
                    <span className="font-extrabold text-purple-400">{p.max_mock_interviews_per_month === -1 ? "Unlimited" : p.max_mock_interviews_per_month}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Monthly ATS Scans:</span>
                    <span className="font-extrabold text-emerald-400">{p.max_ats_scans_per_month === -1 ? "Unlimited" : p.max_ats_scans_per_month}</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-400">Support Tier:</span>
                    <span className="font-bold text-indigo-400">{p.support_level || "Standard"}</span>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-slate-300">
                  <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">Unlocked Features:</span>
                  {p.features?.map((f: string, i: number) => (
                    <div key={i} className="flex items-center gap-2 text-xs">
                      <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 2: COLLEGE ENTERPRISE LICENSES */}
      {activeTab === "colleges" && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
          <div className="flex justify-between items-center pb-4 border-b border-slate-800">
            <div>
              <h3 className="text-lg font-extrabold text-white">Active College Licenses &amp; Enterprise Contracts</h3>
              <p className="text-xs text-slate-400">Domain-verified campus licenses, capacity limits, and bulk student onboarding.</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider font-extrabold border-b border-slate-800">
                <tr>
                  <th className="py-4 px-4">College &amp; Contract</th>
                  <th className="py-4 px-4">Allowed Email Domain</th>
                  <th className="py-4 px-4">Assigned Plan</th>
                  <th className="py-4 px-4">Student Capacity</th>
                  <th className="py-4 px-4">Contacts</th>
                  <th className="py-4 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {colleges.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-4 px-4">
                      <span className="font-extrabold text-white block">{c.college_name}</span>
                      <span className="text-[10px] text-slate-500 font-mono">{c.contract_code || `LICENSE #${c.id}`}</span>
                    </td>
                    <td className="py-4 px-4">
                      {c.allowed_domain ? (
                        <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono text-[10px]">
                          @{c.allowed_domain}
                        </span>
                      ) : (
                        <span className="text-slate-500 text-[10px]">No Domain Restriction</span>
                      )}
                    </td>
                    <td className="py-4 px-4 font-bold text-teal-400">{c.subscription_plan_name}</td>
                    <td className="py-4 px-4">
                      <span className="font-extrabold text-white">{c.current_registered_count}</span> / {c.max_students_allowed} Students
                    </td>
                    <td className="py-4 px-4 text-slate-400 text-[10px]">
                      <div>HOD: {c.hod_email || "—"}</div>
                      <div>Fin: {c.billing_contact_name || "—"}</div>
                    </td>
                    <td className="py-4 px-4 text-right space-x-2">
                      <button
                        onClick={() => setEditCollegeModal(c)}
                        className="p-2 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-xl transition-colors"
                        title="Edit College License"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button
                        onClick={() => setCsvUploadCollege(c)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-[11px] transition-colors inline-flex items-center gap-1 shadow-sm"
                      >
                        <UploadCloud size={13} /> Bulk CSV
                      </button>
                      <button
                        onClick={() => handleDeleteCollege(c.id)}
                        className="p-2 bg-slate-800 hover:bg-rose-950 text-rose-400 rounded-xl transition-colors"
                        title="Delete License"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: DOMAIN VERIFICATION SANDBOX */}
      {activeTab === "sandbox" && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
          <div>
            <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
              <Globe className="text-indigo-400" size={20} /> Domain Auto-Verification Sandbox Tester
            </h3>
            <p className="text-xs text-slate-400">Type any candidate email to test which College Enterprise Agreement &amp; Premium Plan it automatically claims upon signup.</p>
          </div>

          <form onSubmit={handleTestDomainVerification} className="flex flex-col sm:flex-row gap-3 max-w-xl">
            <input
              type="email"
              required
              placeholder="e.g. student@clg.edu.in"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              className="flex-1 px-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-xs text-white outline-none focus:border-indigo-500 font-mono"
            />
            <button
              type="submit"
              disabled={testingDomain}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-2xl transition-all shadow-md shrink-0"
            >
              {testingDomain ? "Verifying..." : "Test Domain Verification"}
            </button>
          </form>

          {sandboxResult && (
            <div className={`p-5 rounded-2xl border text-xs space-y-2 max-w-xl animate-fade-in ${
              sandboxResult.matched ? "bg-emerald-500/10 border-emerald-500/20 text-slate-200" : "bg-rose-500/10 border-rose-500/20 text-slate-300"
            }`}>
              <div className="flex items-center gap-2 font-extrabold text-sm">
                {sandboxResult.matched ? <CheckCircle2 className="text-emerald-400" size={18} /> : <X className="text-rose-400" size={18} />}
                <span>{sandboxResult.matched ? "Domain Verification Successful!" : "No Domain Match Found"}</span>
              </div>
              <p className="leading-relaxed">{sandboxResult.message}</p>
              {sandboxResult.matched && (
                <div className="pt-3 border-t border-emerald-500/20 grid grid-cols-2 gap-2 font-mono text-[11px]">
                  <div>College: <span className="font-bold text-white">{sandboxResult.college_name}</span></div>
                  <div>Assigned Plan: <span className="font-bold text-teal-400">{sandboxResult.plan_name}</span></div>
                  <div>Contract Code: <span className="font-bold text-white">{sandboxResult.contract_code}</span></div>
                  <div>Auto-Claim Unlocked: <span className="font-bold text-emerald-400">Yes</span></div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* MODALS */}
      {/* 1. Add Pricing Plan Modal */}
      {showAddPlanModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-extrabold text-white">Create Subscription Pricing Plan</h3>
              <button onClick={() => setShowAddPlanModal(false)} className="text-slate-400 hover:text-white"><X size={18} /></button>
            </div>
            <form onSubmit={handleCreatePlan} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Plan Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Pro Student"
                    value={planForm.name}
                    onChange={(e) => setPlanForm({ ...planForm, name: e.target.value })}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Plan Type</label>
                  <select
                    value={planForm.plan_type}
                    onChange={(e) => setPlanForm({ ...planForm, plan_type: e.target.value })}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none"
                  >
                    <option value="individual">Individual Student</option>
                    <option value="college">College Enterprise</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Price Monthly (₹)</label>
                  <input
                    type="number"
                    value={planForm.price_monthly}
                    onChange={(e) => setPlanForm({ ...planForm, price_monthly: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Price Yearly (₹)</label>
                  <input
                    type="number"
                    value={planForm.price_yearly}
                    onChange={(e) => setPlanForm({ ...planForm, price_yearly: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Max Resumes</label>
                  <input
                    type="number"
                    value={planForm.max_resumes}
                    onChange={(e) => setPlanForm({ ...planForm, max_resumes: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">AI Mock Interviews</label>
                  <input
                    type="number"
                    value={planForm.max_mock_interviews_per_month}
                    onChange={(e) => setPlanForm({ ...planForm, max_mock_interviews_per_month: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">ATS Scans</label>
                  <input
                    type="number"
                    value={planForm.max_ats_scans_per_month}
                    onChange={(e) => setPlanForm({ ...planForm, max_ats_scans_per_month: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Features (One per line)</label>
                <textarea
                  rows={3}
                  value={planForm.features_input}
                  onChange={(e) => setPlanForm({ ...planForm, features_input: e.target.value })}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none font-mono"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-colors"
              >
                Create Pricing Plan
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 2. Edit Pricing Plan Modal */}
      {editPlanModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-extrabold text-white">Edit Subscription Plan</h3>
              <button onClick={() => setEditPlanModal(null)} className="text-slate-400 hover:text-white"><X size={18} /></button>
            </div>
            <form onSubmit={handleUpdatePlan} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Plan Name</label>
                  <input
                    type="text"
                    value={editPlanModal.name}
                    onChange={(e) => setEditPlanModal({ ...editPlanModal, name: e.target.value })}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Plan Type</label>
                  <select
                    value={editPlanModal.plan_type}
                    onChange={(e) => setEditPlanModal({ ...editPlanModal, plan_type: e.target.value })}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none"
                  >
                    <option value="individual">Individual Student</option>
                    <option value="college">College Enterprise</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Price Monthly (₹)</label>
                  <input
                    type="number"
                    value={editPlanModal.price_monthly}
                    onChange={(e) => setEditPlanModal({ ...editPlanModal, price_monthly: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Price Yearly (₹)</label>
                  <input
                    type="number"
                    value={editPlanModal.price_yearly}
                    onChange={(e) => setEditPlanModal({ ...editPlanModal, price_yearly: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Max Resumes</label>
                  <input
                    type="number"
                    value={editPlanModal.max_resumes}
                    onChange={(e) => setEditPlanModal({ ...editPlanModal, max_resumes: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">AI Interviews</label>
                  <input
                    type="number"
                    value={editPlanModal.max_mock_interviews_per_month}
                    onChange={(e) => setEditPlanModal({ ...editPlanModal, max_mock_interviews_per_month: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">ATS Scans</label>
                  <input
                    type="number"
                    value={editPlanModal.max_ats_scans_per_month}
                    onChange={(e) => setEditPlanModal({ ...editPlanModal, max_ats_scans_per_month: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Features (One per line)</label>
                <textarea
                  rows={3}
                  value={editPlanModal.features_input || ""}
                  onChange={(e) => setEditPlanModal({ ...editPlanModal, features_input: e.target.value })}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none font-mono"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl transition-colors"
              >
                Save Plan Changes
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 3. Add College License Modal */}
      {showAddCollegeModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-extrabold text-white">New College Enterprise Agreement</h3>
              <button onClick={() => setShowAddCollegeModal(false)} className="text-slate-400 hover:text-white"><X size={18} /></button>
            </div>
            <form onSubmit={handleCreateCollege} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-bold mb-1">College Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Veermata Jijabai Technological Institute (VJTI)"
                  value={collegeForm.college_name}
                  onChange={(e) => setCollegeForm({ ...collegeForm, college_name: e.target.value })}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Contract Code</label>
                  <input
                    type="text"
                    value={collegeForm.contract_code}
                    onChange={(e) => setCollegeForm({ ...collegeForm, contract_code: e.target.value })}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Email Domain</label>
                  <input
                    type="text"
                    placeholder="e.g. vjti.ac.in"
                    value={collegeForm.allowed_domain}
                    onChange={(e) => setCollegeForm({ ...collegeForm, allowed_domain: e.target.value })}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Assigned Enterprise Plan</label>
                <select
                  value={collegeForm.subscription_plan_id}
                  onChange={(e) => setCollegeForm({ ...collegeForm, subscription_plan_id: Number(e.target.value) })}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none font-bold"
                >
                  {plans.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.plan_type})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Max Student Capacity</label>
                <input
                  type="number"
                  value={collegeForm.max_students_allowed}
                  onChange={(e) => setCollegeForm({ ...collegeForm, max_students_allowed: Number(e.target.value) })}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">HOD Email</label>
                  <input
                    type="email"
                    value={collegeForm.hod_email}
                    onChange={(e) => setCollegeForm({ ...collegeForm, hod_email: e.target.value })}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Billing Officer</label>
                  <input
                    type="text"
                    value={collegeForm.billing_contact_name}
                    onChange={(e) => setCollegeForm({ ...collegeForm, billing_contact_name: e.target.value })}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl transition-colors"
              >
                Create Enterprise License
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 4. Edit College License Modal */}
      {editCollegeModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-extrabold text-white">Edit College Enterprise Agreement</h3>
              <button onClick={() => setEditCollegeModal(null)} className="text-slate-400 hover:text-white"><X size={18} /></button>
            </div>
            <form onSubmit={handleUpdateCollege} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-bold mb-1">College Name</label>
                <input
                  type="text"
                  value={editCollegeModal.college_name}
                  onChange={(e) => setEditCollegeModal({ ...editCollegeModal, college_name: e.target.value })}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Contract Code</label>
                  <input
                    type="text"
                    value={editCollegeModal.contract_code || ""}
                    onChange={(e) => setEditCollegeModal({ ...editCollegeModal, contract_code: e.target.value })}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Email Domain</label>
                  <input
                    type="text"
                    value={editCollegeModal.allowed_domain || ""}
                    onChange={(e) => setEditCollegeModal({ ...editCollegeModal, allowed_domain: e.target.value })}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Max Student Capacity</label>
                <input
                  type="number"
                  value={editCollegeModal.max_students_allowed}
                  onChange={(e) => setEditCollegeModal({ ...editCollegeModal, max_students_allowed: Number(e.target.value) })}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl transition-colors"
              >
                Save College License
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 5. Bulk Register Students CSV Modal */}
      {csvUploadCollege && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-extrabold text-white">Bulk Register Students: {csvUploadCollege.college_name}</h3>
              <button onClick={() => setCsvUploadCollege(null)} className="text-slate-400 hover:text-white"><X size={18} /></button>
            </div>
            <form onSubmit={handleImportStudentsCsv} className="space-y-4 text-xs">
              <p className="text-slate-400 text-xs leading-relaxed">
                Upload a CSV of students with column <code className="text-emerald-400 font-mono">email</code> (and optional <code className="text-emerald-400 font-mono">password</code>). They will be automatically registered and linked to <span className="font-extrabold text-white">{csvUploadCollege.college_name}</span> under the <span className="text-teal-400 font-bold">{csvUploadCollege.subscription_plan_name}</span> premium plan!
              </p>

              <div className="border-2 border-dashed border-slate-800 rounded-2xl p-6 text-center hover:border-emerald-500/50 transition-colors">
                <UploadCloud className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
                <input
                  type="file"
                  accept=".csv"
                  onChange={(e) => setCsvFile(e.target.files ? e.target.files[0] : null)}
                  className="text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-emerald-600 file:text-white hover:file:bg-emerald-500 cursor-pointer"
                />
              </div>

              <button
                type="submit"
                disabled={!csvFile}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-bold rounded-xl transition-colors shadow-md"
              >
                Register &amp; Unlock Premium Plan
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
