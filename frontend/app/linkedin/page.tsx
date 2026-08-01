"use client";

import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload, ArrowDown, Briefcase, GraduationCap, Wrench, User, FileText, Loader2, Trash2, Clock, 
  AlertCircle, Target, Sparkles, Check, X, RotateCcw, ChevronRight, ChevronLeft, 
  Search, CheckCircle2, Save, Copy, Download, Undo2, Redo2, ShieldCheck, 
  Activity, Award, SearchCode, Edit3, Eye
} from "lucide-react";
import { linkedinApi } from "@/lib/api/linkedin";
import * as diff from "diff";

import { LinkedInOnboarding } from "@/components/linkedin/LinkedInOnboarding";
import { AiWorkflowNodes } from "@/components/linkedin/AiWorkflowNodes";


import type {
  LinkedinAnalysis, LinkedinAnalysisListItem, LinkedinRewriteResult,
  LinkedinRole, LinkedinProfileField, LinkedinProfileFieldName
} from "@/types/linkedin";

/* -------------------------------------------------------------------------- */
/*                                    Page                                    */
/* -------------------------------------------------------------------------- */

export default function LinkedinPage() {
  const [uploading, setUploading] = useState(false);
  const [uploadStage, setUploadStage] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [active, setActive] = useState<LinkedinAnalysis | null>(null);
  const [history, setHistory] = useState<LinkedinAnalysisListItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [roles, setRoles] = useState<LinkedinRole[]>([]);
  const [selectedRole, setSelectedRole] = useState<string>("");

  // Field Review State
  const [profileFields, setProfileFields] = useState<LinkedinProfileField[]>([]);
  const [selectedProfileFields, setSelectedProfileFields] = useState<LinkedinProfileFieldName[]>([]);
  const [savingProfile, setSavingProfile] = useState(false);
  
  // Modals & Notifications
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showCompletionScreen, setShowCompletionScreen] = useState(false);
  
  // Mounted Check for Portal
  const [mounted, setMounted] = useState(false);

  // Onboarding States
  const [showTutorial, setShowTutorial] = useState(false);
  const [uploadPulse, setUploadPulse] = useState(false);

  useEffect(() => {
    const isCompleted = localStorage.getItem("linkedinTutorialCompleted");
    if (!isCompleted) {
      setShowTutorial(true);
    }
  }, []);


  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
    loadHistory();
    loadRoles();
  }, []);

  const loadHistory = async () => {
    setLoadingHistory(true);
    try {
      const items = await linkedinApi.list();
      setHistory(items);
    } catch { /* silent */ } finally { setLoadingHistory(false); }
  };

  const loadRoles = async () => {
    try {
      const r = await linkedinApi.getRoles();
      setRoles(r);
    } catch { /* silent */ }
  };

  const loadProfileFields = async (analysisId: number) => {
    try {
      const fields = await linkedinApi.getProfilePreview(analysisId);
      setProfileFields(fields);
      setSelectedProfileFields(fields.map(f => f.field));
    } catch {
      setProfileFields([]);
    }
  };

  const handleUpload = async (file: File | undefined) => {
    if (!file) return;
    setError(null);
    setUploading(true);
    setUploadStage(1);
    
    const stageInterval = setInterval(() => {
      setUploadStage(prev => (prev < 4 ? prev + 1 : prev));
    }, 1200);

    try {
      const result = await linkedinApi.parseUpload(file);
      clearInterval(stageInterval);
      setUploadStage(5); 
      setActive(result);
      loadProfileFields(result.id);
      loadHistory();
      
      // The upload finished in backend, but we keep the visual flow active for a few seconds to let animations complete
      setTimeout(() => {
        setUploading(false);
        setUploadStage(0);
        setShowReviewModal(true);
      }, 7000); // Wait for the workflow nodes to finish

    } catch (err: unknown) {
      clearInterval(stageInterval);
      setUploading(false);
      setUploadStage(0);
      const detail = (err as any)?.response?.data?.detail ?? "Failed to parse the LinkedIn PDF. Please try again.";
      setError(detail);
    } finally {
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const handleView = async (id: number) => {
    try {
      const result = await linkedinApi.get(id);
      setActive(result);
      loadProfileFields(result.id);
      if (result.scores?.role) setSelectedRole(result.scores.role);
      setShowReviewModal(true);
    } catch {
      setError("Failed to load analysis.");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await linkedinApi.delete(id);
      setHistory((prev) => prev.filter((h) => h.id !== id));
      if (active?.id === id) setActive(null);
    } catch {
      setError("Failed to delete analysis.");
    }
  };

  const saveSelectedProfileFields = async () => {
    if (!active || selectedProfileFields.length === 0) return;
    setSavingProfile(true);
    try {
      const stored = await linkedinApi.storeProfile(active.id, selectedProfileFields);
      setProfileFields((current) =>
        current.map((item) => stored.includes(item.field) ? { ...item, saved: true } : item)
      );
      setShowReviewModal(false);
      setShowCompletionScreen(true);
    } catch (err: unknown) {
      const detail = (err as any)?.response?.data?.detail ?? "Could not save the selected attributes.";
      setError(detail);
    } finally {
      setSavingProfile(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-slate-50 overflow-hidden pb-20">
      
      {/* Ambient Premium Apple Mesh Background */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-blue-400/10 blur-[100px]" />
        <div className="absolute top-40 -left-40 w-96 h-96 rounded-full bg-indigo-500/10 blur-[100px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full bg-purple-500/5 blur-[120px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-5xl px-4 pt-16">
        <AnimatedHero />

        {/* Onboarding Wizard */}
        <LinkedInOnboarding 
          isOpen={showTutorial} 
          setIsOpen={setShowTutorial} 
          onComplete={() => {
            const uploadEl = document.getElementById("upload-section");
            if (uploadEl) {
              uploadEl.scrollIntoView({ behavior: "smooth", block: "center" });
              setUploadPulse(true);
              setTimeout(() => setUploadPulse(false), 5000);
            }
          }} 
        />

        {/* AI Workflow Nodes (Shows while uploading) */}
        <AnimatePresence mode="wait">
          {uploading ? (
            <motion.div
              key="workflow"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              <AiWorkflowNodes active={uploading} onComplete={() => {}} />
            </motion.div>
          ) : (
            <motion.div
              key="dropzone"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              id="upload-section"
              className="relative"
            >
              <AnimatePresence>
                {uploadPulse && (
                  <motion.div
                    initial={{ opacity: 0, scale: 1.1 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute -inset-4 z-0 rounded-[40px] border-4 border-blue-500 shadow-[0_0_50px_rgba(59,130,246,0.6)] pointer-events-none"
                  >
                    <motion.div 
                      animate={{ opacity: [0, 0.4, 0] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                      className="absolute inset-0 bg-blue-500/10 rounded-[36px]"
                    />
                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-4 py-2 rounded-full font-bold shadow-xl flex items-center gap-2 animate-bounce">
                      <ArrowDown className="w-4 h-4" /> Upload Here
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              <PremiumUploadDropzone 
                onUpload={handleUpload} 
                uploading={uploading} 
                uploadStage={uploadStage} 
                error={error} 
                inputRef={inputRef} 
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* History */}
        {!loadingHistory && history.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="max-w-2xl mx-auto">
            <h2 className="text-xs font-extrabold tracking-widest uppercase text-slate-400 mb-4 ml-2">Previous Optimizations</h2>
            <div className="space-y-3">
              {history.map((item) => (
                <div key={item.id} className="group flex items-center justify-between rounded-[24px] bg-white/60 backdrop-blur-md border border-white/80 px-6 py-5 shadow-sm hover:shadow-md transition-all hover:bg-white/90">
                  <button onClick={() => handleView(item.id)} className="flex items-center gap-5 flex-1 text-left">
                    <div className="h-12 w-12 rounded-[16px] bg-slate-50 flex items-center justify-center group-hover:bg-[#0A66C2]/10 transition-colors shadow-inner border border-slate-100">
                      <Clock className="w-5 h-5 text-slate-400 group-hover:text-[#0A66C2]" />
                    </div>
                    <div>
                      <p className="text-[15px] font-bold text-slate-800">Profile Analysis #{item.id}</p>
                      <p className="text-[13px] font-medium text-slate-500 mt-1">{new Date(item.created_at).toLocaleDateString()} &middot; {item.detected_sections.length} sections</p>
                    </div>
                  </button>
                  <button onClick={() => handleDelete(item.id)} className="p-3 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        )}

      {/* Floating AI Assistant */}
      <motion.button
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowTutorial(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-3 bg-white/80 backdrop-blur-xl border border-white/40 shadow-2xl px-5 py-3 rounded-full group hover:bg-white transition-colors"
      >
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-600 flex items-center justify-center text-white">
          <Sparkles className="w-4 h-4" />
        </div>
        <div className="text-left">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Need Help?</p>
          <p className="text-[13px] font-bold text-slate-700 group-hover:text-blue-600 transition-colors">Watch Tutorial Again</p>
        </div>
      </motion.button>

      </div>

      
      <AnimatePresence>
        {showCompletionScreen && <CompletionScreen onClose={() => setShowCompletionScreen(false)} />}
      </AnimatePresence>
      
      {/* V2 Apple Flagship Workspace Rendered in Portal */}
      {mounted && createPortal(
        <AnimatePresence>
          {showReviewModal && active && (
            <ReviewModal 
              active={active}
              profileFields={profileFields}
              setProfileFields={setProfileFields}
              selectedFields={selectedProfileFields}
              setSelectedFields={setSelectedProfileFields}
              onClose={() => setShowReviewModal(false)}
              onSave={saveSelectedProfileFields}
              saving={savingProfile}
              roles={roles}
              selectedRole={selectedRole}
              setSelectedRole={setSelectedRole}
            />
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                               Animated Hero                                */
/* -------------------------------------------------------------------------- */

function AnimatedHero() {
  const phrases = ["Optimize your personal brand", "Increase recruiter visibility", "Build a stronger professional identity", "Stand out with AI optimization"];
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setIndex(prev => (prev + 1) % phrases.length), 4000);
    return () => clearInterval(interval);
  }, [phrases.length]);

  return (
    <div className="text-center mb-16 pt-8">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-md border border-slate-200/60 shadow-sm mb-6">
        <Sparkles className="w-4 h-4 text-amber-500" />
        <span className="text-xs font-bold tracking-wide text-slate-700">✨ AI Powered • ATS Optimized • Recruiter Ready</span>
      </motion.div>
      <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 mb-6">LinkedIn Profile Optimizer</motion.h1>
      <div className="h-10 overflow-hidden mb-6 flex justify-center">
        <AnimatePresence mode="wait">
          <motion.p key={index} initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -30, opacity: 0 }} transition={{ type: "spring", stiffness: 300, damping: 30 }} className="text-xl md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#0A66C2] to-purple-600">
            {phrases[index]}
          </motion.p>
        </AnimatePresence>
      </div>
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-2 text-[15px] md:text-base text-slate-500 max-w-2xl mx-auto leading-relaxed font-medium">
        Transform your LinkedIn profile into a recruiter-ready personal brand using intelligent AI-powered optimization, ATS-focused enhancements, and personalized recommendations.
      </motion.p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                     Review Modal - V2 Flagship Portal                      */
/* -------------------------------------------------------------------------- */

function ReviewModal({
  active, profileFields, setProfileFields, selectedFields, setSelectedFields, onClose, onSave, saving, roles, selectedRole, setSelectedRole
}: any) {
  const [editingField, setEditingField] = useState<LinkedinProfileField | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isExporting, setIsExporting] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  // Track local edits independently of original fields to support Undo/Redo & Diffing
  const [localEdits, setLocalEdits] = useState<Record<string, string>>({});

  // Filter fields based on search
  const filteredFields = useMemo(() => {
    if (!searchQuery) return profileFields;
    return profileFields.filter((f: any) => 
      f.field.toLowerCase().includes(searchQuery.toLowerCase()) || 
      JSON.stringify(f.value).toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [profileFields, searchQuery]);

  // Handle Keyboard Nav & ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (editingField) return; // Disable if sub-modals open
      if (e.key === "ArrowRight") scrollContainerRef.current?.scrollBy({ left: 300, behavior: "smooth" });
      if (e.key === "ArrowLeft") scrollContainerRef.current?.scrollBy({ left: -300, behavior: "smooth" });
      if (e.key === "Escape") onClose();
      if (e.key === "s" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        onSave();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [filteredFields.length, editingField, onClose, onSave]);

  // Export PDF Logic (Frontend Only)
  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      const html2pdf = (await import('html2pdf.js')).default;
      const element = document.getElementById('pdf-export-container');
      if (!element) return;
      
      const opt = {
        margin:       0.5,
        filename:     'ResumeHive_Premium_Profile.pdf',
        image:        { type: 'jpeg' as const, quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true },
        jsPDF:        { unit: 'in' as const, format: 'letter' as const, orientation: 'portrait' as const }
      };
      
      await html2pdf().set(opt).from(element).save();
    } catch (e) {
      console.error("PDF Export failed", e);
    } finally {
      setIsExporting(false);
    }
  };

  const handleUpdateLocal = (field: string, val: string) => {
    setLocalEdits(prev => ({ ...prev, [field]: val }));
    setProfileFields((current: any) => current.map((f: any) => f.field === field ? { ...f, value: val } : f));
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/60 backdrop-blur-2xl">
      <motion.div 
        initial={{ opacity: 0, scale: 0.98, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98, y: 10 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        className="relative w-[96vw] max-w-[1600px] h-[94vh] max-h-[1000px] rounded-[32px] bg-slate-50/90 backdrop-blur-3xl shadow-[0_40px_100px_rgba(0,0,0,0.4)] border border-white/60 flex flex-col overflow-hidden"
      >
        {/* HEADER - Fixed Height */}
        <div className="h-[90px] flex-none flex items-center justify-between px-10 border-b border-white/80 bg-white/70 z-20">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">LinkedIn Profile Review</h2>
            <div className="flex items-center gap-3 mt-1">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-100/50 border border-green-200">
                <ShieldCheck className="w-3 h-3 text-green-600" />
                <span className="text-[9px] font-bold text-green-700 uppercase tracking-wider">Your data is private & secure</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" placeholder="Search sections..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                className="w-64 pl-10 pr-4 py-2.5 rounded-full bg-white border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A66C2]/20 focus:border-[#0A66C2] transition-all shadow-sm"
              />
            </div>
            <button onClick={onClose} className="p-3 rounded-full bg-white shadow-sm border border-slate-100 hover:bg-slate-50 transition-colors text-slate-500 hover:text-slate-900"><X className="w-5 h-5" /></button>
          </div>
        </div>

        {/* BODY - Flexible Workspace */}
        <div className="flex-1 relative flex flex-col w-full bg-gradient-to-b from-slate-50/40 to-slate-100/40 overflow-hidden">
          
          {/* Top Analytics Dashboard */}
          <div className="flex-none flex justify-center gap-4 p-8 z-10">
            <DashboardCard icon={<Target />} label="ATS Match" value={94} color="text-emerald-500" />
            <DashboardCard icon={<Award />} label="Profile Strength" value={88} color="text-blue-500" />
            <DashboardCard icon={<Activity />} label="Recruiter Visibility" value={91} color="text-indigo-500" />
            <DashboardCard icon={<SearchCode />} label="Keyword Optimize" value={85} color="text-purple-500" />
          </div>

          {/* V2 Horizontal Sliding Gallery */}
          <div className="flex-1 w-full relative group">
            {/* Scroll Buttons */}
            <button onClick={() => scrollContainerRef.current?.scrollBy({ left: -400, behavior: "smooth" })} className="absolute left-8 top-1/2 -translate-y-1/2 p-4 rounded-full bg-white/90 backdrop-blur-xl shadow-2xl border border-slate-100 text-slate-600 hover:text-slate-900 hover:scale-110 active:scale-95 transition-all z-20 opacity-0 group-hover:opacity-100"><ChevronLeft className="w-6 h-6" /></button>
            <button onClick={() => scrollContainerRef.current?.scrollBy({ left: 400, behavior: "smooth" })} className="absolute right-8 top-1/2 -translate-y-1/2 p-4 rounded-full bg-white/90 backdrop-blur-xl shadow-2xl border border-slate-100 text-slate-600 hover:text-slate-900 hover:scale-110 active:scale-95 transition-all z-20 opacity-0 group-hover:opacity-100"><ChevronRight className="w-6 h-6" /></button>

            {/* Native Scroll Container */}
            <div 
              ref={scrollContainerRef}
              className="absolute inset-0 flex items-center gap-6 overflow-x-auto snap-x snap-mandatory px-[calc(50vw-110px)] pb-8 hide-scrollbar scroll-smooth"
            >
              {filteredFields.map((field: any, idx: number) => (
                <div key={field.field} className="snap-center shrink-0 w-[220px] h-[310px]">
                  <PremiumCard 
                    field={field} 
                    isSelected={selectedFields.includes(field.field)}
                    onToggle={() => setSelectedFields((prev: any) => prev.includes(field.field) ? prev.filter((f: any) => f !== field.field) : [...prev, field.field])}
                    onEdit={() => setEditingField(field)}
                    isEdited={!!localEdits[field.field]}
                  />
                </div>
              ))}
              {filteredFields.length === 0 && (
                <div className="w-full flex justify-center text-slate-400 text-lg font-medium">No sections found for "{searchQuery}"</div>
              )}
            </div>
          </div>
        </div>

        {/* FOOTER - Fixed Height Action Bar */}
        <div className="flex-none flex items-center justify-between px-10 py-5 border-t border-white/80 bg-white/80 backdrop-blur-2xl z-20 shadow-[0_-10px_30px_rgba(0,0,0,0.03)]">
          <div className="flex items-center gap-4 text-sm font-medium text-slate-600">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white shadow-md">{selectedFields.length}</span>
            Fields selected
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setSelectedFields(profileFields.map((f:any)=>f.field))} className="px-5 py-3 rounded-2xl text-[13px] font-bold text-slate-600 hover:bg-slate-200/50 transition-colors">Select All</button>
            <button onClick={() => setSelectedFields([])} className="px-5 py-3 rounded-2xl text-[13px] font-bold text-slate-600 hover:bg-slate-200/50 transition-colors">Deselect All</button>
            <div className="w-px h-8 bg-slate-200 mx-2" />
            <button onClick={handleExportPDF} disabled={isExporting || selectedFields.length === 0} className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white border border-slate-200 text-[13px] font-bold text-slate-700 shadow-sm hover:shadow-md hover:bg-slate-50 transition-all disabled:opacity-50">
              {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />} Export PDF
            </button>
            <button onClick={onSave} disabled={saving || selectedFields.length === 0} className="flex items-center gap-2 px-8 py-3 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 text-[14px] font-bold text-white shadow-lg shadow-slate-900/20 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-slate-900/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
              {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />} Save Changes
            </button>
          </div>
        </div>

        {/* V2 3-Panel Fullscreen Editor */}
        <AnimatePresence>
          {editingField && <V2FullscreenEditor field={editingField} analysisId={active.id} roles={roles} selectedRole={selectedRole} setSelectedRole={setSelectedRole} onClose={() => setEditingField(null)} onSave={(val: string) => handleUpdateLocal(editingField.field, val)} originalValue={String(profileFields.find((f:any)=>f.field === editingField.field)?.value || "")} />}
        </AnimatePresence>
      </motion.div>

      {/* Hidden PDF Export Container */}
      <div style={{ display: 'none' }}>
        <div id="pdf-export-container" className="p-12 bg-white text-slate-900 font-sans" style={{ width: '800px' }}>
          <div className="border-b-2 border-slate-200 pb-6 mb-8 flex justify-between items-center">
            <h1 className="text-3xl font-extrabold text-[#0A66C2]">ResumeHive</h1>
            <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Optimized Profile Summary</span>
          </div>
          {profileFields.filter((f: any) => selectedFields.includes(f.field)).map((field: any) => (
            <div key={field.field} className="mb-8 break-inside-avoid">
              <h3 className="text-lg font-bold text-slate-800 uppercase tracking-wide border-b border-slate-100 pb-2 mb-4 capitalize">{field.field}</h3>
              {Array.isArray(field.value) ? (
                <ul className="list-disc pl-5 text-sm text-slate-600 space-y-2">
                  {field.value.map((v: any, i: number) => <li key={i}>{typeof v === 'string' ? v : JSON.stringify(v)}</li>)}
                </ul>
              ) : (
                <p className="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed">{field.value}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Global override for hiding scrollbars on native slider */}
      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                        Premium Card - V2 Compact                           */
/* -------------------------------------------------------------------------- */

const FIELD_ICONS: Record<string, React.ReactNode> = {
  headline: <User className="w-5 h-5 text-blue-500" />, about: <FileText className="w-5 h-5 text-purple-500" />,
  experience: <Briefcase className="w-5 h-5 text-orange-500" />, education: <GraduationCap className="w-5 h-5 text-emerald-500" />,
  skills: <Wrench className="w-5 h-5 text-cyan-500" />,
};

function PremiumCard({ field, isSelected, onToggle, onEdit, isEdited }: any) {
  const confidence = field.value.length > 50 ? 98 : field.value.length > 20 ? 94 : 88;
  
  // Create short string for preview instead of huge text block
  let previewString = "";
  if (Array.isArray(field.value)) {
    previewString = `${field.value.length} ${field.field === 'skills' ? 'Skills' : 'Records'} Extracted`;
  } else {
    previewString = typeof field.value === 'string' ? field.value.substring(0, 70) + (field.value.length > 70 ? "..." : "") : "Data Extracted";
  }

  return (
    <div className={`relative w-full h-full rounded-[24px] bg-white/95 backdrop-blur-xl p-5 shadow-2xl flex flex-col transition-all duration-300 border-2 hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] ${isSelected ? "border-[#0A66C2] shadow-[#0A66C2]/10" : "border-white/80"}`}>
      
      {/* Mini Quality Indicators */}
      <div className="absolute -top-3 left-5 flex gap-1.5">
        <div className="rounded-full bg-slate-900 text-white px-2.5 py-0.5 text-[9px] font-bold tracking-widest uppercase shadow-md flex items-center gap-1"><Sparkles className="w-3 h-3 text-amber-400" />{confidence}%</div>
        {isEdited && <div className="rounded-full bg-blue-100 text-blue-700 px-2.5 py-0.5 text-[9px] font-bold tracking-widest uppercase shadow-md border border-blue-200">Edited</div>}
      </div>

      <div className="flex flex-col items-start mb-auto mt-2">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 border border-slate-100 shadow-sm mb-4">{FIELD_ICONS[field.field] || <Search className="w-5 h-5 text-slate-500" />}</div>
        <h3 className="text-lg font-extrabold text-slate-900 capitalize leading-tight">{field.field}</h3>
        <p className="text-[12px] font-medium text-slate-500 mt-2 leading-relaxed">{previewString}</p>
      </div>

      <div className="flex flex-col gap-2 mt-4">
        <button onClick={onEdit} className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-900 text-white py-2.5 font-bold text-[12px] hover:bg-slate-800 transition-colors shadow-md"><Edit3 className="w-3.5 h-3.5"/> Edit & Preview</button>
        <button onClick={onToggle} className={`w-full flex items-center justify-center gap-2 rounded-xl py-2.5 font-bold text-[12px] transition-all border-2 ${isSelected ? "bg-[#0A66C2]/10 border-[#0A66C2] text-[#0A66C2]" : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100"}`}>
          <div className={`w-4 h-4 rounded-md flex items-center justify-center transition-colors ${isSelected ? "bg-[#0A66C2] text-white" : "border border-slate-300"}`}>{isSelected && <Check className="w-3 h-3" />}</div>
          {isSelected ? "Selected" : "Select"}
        </button>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                  V2 Fullscreen 3-Panel Workspace Editor                    */
/* -------------------------------------------------------------------------- */

function V2FullscreenEditor({ field, analysisId, roles, selectedRole, setSelectedRole, onClose, onSave, originalValue }: any) {
  const [value, setValue] = useState(originalValue);
  const [historyStack, setHistoryStack] = useState<string[]>([originalValue]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [rewriting, setRewriting] = useState(false);

  const handleValueChange = (newVal: string) => {
    setValue(newVal);
    const newStack = historyStack.slice(0, historyIndex + 1);
    newStack.push(newVal);
    setHistoryStack(newStack);
    setHistoryIndex(newStack.length - 1);
  };

  const undo = () => { if (historyIndex > 0) { setHistoryIndex(i => i - 1); setValue(historyStack[historyIndex - 1]); } };
  const redo = () => { if (historyIndex < historyStack.length - 1) { setHistoryIndex(i => i + 1); setValue(historyStack[historyIndex + 1]); } };
  const restoreOriginal = () => { handleValueChange(originalValue); };

  const handleRewrite = async () => {
    setRewriting(true);
    try {
      let res;
      if (field.field === "headline") res = await linkedinApi.rewriteHeadline(analysisId, selectedRole || null);
      else if (field.field === "about") res = await linkedinApi.rewriteAbout(analysisId, selectedRole || null);
      if (res?.rewritten) handleValueChange(res.rewritten);
    } catch {} finally { setRewriting(false); }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 30, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 30, scale: 0.97 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className="absolute inset-0 z-50 flex flex-col bg-white rounded-[32px] overflow-hidden"
    >
      {/* Editor Header */}
      <div className="h-[80px] flex-none flex items-center justify-between px-8 border-b border-slate-100 bg-slate-50/50">
        <div className="flex items-center gap-4">
          <button onClick={onClose} className="p-2.5 rounded-full hover:bg-slate-200/60 transition-colors text-slate-500 mr-2"><ChevronLeft className="w-5 h-5"/></button>
          <h3 className="text-xl font-extrabold text-slate-900 capitalize">Workspace: {field.field}</h3>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={restoreOriginal} className="text-[11px] font-bold uppercase tracking-wider text-slate-400 hover:text-slate-600 mr-4">Restore Original</button>
          <button onClick={onClose} className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 transition-colors">Discard</button>
          <button onClick={() => { onSave(value); onClose(); }} className="px-6 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-bold shadow-lg hover:-translate-y-0.5 transition-all flex items-center gap-2"><Check className="w-4 h-4"/> Save Work</button>
        </div>
      </div>

      {/* Editor Body - 3 Panels */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Panel 1: Original */}
        <div className="w-1/3 flex flex-col border-r border-slate-100 bg-slate-50/30">
          <div className="p-4 border-b border-slate-100 text-xs font-bold tracking-widest uppercase text-slate-400 flex items-center gap-2 bg-white"><FileText className="w-4 h-4"/> Original Content</div>
          <div className="flex-1 overflow-y-auto p-6 text-[13px] leading-relaxed font-medium text-slate-600 whitespace-pre-wrap custom-scrollbar">
            {originalValue}
          </div>
        </div>

        {/* Panel 2: Editor */}
        <div className="w-1/3 flex flex-col relative group bg-white shadow-[0_0_40px_rgba(0,0,0,0.02)] z-10">
          <div className="p-4 border-b border-slate-100 text-xs font-bold tracking-widest uppercase text-slate-900 flex items-center justify-between">
            <span className="flex items-center gap-2"><Edit3 className="w-4 h-4"/> Edit Environment</span>
            <div className="flex gap-1">
              <button onClick={undo} disabled={historyIndex === 0} className="p-1 rounded hover:bg-slate-100 disabled:opacity-30 text-slate-500"><Undo2 className="w-3.5 h-3.5"/></button>
              <button onClick={redo} disabled={historyIndex === historyStack.length - 1} className="p-1 rounded hover:bg-slate-100 disabled:opacity-30 text-slate-500"><Redo2 className="w-3.5 h-3.5"/></button>
            </div>
          </div>
          <textarea 
            value={value} onChange={e => handleValueChange(e.target.value)}
            className="flex-1 w-full p-6 bg-transparent outline-none text-[14px] leading-relaxed text-slate-800 resize-none custom-scrollbar"
            placeholder={`Type or let AI rewrite your ${field.field}...`}
          />
          {/* Editor Footer / AI Tools */}
          <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center gap-2">
             <select value={selectedRole} onChange={e => setSelectedRole(e.target.value)} className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 outline-none">
                <option value="">Auto Detect Tone</option>
                {roles.map((r:any) => <option key={r.key} value={r.key}>{r.name}</option>)}
              </select>
              <button onClick={handleRewrite} disabled={rewriting || (field.field !== "headline" && field.field !== "about")} className="flex items-center justify-center gap-2 rounded-lg bg-indigo-600 text-white px-4 py-2 font-bold text-xs shadow-md hover:bg-indigo-700 transition-all disabled:opacity-50">
                {rewriting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <><Sparkles className="w-3.5 h-3.5"/> Rewrite</>}
              </button>
          </div>
        </div>

        {/* Panel 3: Live Preview & Diff */}
        <div className="w-1/3 flex flex-col border-l border-slate-100 bg-slate-50/30">
          <div className="p-4 border-b border-slate-100 text-xs font-bold tracking-widest uppercase text-slate-400 flex items-center gap-2 bg-white"><Eye className="w-4 h-4"/> Difference Engine</div>
          <div className="flex-1 overflow-y-auto p-6 text-[13px] leading-relaxed font-medium custom-scrollbar">
             {diff.diffWords(originalValue, value).map((part, idx) => (
                <span key={idx} className={part.added ? "bg-green-200 text-green-900 px-1 rounded mx-px" : part.removed ? "bg-rose-100 text-rose-500 line-through px-1 rounded mx-px" : "text-slate-600"}>
                  {part.value}
                </span>
              ))}
          </div>
          <div className="p-4 border-t border-slate-100 flex gap-4 text-[10px] font-bold uppercase tracking-wider bg-white">
            <span className="flex items-center gap-1 text-green-700"><div className="w-2 h-2 rounded-full bg-green-400" /> Addition</span>
            <span className="flex items-center gap-1 text-rose-500"><div className="w-2 h-2 rounded-full bg-rose-400" /> Removal</span>
          </div>
        </div>

      </div>
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                Components                                  */
/* -------------------------------------------------------------------------- */

function DashboardCard({ icon, label, value, color }: { icon: React.ReactNode, label: string, value: number, color: string }) {
  return (
    <div className="flex items-center gap-4 px-6 py-3.5 bg-white/70 backdrop-blur-md rounded-2xl border border-white shadow-[0_8px_20px_rgba(0,0,0,0.03)] hover:bg-white/90 transition-colors">
      <div className={`p-2.5 rounded-xl bg-slate-50 border border-slate-100 shadow-sm ${color}`}>{icon}</div>
      <div>
        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{label}</div>
        <div className={`text-lg font-black tracking-tight ${color}`}>{value}%</div>
      </div>
    </div>
  );
}

function CompletionScreen({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-2xl">
      <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} className="w-full max-w-md rounded-[32px] bg-white p-10 shadow-2xl flex flex-col items-center text-center">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", bounce: 0.6, delay: 0.2 }} className="w-24 h-24 rounded-full bg-green-50 flex items-center justify-center mb-6 shadow-inner"><CheckCircle2 className="w-12 h-12 text-green-500" /></motion.div>
        <h2 className="text-2xl font-extrabold text-slate-900 mb-2">Profile Optimized!</h2>
        <p className="text-slate-500 text-[15px] font-medium mb-8 leading-relaxed">Your LinkedIn profile has been successfully optimized, ATS verified, and saved to ResumeHive.</p>
        <button onClick={onClose} className="w-full rounded-2xl bg-slate-900 text-white py-4 font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all">Continue to ResumeHive</button>
      </motion.div>
    </div>
  );
}

function LinkedinIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

/* -------------------------------------------------------------------------- */
/*                        Premium Upload Dropzone v2                          */
/* -------------------------------------------------------------------------- */

import { useMotionValue, useTransform, useSpring } from "framer-motion";
import { Lock } from "lucide-react";

function PremiumUploadDropzone({ onUpload, uploading, uploadStage, error, inputRef }: any) {
  const [isDragOver, setIsDragOver] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  
  // Physics for 3D Tilt and Mouse Tracking
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);
  
  const springConfig = { damping: 25, stiffness: 300, mass: 0.5 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  const rotateX = useTransform(smoothY, [0, 1], [4, -4]);
  const rotateY = useTransform(smoothX, [0, 1], [-4, 4]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current || uploading) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    mouseX.set(x);
    mouseY.set(y);
  };
  
  const handleMouseLeave = () => {
    mouseX.set(0.5);
    mouseY.set(0.5);
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    if (!uploading) setIsDragOver(true);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!uploading) setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (!uploading && e.dataTransfer.files?.[0]) {
      onUpload(e.dataTransfer.files[0]);
    }
  };

  // Upload Stages for Gemini-like states
  const STAGES = [
    "Initializing Engine...",
    "Extracting LinkedIn PDF...",
    "Analyzing Profile Geometry...",
    "Optimizing via AI...",
    "Preparing Review...",
    "Import Complete!"
  ];
  
  const isSuccess = uploadStage === 5;

  return (
    <motion.div 
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      style={{ rotateX, rotateY, transformPerspective: 1200 }}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className={`relative max-w-2xl mx-auto w-full group overflow-hidden rounded-[36px] bg-white/70 backdrop-blur-3xl shadow-[0_20px_60px_rgba(0,0,0,0.06)] border-2 transition-colors duration-500 mb-16 ${
        isDragOver ? "border-[#0A66C2] shadow-[0_20px_80px_rgba(10,102,194,0.15)]" : "border-white/80"
      }`}
    >
      {/* Animated Mesh Background Layer */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-[36px] z-0">
        <motion.div 
          animate={{ rotate: 360 }} transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
          className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] opacity-20"
          style={{ background: "radial-gradient(circle at center, #0A66C2 0%, transparent 40%), radial-gradient(circle at 80% 20%, #A855F7 0%, transparent 30%), radial-gradient(circle at 20% 80%, #06B6D4 0%, transparent 30%)", filter: "blur(80px)" }}
        />
      </div>

      {/* Uploading Scanning Line & Border Glow */}
      <AnimatePresence>
        {uploading && !isSuccess && (
          <motion.div 
            initial={{ top: "-20%" }} animate={{ top: "120%" }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="absolute left-0 right-0 h-32 bg-gradient-to-b from-transparent via-[#0A66C2]/10 to-transparent pointer-events-none z-10" 
          />
        )}
      </AnimatePresence>
      
      {/* Floating Ambient Cursor Light */}
      <motion.div
        className="absolute w-64 h-64 bg-white/40 blur-[50px] rounded-full pointer-events-none z-0"
        style={{
          left: useTransform(smoothX, [0, 1], ["-20%", "80%"]),
          top: useTransform(smoothY, [0, 1], ["-20%", "80%"])
        }}
      />

      <div className="relative z-10 flex flex-col items-center text-center p-12">
        {/* Floating LinkedIn Icon / Success Ring */}
        <div className="relative w-28 h-28 mb-8">
          <AnimatePresence mode="wait">
            {isSuccess ? (
              <motion.div key="success" initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", bounce: 0.6 }} className="absolute inset-0 flex items-center justify-center rounded-[28px] bg-green-100 shadow-inner border border-green-200">
                <CheckCircle2 className="w-14 h-14 text-green-600" />
              </motion.div>
            ) : (
              <motion.div 
                key="upload"
                animate={{ y: uploading ? [0, -10, 0] : isDragOver ? -8 : [0, -6, 0] }}
                transition={{ duration: uploading ? 1 : 4, repeat: Infinity, ease: "easeInOut" }}
                className={`absolute inset-0 flex items-center justify-center rounded-[28px] bg-white shadow-[0_8px_30px_rgba(0,0,0,0.08)] border transition-all duration-300 ${isDragOver ? "border-[#0A66C2] scale-110" : "border-slate-100 group-hover:border-slate-200 group-hover:scale-105"}`}
              >
                {uploading ? (
                  <Sparkles className="w-10 h-10 text-[#0A66C2] animate-pulse" />
                ) : (
                  <LinkedinIcon className="w-10 h-10 text-[#0A66C2]" />
                )}
              </motion.div>
            )}
          </AnimatePresence>
          {uploading && !isSuccess && (
             <svg className="absolute -inset-4 w-[calc(100%+32px)] h-[calc(100%+32px)] -rotate-90 animate-[spin_3s_linear_infinite] opacity-50" viewBox="0 0 100 100">
               <circle cx="50" cy="50" r="48" fill="none" stroke="url(#gradient)" strokeWidth="3" strokeDasharray="150 150" strokeLinecap="round" />
               <defs>
                 <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                   <stop offset="0%" stopColor="#0A66C2" />
                   <stop offset="100%" stopColor="#A855F7" />
                 </linearGradient>
               </defs>
             </svg>
          )}
        </div>

        {/* Heading & Subtitle */}
        <div className="mb-10 min-h-[80px]">
          <AnimatePresence mode="wait">
             {uploading ? (
                <motion.h2 key="uploading" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className={`text-3xl font-extrabold tracking-tight ${isSuccess ? "text-green-600" : "text-slate-900"}`}>
                  {STAGES[uploadStage]}
                </motion.h2>
             ) : (
                <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 mb-3">{isDragOver ? "Drop Profile PDF Here" : "Upload LinkedIn Export"}</h2>
                  <p className="text-[16px] leading-relaxed font-medium text-slate-500 max-w-sm mx-auto">
                    Go to your LinkedIn profile &rarr; More &rarr; Save to PDF. Drop it anywhere on this card.
                  </p>
                </motion.div>
             )}
          </AnimatePresence>
        </div>

        {/* Upload Button (Magnetic) */}
        {!uploading && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => inputRef.current?.click()}
            className="relative overflow-hidden flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 px-10 py-5 text-[16px] font-bold tracking-wide text-white shadow-[0_10px_30px_rgba(0,0,0,0.2)] transition-all hover:shadow-[0_15px_40px_rgba(10,102,194,0.3)] w-full sm:w-auto"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-[#0A66C2] to-purple-600 opacity-0 hover:opacity-100 transition-opacity duration-500" />
            <Upload className="relative z-10 w-5 h-5" />
            <span className="relative z-10">Select PDF File</span>
          </motion.button>
        )}
        <input ref={inputRef} type="file" accept=".pdf" className="hidden" onChange={(e) => onUpload(e.target.files?.[0])} />

        {/* Error State */}
        {error && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="mt-8 flex items-center gap-3 rounded-2xl bg-red-50 p-5 text-[15px] font-medium text-red-700 border border-red-100">
            <AlertCircle className="w-5 h-5 shrink-0 text-red-500" />
            {error}
          </motion.div>
        )}

        {/* Trust Indicators */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
          <span className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 text-[11px] font-bold uppercase tracking-widest text-slate-500">
            <Lock className="w-3.5 h-3.5"/> Private & Secure
          </span>
          <span className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 text-[11px] font-bold uppercase tracking-widest text-slate-500">
            <Sparkles className="w-3.5 h-3.5 text-amber-500"/> AI Optimized
          </span>
          <span className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 text-[11px] font-bold uppercase tracking-widest text-slate-500">
            <Target className="w-3.5 h-3.5 text-emerald-500"/> ATS Ready
          </span>
        </div>
      </div>
    </motion.div>
  );
}
