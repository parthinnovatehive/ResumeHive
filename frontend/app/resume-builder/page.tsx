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
import { resumesApi, type AtsScoreResult, type ParseUploadResult } from "@/lib/api/resumes";
import { useAutoSave } from "@/hooks/useAutoSave";
import { useToast } from "@/components/ui/Toast";
import { FormStep } from "@/components/resume-builder/FormStep";
import { ImportResume } from "@/components/resume-builder/ImportResume";
import {
  ResumePreview,
  PreviewHeader,
} from "@/components/resume-builder/ResumePreview";
import { TemplateSelector } from "@/components/resume-builder/TemplateSelector";
import { GapAnalysis } from "@/components/resume-builder/GapAnalysis";
import { AtsScorePanel } from "@/components/resume-builder/AtsScorePanel";
import { AtsPreviewModal } from "@/components/resume-builder/AtsPreviewModal";
import { DraggableSection } from "@/components/resume-builder/DraggableSection";
import { STEP_CONFIG, DEFAULT_SECTIONS, isTemplateName } from "@/types/resume";
import type { Resume, SaveStatus, TemplateName } from "@/types/resume";
import { cn } from "@/lib/utils";
import { 
  CheckCircle2, Circle, ArrowLeft, ArrowRight, 
  Download, Activity, Save, AlertCircle, Focus, Eye, Sparkles
} from "lucide-react";

const LOCALSTORAGE_KEY = "resumehive_draft";
const TEMPLATE_KEY = "resumehive_template";

export default function ResumeBuilderPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center bg-slate-50">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-premium-blue border-t-transparent shadow-sm" />
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
  const [sectionOrder, setSectionOrder] = useState<string[]>([
    ...DEFAULT_SECTIONS,
  ]);
  const [atsResult, setAtsResult] = useState<AtsScoreResult | null>(null);
  const [savedJd, setSavedJd] = useState<string>("");
  const [generating, setGenerating] = useState(false);
  const [scoring, setScoring] = useState(false);
  const [jdScoring, setJdScoring] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [showAtsPreview, setShowAtsPreview] = useState(false);
  const [loading, setLoading] = useState(true);
  const [template, setTemplate] = useState<TemplateName>("classic");
  const [showGapAnalysis, setShowGapAnalysis] = useState(false);
  const initialLoadDone = useRef(false);

  /* ── Restore template preference ──────────────────────────────── */

  useEffect(() => {
    const saved = localStorage.getItem(TEMPLATE_KEY);
    if (isTemplateName(saved)) {
      setTemplate(saved);
    }
  }, []);

  const handleTemplateChange = (t: TemplateName) => {
    setTemplate(t);
    localStorage.setItem(TEMPLATE_KEY, t);
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

  /* ── Auto-save ───────────────────────────────────────────────── */

  const saveFn = useCallback(
    async (data: Record<string, unknown>) => {
      if (!resumeId) return;
      await resumesApi.patch(resumeId, data);
    },
    [resumeId],
  );

  const { status: saveStatus } = useAutoSave({ saveFn, delay: 2000 });

  // Trigger auto-save whenever form values change (after initial load)
  useEffect(() => {
    if (!initialLoadDone.current || !resumeId) return;
    const data = form.getValues();
    saveFn(data as Record<string, unknown>);
  }, [watched, resumeId]);

  /* ── Load existing resume (?resume=) or create a new one ─────── */

  const populateForm = useCallback(
    (resume: Resume) => {
      form.reset({
        full_name: resume.full_name || "",
        email: resume.email || "",
        phone: resume.phone || "",
        location: resume.location || "",
        linkedin_url: resume.linkedin_url || "",
        summary: resume.summary || "",
        education: (resume.education as ResumeFormData["education"]) || [],
        experience:
          (resume.experience as ResumeFormData["experience"]) || [],
        projects: (resume.projects as ResumeFormData["projects"]) || [],
        skills: (resume.skills as string[]) || [],
        certifications: (resume.certifications as string[]) || [],
        section_order: (resume.section_order as string[]) || [
          ...DEFAULT_SECTIONS,
        ],
      });
      if (resume.section_order?.length) {
        setSectionOrder(resume.section_order as string[]);
      }
      if (resume.jd_text) {
        setSavedJd(resume.jd_text);
      }
    },
    [form],
  );

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
          if (resume.full_name || resume.education?.length) {
            populateForm(resume);
          }
        }
      } catch {
        toast(
          requestedId
            ? "Failed to load the resume. It may have been deleted."
            : "Failed to initialise resume. Is the backend running?",
          "error",
        );
      } finally {
        setLoading(false);
      }
    })();
  }, [searchParams, populateForm, router, toast, form]);

  /* ── Navigation ──────────────────────────────────────────────── */

  const onNext = async () => {
    const valid = await form.trigger();
    if (!valid) {
      toast("Please fix the errors before continuing.", "error");
      return;
    }
    setStep((s) => Math.min(s + 1, STEP_CONFIG.length - 1));
  };

  const onPrev = () => setStep((s) => Math.max(s - 1, 0));

  /* ── Drag-and-drop section reordering ────────────────────────── */

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

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

  /* ── Instant ATS score (no PDF needed) ───────────────────────── */

  const handleScore = async () => {
    if (!resumeId) return;
    setScoring(true);
    try {
      await resumesApi.patch(
        resumeId,
        form.getValues() as Record<string, unknown>,
      );
      const result = await resumesApi.score(resumeId);
      setAtsResult(result);
    } catch {
      toast("Failed to compute ATS score.", "error");
    } finally {
      setScoring(false);
    }
  };

  const handleScoreWithJd = async (jdText: string | null) => {
    if (!resumeId) return;
    setJdScoring(true);
    try {
      await resumesApi.patch(
        resumeId,
        form.getValues() as Record<string, unknown>,
      );
      const result = await resumesApi.scoreWithJd(resumeId, jdText ?? undefined);
      setAtsResult(result);
    } catch {
      toast("Failed to match against the job description.", "error");
    } finally {
      setJdScoring(false);
    }
  };

  /* ── Generate PDF + ATS score ────────────────────────────────── */

  const handleGenerate = async () => {
    if (!resumeId) return;
    setGenerating(true);
    try {
      await resumesApi.generate(resumeId, template);
      const result = await resumesApi.score(resumeId);
      setAtsResult(result);
      toast("PDF generated successfully!", "success");
    } catch {
      toast("Failed to generate PDF.", "error");
    } finally {
      setGenerating(false);
    }
  };

  /* ── Download PDF ────────────────────────────────────────────── */

  const handleDownload = async () => {
    if (!resumeId) return;
    setDownloading(true);
    try {
      await resumesApi.download(resumeId, template);
      toast("PDF downloaded!", "success");
    } catch {
      toast("Failed to download PDF.", "error");
    } finally {
      setDownloading(false);
    }
  };

  /* ── Import an existing resume (pre-fill from upload) ────────── */

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
      certifications: d.certifications.length
        ? d.certifications
        : current.certifications,
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

  const SaveBadge = ({ status }: { status: SaveStatus }) => {
    if (status === "idle") return null;
    const icon = {
      saving: <div className="h-3 w-3 animate-spin rounded-full border-2 border-slate-400 border-t-transparent" />,
      saved: <CheckCircle2 size={14} className="text-emerald-500" />,
      error: <AlertCircle size={14} className="text-red-500" />
    }[status];

    const text = {
      saving: "Saving...",
      saved: "Saved to cloud",
      error: "Save failed"
    }[status];

    return (
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 text-xs font-medium text-slate-600">
        {icon}
        {text}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-premium-blue border-t-transparent shadow-sm" />
      </div>
    );
  }

  return (
    <FormProvider {...form}>
      {/* Subtract Navbar height, assuming Navbar is sticky or standard header */}
      <div className="flex h-[calc(100vh-72px)] overflow-hidden relative">
        {/* Flagship Ambient Background */}
        <div className="pointer-events-none fixed inset-0 z-[-1] overflow-hidden bg-slate-50">
          <div className="absolute top-[-10%] left-[-10%] w-[800px] h-[800px] rounded-full bg-premium-blue/10 blur-[180px] mix-blend-multiply animate-pulse-slow" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[800px] h-[800px] rounded-full bg-premium-purple/10 blur-[180px] mix-blend-multiply animate-pulse-slow" style={{ animationDelay: "1s" }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] rounded-full bg-premium-emerald/5 blur-[200px] mix-blend-multiply animate-pulse-slow" style={{ animationDelay: "2s" }} />
        </div>
        
        {/* ── Panel 1: Left Sidebar (Navigation) ─────────────────── */}
        <aside className="w-[320px] shrink-0 border-r border-white/60 bg-white/50 backdrop-blur-3xl flex flex-col z-10 shadow-[8px_0_40px_rgba(0,0,0,0.04)]">
          <div className="p-6 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Resume Sections</h2>
            {step === 0 && <ImportResume onParsed={handleImportParsed} />}
          </div>
          
          <nav className="flex-1 overflow-y-auto p-4 space-y-1">
            {STEP_CONFIG.map((s, i) => {
              const isActive = i === step;
              const isPast = i < step;
              
              return (
                <div key={s.key} className="relative group/nav">
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-active"
                      className="absolute inset-0 rounded-2xl bg-white shadow-sm border border-white/80"
                      transition={{ type: "spring", stiffness: 500, damping: 35 }}
                    />
                  )}
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-active-indicator"
                      className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 rounded-r-full bg-gradient-to-b from-premium-blue to-premium-purple"
                      transition={{ type: "spring", stiffness: 500, damping: 35 }}
                    />
                  )}
                  <button
                    onClick={async () => {
                      const valid = await form.trigger();
                      if (valid) setStep(i);
                    }}
                    className={cn(
                      "w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-left relative z-10 transition-all duration-300",
                      isActive ? "text-premium-blue font-bold" : 
                      isPast ? "text-slate-600 hover:text-slate-900 hover:bg-white/40" : "text-slate-400 hover:text-slate-600 hover:bg-white/40"
                    )}
                  >
                    {isPast && !isActive ? (
                      <CheckCircle2 size={18} className="text-premium-emerald" strokeWidth={2.5} />
                    ) : isActive ? (
                      <Focus size={18} className="text-premium-blue drop-shadow-md" strokeWidth={2.5} />
                    ) : (
                      <Circle size={18} strokeWidth={2} />
                    )}
                    <span className="text-[13px] tracking-[0.03em] uppercase">{s.label}</span>
                  </button>
                </div>
              );
            })}
          </nav>
          
          <div className="p-4 border-t border-slate-100 bg-white/50 backdrop-blur-md space-y-3">
            <button
              onClick={handleScore}
              disabled={scoring || !resumeId}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-premium-blueLight/10 text-premium-blue px-4 py-3 text-sm font-semibold hover:bg-premium-blueLight/20 transition-all disabled:opacity-50"
            >
              {scoring ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-premium-blue border-t-transparent" /> : <Activity size={16} />}
              {scoring ? "Analyzing..." : "Analyze ATS Score"}
            </button>
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-900 text-white px-4 py-3 text-sm font-semibold hover:bg-slate-800 hover:shadow-md hover:-translate-y-0.5 transition-all disabled:opacity-50"
            >
              <Download size={16} />
              {downloading ? "Preparing PDF..." : "Export PDF"}
            </button>
          </div>
        </aside>

        {/* ── Panel 2: Center Editor (Form) ──────────────────────── */}
        <div className="flex-1 overflow-y-auto relative scroll-smooth bg-transparent">
          <div className="max-w-[700px] mx-auto px-10 py-12 min-h-full flex flex-col relative z-10">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
                Step {step + 1} of {STEP_CONFIG.length}
              </h3>
              <SaveBadge status={saveStatus} />
            </div>
            
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="glass-card rounded-3xl p-8 mb-8 flex-1 shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
              >
                <FormStep step={step} />
              </motion.div>
            </AnimatePresence>
            
            <div className="flex items-center justify-between mt-auto pt-10 border-t border-slate-200/40">
              <motion.button
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={onPrev}
                disabled={step === 0}
                className="flex items-center gap-2 px-8 py-3.5 rounded-full font-bold text-[13px] tracking-wide uppercase text-slate-500 bg-white/60 border border-white/80 hover:bg-white hover:text-slate-800 shadow-sm transition-all disabled:opacity-40 disabled:pointer-events-none"
              >
                <ArrowLeft size={16} strokeWidth={2.5} /> Back
              </motion.button>
              
              {step < STEP_CONFIG.length - 1 ? (
                <motion.button
                  whileHover={{ y: -2, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onNext}
                  className="group flex items-center gap-2 rounded-full bg-gradient-to-r from-premium-blue to-premium-purple px-10 py-3.5 font-bold text-[13px] tracking-wide uppercase text-white shadow-[0_8px_20px_rgba(37,99,235,0.25)] hover:shadow-[0_12px_24px_rgba(37,99,235,0.35)] transition-all relative overflow-hidden"
                >
                  <span className="relative z-10 flex items-center gap-2">Continue <ArrowRight size={16} strokeWidth={2.5} className="transition-transform group-hover:translate-x-1" /></span>
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                </motion.button>
              ) : (
                <motion.button
                  whileHover={{ y: -2, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleGenerate}
                  disabled={generating}
                  className="group flex items-center gap-2 rounded-full bg-gradient-to-r from-premium-emerald to-emerald-400 px-10 py-3.5 font-bold text-[13px] tracking-wide uppercase text-white shadow-[0_8px_20px_rgba(16,185,129,0.25)] hover:shadow-[0_12px_24px_rgba(16,185,129,0.35)] transition-all disabled:opacity-50 relative overflow-hidden"
                >
                  <span className="relative z-10 flex items-center gap-2">{generating ? "Finalizing..." : "Finish & Generate"} <Sparkles size={16} strokeWidth={2.5} className={generating ? "animate-spin" : ""} /></span>
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                </motion.button>
              )}
            </div>

            {/* ATS Result Inline */}
            {atsResult && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8 glass-card p-6 rounded-3xl border border-premium-blue/20 bg-white/80 backdrop-blur-xl"
              >
                <AtsScorePanel
                  result={atsResult}
                  onClose={() => setAtsResult(null)}
                  onScoreWithJd={handleScoreWithJd}
                  jdScoring={jdScoring}
                />
              </motion.div>
            )}
          </div>
        </div>

        {/* ── Panel 3: Right Live Preview ────────────────────────── */}
        <aside className="w-[600px] shrink-0 border-l border-white/40 bg-white/20 backdrop-blur-md hidden xl:flex flex-col relative z-0 shadow-[-8px_0_32px_rgba(0,0,0,0.03)]">
          <div className="p-4 border-b border-white/40 bg-white/40 backdrop-blur-xl flex items-center justify-between shadow-sm z-10 gap-4">
            <TemplateSelector selected={template} onChange={handleTemplateChange} />
            {resumeId && (
              <motion.button
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowGapAnalysis(!showGapAnalysis)}
                className={cn(
                  "flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition-all duration-300",
                  showGapAnalysis
                    ? "bg-gradient-to-r from-premium-purple to-premium-indigo text-white shadow-md"
                    : "bg-white/60 border border-white shadow-sm text-slate-700 hover:bg-white"
                )}
              >
                <Sparkles size={16} />
                {showGapAnalysis ? "Hide Gap Analysis" : "Gap Analysis"}
              </motion.button>
            )}
          </div>
          
          <div className="flex-1 overflow-y-auto p-8 relative flex justify-center">
            {showGapAnalysis && resumeId && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute inset-x-8 top-8 z-20 rounded-2xl border border-premium-purple/20 bg-white/95 p-6 shadow-2xl backdrop-blur-xl"
              >
                <div className="flex justify-between items-start mb-4">
                  <h4 className="font-bold text-slate-900 flex items-center gap-2"><Sparkles className="text-premium-purple" size={18}/> Gap Analysis</h4>
                  <button onClick={() => setShowGapAnalysis(false)} className="text-slate-400 hover:text-slate-600">×</button>
                </div>
                <GapAnalysis resumeId={resumeId} onAddSkill={handleAddGapSkill} />
              </motion.div>
            )}

            <div className="w-full max-w-[794px] origin-top scale-[0.80] xl:scale-[0.85] 2xl:scale-[0.90] transition-transform duration-500 ease-out">
              <div className="rounded-xl bg-white shadow-[0_24px_80px_-12px_rgba(0,0,0,0.15)] ring-1 ring-slate-900/5 overflow-hidden min-h-[1123px] relative group">
                <PreviewHeader data={watched} template={template} />
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={sectionOrder}
                    strategy={verticalListSortingStrategy}
                  >
                    {sectionOrder.map((section) => (
                      <DraggableSection key={section} id={section}>
                        <ResumePreview
                          section={section}
                          data={watched}
                          template={template}
                        />
                      </DraggableSection>
                    ))}
                  </SortableContext>
                </DndContext>
                
                {/* Overlay gradient for premium feel */}
                <div className="absolute inset-0 pointer-events-none rounded-xl ring-1 ring-inset ring-black/5 mix-blend-overlay"></div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </FormProvider>
  );
}
