"use client";

import React, { useEffect, useState } from "react";
import { 
  Video, 
  Plus, 
  Trash2, 
  Edit3, 
  X, 
  ShieldAlert, 
  CheckCircle2, 
  BrainCircuit, 
  Terminal,
  Clock,
  UserCheck
} from "lucide-react";
import { api } from "@/lib/api/client";

export default function SuperAdminInterviewsPage() {
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<any[]>([]);

  // Modals
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);

  // Forms
  const [categoryForm, setCategoryForm] = useState({
    name: "",
    description: "",
    system_prompt: "You are a Senior Technical Interviewer conducting a mock interview..."
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const res = await api.get("/superadmin/interview-categories");
      setCategories(res.data);
    } catch (err) {
      console.error("Failed to load interview categories", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/superadmin/interview-categories", categoryForm);
      setShowAddCategoryModal(false);
      setCategoryForm({ name: "", description: "", system_prompt: "You are a Senior Technical Interviewer..." });
      loadCategories();
      alert("Mock Interview Category Created!");
    } catch (err) {
      alert("Failed to create category");
    }
  };

  const handleUpdateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;
    try {
      await api.put(`/superadmin/interview-categories/${editingCategory.id}`, editingCategory);
      setEditingCategory(null);
      loadCategories();
      alert("Interview Category & Prompt Saved!");
    } catch (err) {
      alert("Failed to update category");
    }
  };

  const handleDeleteCategory = async (id: number) => {
    if (!confirm("Delete this interview category?")) return;
    try {
      await api.delete(`/superadmin/interview-categories/${id}`);
      loadCategories();
    } catch (err) {
      alert("Failed to delete category");
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <Video className="text-purple-400" size={24} /> AI Mock Interview Personas
          </h1>
          <p className="text-xs text-slate-400">Configure AI system prompt behavior, domain roles, and evaluate candidate sessions.</p>
        </div>

        <button
          onClick={() => setShowAddCategoryModal(true)}
          className="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-2xl transition-all flex items-center gap-2 shadow-md shadow-purple-600/20"
        >
          <Plus size={16} /> Create Interview Persona
        </button>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((cat) => (
          <div key={cat.id} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
                  <BrainCircuit size={20} />
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setEditingCategory(cat)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 transition-colors"
                    title="Edit System Prompt Persona"
                  >
                    <Edit3 size={14} />
                  </button>
                  <button
                    onClick={() => handleDeleteCategory(cat.id)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 text-rose-400 transition-colors"
                    title="Delete Category"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <h3 className="text-base font-extrabold text-white mb-1">{cat.name}</h3>
              <p className="text-xs text-slate-400 mb-4 line-clamp-2">{cat.description || "Standard technical mock interview domain."}</p>
              
              <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 text-[10px] text-slate-300 font-mono line-clamp-3">
                <span className="text-purple-400 font-bold block mb-1">PROMPT TEMPLATE:</span>
                {cat.system_prompt}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800 flex justify-between items-center text-xs">
              <span className="text-slate-500 font-semibold">{cat.sessions_count || 0} Sessions Evaluated</span>
              <button
                onClick={() => setEditingCategory(cat)}
                className="text-purple-400 font-bold hover:underline"
              >
                Customize Persona &rarr;
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Candidate Proctoring Compliance Overview */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <h3 className="text-base font-extrabold text-white flex items-center gap-2">
          <ShieldAlert className="text-amber-400" size={18} /> Candidate Proctoring &amp; Compliance Safeguards
        </h3>
        <p className="text-xs text-slate-400 leading-relaxed">
          Our AI Mock Interview system actively monitors web-cam feed alignment, voice spectrum synthesis, and tab-switch browser violations during candidate sessions. Violations over threshold are flagged for Super Admin audit review.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs pt-2">
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
            <span className="text-slate-500 font-bold block">Tab-Switch Limit</span>
            <span className="text-white font-extrabold text-sm">Max 3 Warnings</span>
          </div>
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
            <span className="text-slate-500 font-bold block">Proctoring AI Status</span>
            <span className="text-emerald-400 font-extrabold text-sm">Active &amp; Enforced</span>
          </div>
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
            <span className="text-slate-500 font-bold block">Integrity Index</span>
            <span className="text-purple-400 font-extrabold text-sm">98.4% Clean Sessions</span>
          </div>
        </div>
      </div>

      {/* MODALS */}
      {/* 1. Add Category Modal */}
      {showAddCategoryModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-extrabold text-white">Create Mock Interview Persona</h3>
              <button onClick={() => setShowAddCategoryModal(false)} className="text-slate-400 hover:text-white"><X size={18} /></button>
            </div>
            <form onSubmit={handleCreateCategory} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-bold mb-1">Category / Persona Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Full Stack System Design Interviewer"
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Description</label>
                <input
                  type="text"
                  placeholder="Brief summary of domain focus..."
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">System Prompt Persona Template</label>
                <textarea
                  rows={6}
                  required
                  value={categoryForm.system_prompt}
                  onChange={(e) => setCategoryForm({ ...categoryForm, system_prompt: e.target.value })}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none font-mono"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl transition-colors"
              >
                Create Persona
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 2. Edit Persona Modal */}
      {editingCategory && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-extrabold text-white">Edit Persona &amp; Prompt Template</h3>
              <button onClick={() => setEditingCategory(null)} className="text-slate-400 hover:text-white"><X size={18} /></button>
            </div>
            <form onSubmit={handleUpdateCategory} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-bold mb-1">Category Name</label>
                <input
                  type="text"
                  value={editingCategory.name}
                  onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">System Prompt Persona</label>
                <textarea
                  rows={6}
                  value={editingCategory.system_prompt}
                  onChange={(e) => setEditingCategory({ ...editingCategory, system_prompt: e.target.value })}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none font-mono text-[11px]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl transition-colors"
              >
                Save Persona Changes
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
