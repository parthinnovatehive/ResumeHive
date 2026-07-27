"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import {
  resumeFormSchema,
  type ResumeFormData,
} from "@/lib/validations/resume.schema";
import { resumesApi, type AtsScoreResult, type ParseUploadResult, type RewriteResult } from "@/lib/api/resumes";
import { useAutoSave } from "@/hooks/useAutoSave";
import { useHistory } from "@/hooks/useHistory";
import { useToast } from "@/components/ui/Toast";
import { FormStep, type RewriteCallbacks } from "@/components/resume-builder/FormStep";
import { ImportResume } from "@/components/resume-builder/ImportResume";
import { PreviewHeader } from "@/components/resume-builder/ResumePreview";
import { WysiwygPreview } from "@/components/resume-builder/WysiwygPreview";
import { TemplateSelector } from "@/components/resume-builder/TemplateSelector";
import { GapAnalysis } from "@/components/resume-builder/GapAnalysis";
import { PremiumTemplateGallery } from "@/components/resume-builder/PremiumTemplateGallery";
import { SettingsModal } from "@/components/resume-builder/SettingsModal";
import { AtsScorePanel } from "@/components/resume-builder/AtsScorePanel";
import { STEP_CONFIG, DEFAULT_SECTIONS, isTemplateName } from "@/types/resume";
import type { Resume, SaveStatus, TemplateName } from "@/types/resume";
import { cn } from "@/lib/utils";
import { 
  CheckCircle2, Circle, ArrowLeft, ArrowRight, 
  Download, Activity, Save, AlertCircle, Focus, Eye, Sparkles,
  Settings, Undo, Redo, FileText, LayoutTemplate, Check, X, Loader2
} from "lucide-react";

const LOCALSTORAGE_KEY = "resumehive_draft";
const TEMPLATE_KEY = "resumehive_template";

export default function ResumeBuilderPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen w-full items-center justify-center bg-slate-50">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent shadow-sm" />
        </div>
      }
    >
      <ResumeBuilder />
    </Suspense>
  );
}

function ResumeBuilder() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [step, setStep] = useState(0);
  const [resumeId, setResumeId] = useState<number | null>(null);
  const [sectionOrder, setSectionOrder] = useState<string[]>([...DEFAULT_SECTIONS]);
  const [atsResult, setAtsResult] = useState<AtsScoreResult | null>(null);
  const [savedJd, setSavedJd] = useState<string>("");
  const [generating, setGenerating] = useState(false);
  const [scoring, setScoring] = useState(false);
  const [jdScoring, setJdScoring] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [template, setTemplate] = useState<TemplateName>("classic");
  const [showTemplates, setShowTemplates] = useState(false);
  const [showAtsPanel, setShowAtsPanel] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  const initialLoadDone = useRef(false);

  // LLM rewrite state
  const [rewritingSummary, setRewritingSummary] = useState(false);
  const [rewritingExperience, setRewritingExperience] = useState(false);
  const [rewritingProject, setRewritingProject] = useState(false);
  const [rewriteModal, setRewriteModal] = useState<{
    show: boolean;
    data: RewriteResult | null;
    fieldPath: string;
  }>({ show: false, data: null, fieldPath: "" });

  /* ── Keyboard Shortcuts ───────────────────────────────────────── */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey)) {
        if (e.key === 's') {
          e.preventDefault();
          toast("Resume saved successfully", "success");
        }
        if (e.key === 'e') {
          e.preventDefault();
          document.getElementById('btn-export-pdf')?.click();
        }
        if (e.key.toLowerCase() === 'a' && e.shiftKey) {
          e.preventDefault();
          document.getElementById('btn-ats-score')?.click();
        }
        if (e.key === 'p') {
          e.preventDefault();
          document.getElementById('btn-print-ready')?.click();
        }
        if (e.key === ',') {
          e.preventDefault();
          setShowSettings(true);
        }
      }
      if (e.key === 'Escape') {
        setShowSettings(false);
        setShowAtsPanel(false);
        setShowTemplates(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toast]);

  /* ── Restore template preference ──────────────────────────────── */
  useEffect(() => {
    const saved = localStorage.getItem(TEMPLATE_KEY);
    if (isTemplateName(saved)) setTemplate(saved);
  }, []);

  const handleTemplateChange = (t: TemplateName) => {
    setTemplate(t);
    localStorage.setItem(TEMPLATE_KEY, t);
    setShowTemplates(false);
  };

  /* ── Form ────────────────────────────────────────────────────── */
  const form = useForm<ResumeFormData>({
    resolver: zodResolver(resumeFormSchema),
    defaultValues: {
      full_name: "",
      email: "",
      phone: "",
      location: "",
      linkedin_url: "",
      summary: "",
      education: [],
      experience: [],
      projects: [],
      skills: [],
      certifications: [],
      section_order: [...DEFAULT_SECTIONS],
    },
  });

  const watched = useWatch({ control: form.control }) as ResumeFormData;

  /* ── History (Undo/Redo) ─────────────────────────────────────── */
  const { state: historyState, pushState, undo, redo, canUndo, canRedo, isUndoRedoAction } = useHistory<ResumeFormData>(form.getValues());

  useEffect(() => {
    if (!initialLoadDone.current) return;
    const t = setTimeout(() => {
      pushState(watched);
    }, 500);
    return () => clearTimeout(t);
  }, [watched, pushState]);

  useEffect(() => {
    if (isUndoRedoAction) {
      form.reset(historyState);
      if (historyState.section_order) setSectionOrder(historyState.section_order);
    }
  }, [historyState, isUndoRedoAction, form]);

  /* ── Auto-save ───────────────────────────────────────────────── */
  const saveFn = useCallback(
    async (data: Record<string, unknown>) => {
      if (!resumeId) return;
      await resumesApi.patch(resumeId, data);
    },
    [resumeId]
  );

  const { status: saveStatus } = useAutoSave({ saveFn, delay: 2000 });

  useEffect(() => {
    if (!initialLoadDone.current || !resumeId) return;
    const data = form.getValues();
    saveFn(data as Record<string, unknown>);
  }, [watched, resumeId]);

  /* ── Load existing resume (?resume=) or create a new one ─────── */
  const populateForm = useCallback((resume: Resume) => {
    form.reset({
      full_name: resume.full_name || "",
      email: resume.email || "",
      phone: resume.phone || "",
      location: resume.location || "",
      linkedin_url: resume.linkedin_url || "",
      summary: resume.summary || "",
      education: (resume.education as ResumeFormData["education"]) || [],
      experience: (resume.experience as ResumeFormData["experience"]) || [],
      projects: (resume.projects as ResumeFormData["projects"]) || [],
      skills: (resume.skills as string[]) || [],
      certifications: (resume.certifications as string[]) || [],
      section_order: (resume.section_order as string[]) || [...DEFAULT_SECTIONS],
    });
    if (resume.section_order?.length) setSectionOrder(resume.section_order as string[]);
    if (resume.jd_text) setSavedJd(resume.jd_text);
  }, [form]);

  useEffect(() => {
    if (initialLoadDone.current) return;
    initialLoadDone.current = true;

    const requestedId = Number(searchParams.get("resume")) || null;

    (async () => {
      try {
        if (requestedId) {
          const resume = await resumesApi.get(requestedId);
          setResumeId(resume.id);
          populateForm(resume);
        } else {
          let initialData: Record<string, unknown> = {};
          const draft = localStorage.getItem(LOCALSTORAGE_KEY);
          if (draft) {
            try {
              initialData = JSON.parse(draft);
              form.reset(initialData as ResumeFormData);
            } catch { /* corrupt draft */ }
            localStorage.removeItem(LOCALSTORAGE_KEY);
          }
          const resume = await resumesApi.create(initialData);
          setResumeId(resume.id);
          router.replace(`/resume-builder?resume=${resume.id}`);
          if (resume.full_name || resume.education?.length) populateForm(resume);
        }
      } catch {
        toast(requestedId ? "Failed to load the resume." : "Failed to initialise resume.", "error");
      } finally {
        setLoading(false);
      }
    })();
  }, [searchParams, populateForm, router, toast, form]);

  /* ── Navigation ──────────────────────────────────────────────── */
  const onNext = async () => {
    const valid = await form.trigger();
    if (!valid) { toast("Please fix the errors before continuing.", "error"); return; }
    setStep((s) => Math.min(s + 1, STEP_CONFIG.length - 1));
  };
  const onPrev = () => setStep((s) => Math.max(s - 1, 0));

  /* ── Drag-and-drop ───────────────────────────────────────────── */
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = sectionOrder.indexOf(active.id as string);
    const newIndex = sectionOrder.indexOf(over.id as string);
    const newOrder = [...sectionOrder];
    newOrder.splice(oldIndex, 1);
    newOrder.splice(newIndex, 0, active.id as string);
    setSectionOrder(newOrder);
  };

  /* ── API Actions ──────────────────────────────────────────────── */
  const handleScore = async () => {
    if (!resumeId) return;
    setScoring(true); setShowAtsPanel(true);
    try {
      await resumesApi.patch(resumeId, form.getValues() as Record<string, unknown>);
      const result = await resumesApi.score(resumeId);
      setAtsResult(result);
    } catch { toast("Failed to compute ATS score.", "error"); setShowAtsPanel(false); } 
    finally { setScoring(false); }
  };

  const handleGenerate = async () => {
    if (!resumeId) return;
    setGenerating(true);
    try {
      await resumesApi.generate(resumeId, template);
      toast("PDF generated successfully! Ready to download.", "success");
    } catch { toast("Failed to generate PDF.", "error"); } 
    finally { setGenerating(false); }
  };

  const handleDownload = async () => {
    if (!resumeId) return;
    setDownloading(true);
    try {
      await resumesApi.download(resumeId, template);
      toast("✓ Resume exported successfully", "success");
    } catch { toast("Failed to download PDF.", "error"); } 
    finally { setDownloading(false); }
  };

  const handleImportParsed = (result: ParseUploadResult) => {
    const d = result.data;
    const current = form.getValues();
    form.reset({
      ...current,
      full_name: d.full_name || current.full_name,
      email: d.email || current.email,
      phone: d.phone || current.phone,
      location: d.location || current.location,
      linkedin_url: d.linkedin_url || current.linkedin_url,
      summary: d.summary || current.summary,
      education: d.education.length ? d.education : current.education,
      experience: d.experience.length ? d.experience : current.experience,
      projects: d.projects.length ? d.projects : current.projects,
      skills: d.skills.length ? d.skills : current.skills,
      certifications: d.certifications.length ? d.certifications : current.certifications,
    });
    toast("Resume imported — review the highlighted fields.", "success");
  };

  const handleAddGapSkill = (skill: string) => {
    const current = form.getValues("skills") || [];
    if (current.some((s: string) => s.toLowerCase() === skill.toLowerCase())) {
      toast(`"${skill}" is already in your skills.`, "error");
      return;
    }
    form.setValue("skills", [...current, skill], { shouldDirty: true });
    toast(`Added "${skill}" to skills.`, "success");
  };

  /* ── LLM Rewrite handlers ────────────────────────────────────── */

  const handleRewriteSummary = async () => {
    if (!resumeId) return;
    setRewritingSummary(true);
    try {
      const result = await resumesApi.rewriteSummary(resumeId);
      setRewriteModal({ show: true, data: result, fieldPath: "summary" });
    } catch {
      toast("Failed to rewrite summary. Is the LLM service running?", "error");
    } finally {
      setRewritingSummary(false);
    }
  };

  const handleRewriteExperience = async (index: number) => {
    if (!resumeId) return;
    setRewritingExperience(true);
    try {
      const result = await resumesApi.rewriteExperience(resumeId, index);
      setRewriteModal({ show: true, data: result, fieldPath: `experience.${index}.description` });
    } catch {
      toast("Failed to rewrite experience. Is the LLM service running?", "error");
    } finally {
      setRewritingExperience(false);
    }
  };

  const handleRewriteProject = async (index: number) => {
    if (!resumeId) return;
    setRewritingProject(true);
    try {
      const result = await resumesApi.rewriteProject(resumeId, index);
      setRewriteModal({ show: true, data: result, fieldPath: `projects.${index}.description` });
    } catch {
      toast("Failed to rewrite project. Is the LLM service running?", "error");
    } finally {
      setRewritingProject(false);
    }
  };

  const handleAcceptRewrite = () => {
    if (!rewriteModal.data || !rewriteModal.fieldPath) return;
    const { fieldPath } = rewriteModal;
    const { rewritten } = rewriteModal.data;

    if (fieldPath === "summary") {
      form.setValue("summary", rewritten, { shouldDirty: true });
    } else if (fieldPath.startsWith("experience.")) {
      const parts = fieldPath.split(".");
      const index = parseInt(parts[1]);
      const experience = form.getValues("experience") || [];
      if (experience[index]) {
        const updated = [...experience];
        updated[index] = { ...updated[index], description: rewritten };
        form.setValue("experience", updated, { shouldDirty: true });
      }
    } else if (fieldPath.startsWith("projects.")) {
      const parts = fieldPath.split(".");
      const index = parseInt(parts[1]);
      const projects = form.getValues("projects") || [];
      if (projects[index]) {
        const updated = [...projects];
        updated[index] = { ...updated[index], description: rewritten };
        form.setValue("projects", updated, { shouldDirty: true });
      }
    }

    setRewriteModal({ show: false, data: null, fieldPath: "" });
    toast("Rewrite applied!", "success");
  };

  const handleDiscardRewrite = () => {
    setRewriteModal({ show: false, data: null, fieldPath: "" });
  };

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent shadow-sm" />
      </div>
    );
  }

  const rewriteCallbacks: RewriteCallbacks = {
    onRewriteSummary: handleRewriteSummary,
    onRewriteExperience: handleRewriteExperience,
    onRewriteProject: handleRewriteProject,
    rewritingSummary,
    rewritingExperience,
    rewritingProject,
  };

  return (
    <FormProvider {...form}>
      <div className="flex flex-col h-[calc(100vh-72px)] overflow-hidden bg-slate-50 relative selection:bg-indigo-500/30">

        {/* Ambient VisionOS Lighting */}
        <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
          <div className="absolute top-0 left-[20%] w-[600px] h-[600px] rounded-full bg-indigo-500/10 blur-[150px] mix-blend-multiply" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-purple-500/10 blur-[150px] mix-blend-multiply" />
        </div>

        {/* ── SMART TOP TOOLBAR ─────────────────────────────────── */}
        <motion.header initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="h-16 shrink-0 bg-white/70 backdrop-blur-3xl border-b border-slate-200/50 flex items-center justify-between px-6 z-40 relative shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
          <div className="flex items-center gap-4">
            <h1 className="font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-600" /> Untitled Resume
            </h1>
            <div className="h-5 w-px bg-slate-200" />
            <DocumentStatus status={saveStatus} />
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 mr-4 bg-slate-100/50 p-1 rounded-lg">
              <button onClick={undo} disabled={!canUndo} className="p-2 hover:bg-white rounded-md text-slate-500 transition-all hover:shadow-sm disabled:opacity-30 disabled:pointer-events-none" title="Undo (Ctrl+Z)"><Undo className="w-4 h-4"/></button>
              <button onClick={redo} disabled={!canRedo} className="p-2 hover:bg-white rounded-md text-slate-500 transition-all hover:shadow-sm disabled:opacity-30 disabled:pointer-events-none" title="Redo (Ctrl+Shift+Z)"><Redo className="w-4 h-4"/></button>
            </div>
            
            <button onClick={() => setShowTemplates(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold bg-white border border-slate-200 text-slate-700 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all group">
              <LayoutTemplate className="w-4 h-4 text-indigo-500 group-hover:scale-110 transition-transform"/> Template
            </button>
            
            <button id="btn-ats-score" onClick={handleScore} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold bg-indigo-50 text-indigo-700 shadow-sm hover:bg-indigo-100 transition-all">
              <Activity className="w-4 h-4"/> ATS Score
            </button>

            <button id="btn-export-pdf" onClick={handleDownload} disabled={downloading} className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold bg-gradient-to-r from-slate-900 to-slate-800 text-white shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50">
              {downloading ? <Loader2 className="w-4 h-4 animate-spin"/> : <Download className="w-4 h-4"/>} 
              {downloading ? "Exporting..." : "Export PDF"}
            </button>
            
            <button onClick={() => setShowSettings(true)} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 transition-colors" title="Editor Settings"><Settings className="w-5 h-5"/></button>
          </div>
        </motion.header>

        {/* ── 50/50 WORKSPACE SPLIT ──────────────────────────────── */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative z-10">
          
          {/* LEFT SIDE: Resume Form (50%) */}
          <div className={`flex-1 md:w-1/2 flex flex-col transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${isPreviewMode ? 'md:hidden' : 'flex'}`}>
            
            {/* Horizontal Smart Progress Navigation */}
            <div className="shrink-0 p-4 bg-transparent">
              <div className="flex gap-2 overflow-x-auto hide-scrollbar px-2 pb-2 scroll-smooth">
                {STEP_CONFIG.map((s, i) => {
                  const isActive = i === step;
                  const isPast = i < step;
                  return (
                    <button
                      key={s.key}
                      onClick={async () => {
                        const valid = await form.trigger();
                        if (valid) setStep(i);
                      }}
                      className={cn(
                        "relative shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-2xl text-[12px] font-bold tracking-wide uppercase transition-all duration-300 group",
                        isActive ? "bg-white shadow-[0_8px_24px_rgba(0,0,0,0.06)] text-indigo-600 border border-white" : 
                        isPast ? "bg-white/40 text-slate-600 hover:bg-white/80" : "bg-transparent text-slate-400 hover:bg-white/40"
                      )}
                    >
                      {isPast && !isActive ? <CheckCircle2 className="w-4 h-4 text-emerald-500" strokeWidth={2.5}/> :
                       isActive ? <Focus className="w-4 h-4 drop-shadow-sm" strokeWidth={2.5}/> :
                       <Circle className="w-4 h-4 opacity-50" strokeWidth={2}/>}
                      {s.label}
                      {isActive && <motion.div layoutId="nav-indicator" className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-1 rounded-t-full bg-indigo-600" transition={{ type: "spring", stiffness: 500, damping: 30 }} />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Editor Area */}
            <div className="flex-1 overflow-y-auto px-6 md:px-10 pb-24 scroll-smooth">
               {step === 0 && <div className="mb-6"><ImportResume onParsed={handleImportParsed} /></div>}
               <AnimatePresence mode="wait">
                  <motion.div key={step} initial={{ opacity: 0, y: 15, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -15, scale: 0.98 }} transition={{ duration: 0.3, type: "spring", bounce: 0.3 }} className="bg-white/80 backdrop-blur-xl rounded-[32px] p-8 shadow-[0_20px_80px_rgba(0,0,0,0.04)] border border-white relative group/editor">
                    <FormStep step={step} rewriteCallbacks={rewriteCallbacks} />
                  </motion.div>
               </AnimatePresence>

               {/* Editor Bottom Controls */}
               <div className="flex items-center justify-between mt-8 sticky bottom-6 z-20">
                 <motion.button whileHover={{ y: -2 }} whileTap={{ scale: 0.95 }} onClick={onPrev} disabled={step === 0} className="px-6 py-3 rounded-full font-bold text-sm bg-white border border-slate-200 text-slate-600 shadow-sm hover:shadow-md transition-all disabled:opacity-40 flex items-center gap-2">
                   <ArrowLeft className="w-4 h-4"/> Back
                 </motion.button>
                 {step < STEP_CONFIG.length - 1 ? (
                   <motion.button whileHover={{ y: -2 }} whileTap={{ scale: 0.95 }} onClick={onNext} className="px-8 py-3 rounded-full font-bold text-sm bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg hover:shadow-xl transition-all flex items-center gap-2">
                     Next Step <ArrowRight className="w-4 h-4"/>
                   </motion.button>
                 ) : (
                   <motion.button whileHover={{ y: -2 }} whileTap={{ scale: 0.95 }} onClick={handleGenerate} disabled={generating} className="px-8 py-3 rounded-full font-bold text-sm bg-gradient-to-r from-emerald-500 to-emerald-400 text-white shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center gap-2">
                     {generating ? "Finalizing..." : "Finish Resume"} <Sparkles className={`w-4 h-4 ${generating ? 'animate-spin' : ''}`}/>
                   </motion.button>
                 )}
               </div>
            </div>
          </div>

          {/* Right: Wysiwyg Preview */}
          <div className={`w-full md:w-1/2 flex flex-col bg-slate-900/5 ${isPreviewMode ? 'fixed inset-0 z-50 bg-slate-100' : 'hidden md:flex'}`}>
            <WysiwygPreview 
              data={watched} 
              template={template} 
              activeSection={step}
              onSectionClick={(section) => setStep(section as any)}
            />
          </div>

        </div>

        {/* ── ATS FLOATING PANEL ─────────────────────────────────── */}
        <AnimatePresence>
          {showAtsPanel && atsResult && (
            <motion.div initial={{ opacity: 0, x: 50, scale: 0.95 }} animate={{ opacity: 1, x: 0, scale: 1 }} exit={{ opacity: 0, x: 50, scale: 0.95 }} className="absolute bottom-6 right-6 w-96 bg-white/90 backdrop-blur-2xl rounded-3xl shadow-[0_40px_100px_rgba(0,0,0,0.15)] border border-white/60 overflow-hidden z-50">
               <AtsScorePanel result={atsResult} onClose={() => setShowAtsPanel(false)} onScoreWithJd={async () => {}} jdScoring={jdScoring} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── TEMPLATE GALLERY MODAL ──────────────────────────────── */}
        <AnimatePresence>
          {showTemplates && (
            <PremiumTemplateGallery
              onClose={() => setShowTemplates(false)}
              onApply={handleTemplateChange}
              currentTemplate={template}
            />
          )}
        </AnimatePresence>

      </div>

      {/* ── AI Rewrite Comparison Modal ─────────────────────────── */}
      {rewriteModal.show && rewriteModal.data && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Sparkles className="text-premium-blue" size={20} />
                  AI Rewrite
                </h3>
                <button
                  onClick={handleDiscardRewrite}
                  className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
              <p className="text-sm text-slate-500 mt-1">
                Review the AI suggestion below. Accept to apply it to your resume.
              </p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 block">
                  Original
                </label>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-700 whitespace-pre-wrap">
                  {rewriteModal.data.original}
                </div>
              </div>
              <div className="flex justify-center">
                <ArrowRight className="text-premium-blue" size={20} />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-premium-blue mb-2 block">
                  AI Suggestion
                </label>
                <div className="p-4 rounded-xl bg-premium-blueLight/10 border border-premium-blue/20 text-sm text-slate-900 whitespace-pre-wrap">
                  {rewriteModal.data.rewritten}
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                onClick={handleDiscardRewrite}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Discard
              </button>
              <button
                onClick={handleAcceptRewrite}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-premium-blue to-premium-purple text-white text-sm font-semibold hover:shadow-md transition-all"
              >
                Accept & Apply
              </button>
            </div>
          </div>
        </div>
      )}
      
      <AnimatePresence>
        {showSettings && (
          <SettingsModal onClose={() => setShowSettings(false)} />
        )}
      </AnimatePresence>

      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .custom-scrollbar::-webkit-scrollbar { width: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(148, 163, 184, 0.3); border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(148, 163, 184, 0.5); }
      `}} />
    </FormProvider>
  );
}

function DocumentStatus({ status }: { status: SaveStatus }) {
  if (status === "idle") return <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><Check className="w-3.5 h-3.5"/> All Changes Saved</div>;
  if (status === "saving") return <div className="text-[11px] font-bold text-indigo-500 uppercase tracking-widest flex items-center gap-1.5"><div className="w-3 h-3 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"/> Saving...</div>;
  if (status === "error") return <div className="text-[11px] font-bold text-red-500 uppercase tracking-widest flex items-center gap-1.5"><AlertCircle className="w-3.5 h-3.5"/> Save Error</div>;
  return <div className="text-[11px] font-bold text-emerald-500 uppercase tracking-widest flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5"/> Saved to Cloud</div>;
}
