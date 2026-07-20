"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
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

const LOCALSTORAGE_KEY = "resumehive_draft";
const TEMPLATE_KEY = "resumehive_template";

export default function ResumeBuilderPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
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
          // Edit flow: load the requested resume — never create a new one.
          const resume = await resumesApi.get(requestedId);
          setResumeId(resume.id);
          populateForm(resume);
        } else {
          // New-resume flow: restore a legacy local draft once (if any),
          // then create. The id goes into the URL immediately, so from
          // then on refreshes follow the edit flow — no draft needed.
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
          // Put the id in the URL so a refresh resumes this resume
          // instead of creating yet another one.
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
  }, []);

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
      // Flush current form values so the score reflects what's on screen
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

  /* ── Re-score against a pasted job description (Phase 4) ─────── */

  const handleScoreWithJd = async (jdText: string | null) => {
    if (!resumeId) return;
    setJdScoring(true);
    try {
      // Flush current form values so the score reflects what's on screen
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

  /* ── Add skill from gap analysis ────────────────────────────── */

  const handleAddGapSkill = (skill: string) => {
    const current = form.getValues("skills") || [];
    if (current.some((s: string) => s.toLowerCase() === skill.toLowerCase())) {
      toast(`"${skill}" is already in your skills.`, "error");
      return;
    }
    form.setValue("skills", [...current, skill], { shouldDirty: true });
    toast(`Added "${skill}" to skills.`, "success");
  };

  /* ── Save status badge ───────────────────────────────────────── */

  const SaveBadge = ({ status }: { status: SaveStatus }) => {
    const map: Record<SaveStatus, { text: string; cls: string }> = {
      idle: { text: "", cls: "" },
      saving: { text: "Saving...", cls: "text-amber-600" },
      saved: { text: "Saved", cls: "text-green-600" },
      error: { text: "Save failed", cls: "text-red-600" },
    };
    const { text, cls } = map[status];
    if (!text) return null;
    return <span className={`text-xs font-medium ${cls}`}>{text}</span>;
  };

  /* ── Loading state ───────────────────────────────────────────── */

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <FormProvider {...form}>
      <div className="flex h-screen flex-col lg:flex-row">
        {/* ── Left: Form ──────────────────────────────────────── */}
        <div className="flex flex-1 flex-col overflow-hidden lg:w-1/2">
          {/* Progress bar */}
          <div className="border-b bg-white px-6 py-3">
            <div className="mb-2 flex items-center justify-between">
              <h1 className="text-lg font-bold text-gray-900">
                Resume Builder
              </h1>
              <SaveBadge status={saveStatus} />
            </div>
            <nav
              aria-label="Form progress"
              className="flex gap-1 overflow-x-auto"
            >
              {STEP_CONFIG.map((s, i) => (
                <button
                  key={s.key}
                  onClick={() => setStep(i)}
                  aria-current={i === step ? "step" : undefined}
                  className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium transition ${
                    i === step
                      ? "bg-blue-600 text-white"
                      : i < step
                        ? "bg-blue-100 text-blue-700"
                        : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                  }`}
                >
                  {i + 1}. {s.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Form content */}
          <div className="flex-1 overflow-y-auto px-6 py-6">
            {step === 0 && (
              <div className="mb-6">
                <ImportResume onParsed={handleImportParsed} />
              </div>
            )}
            <FormStep step={step} />
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between border-t bg-white px-6 py-3">
            <button
              onClick={onPrev}
              disabled={step === 0}
              className="rounded-lg border border-gray-300 px-5 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Back
            </button>

            <div className="flex gap-3">
              <button
                onClick={handleScore}
                disabled={scoring || !resumeId}
                className="rounded-lg border border-blue-600 px-5 py-2 text-sm font-medium text-blue-700 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {scoring ? "Scoring..." : "Check ATS Score"}
              </button>
              {step < STEP_CONFIG.length - 1 ? (
                <button
                  onClick={onNext}
                  className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
                >
                  Next
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={handleGenerate}
                    disabled={generating}
                    className="rounded-lg bg-green-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {generating ? "Generating..." : "Generate PDF"}
                  </button>
                  <button
                    onClick={handleDownload}
                    disabled={downloading}
                    className="rounded-lg border border-green-600 px-5 py-2 text-sm font-medium text-green-700 transition hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {downloading ? "Downloading..." : "Download PDF"}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* ATS Result */}
          {atsResult && (
            <div className="max-h-[45vh] overflow-y-auto border-t bg-gray-50 px-6 py-4">
              <AtsScorePanel
                result={atsResult}
                onClose={() => setAtsResult(null)}
                onScoreWithJd={handleScoreWithJd}
                jdScoring={jdScoring}
              />
              {resumeId && (
                <button
                  onClick={handleDownload}
                  disabled={downloading}
                  className="mt-3 inline-block rounded bg-green-600 px-4 py-2 text-sm text-white hover:bg-green-700 disabled:opacity-40"
                >
                  {downloading ? "Downloading..." : "Download PDF"}
                </button>
              )}
            </div>
          )}
        </div>

        {/* ── Right: Live preview ─────────────────────────────── */}
        <div className="hidden overflow-y-auto border-l bg-gray-50 p-6 lg:block lg:w-1/2">
          {/* Template selector */}
          <div className="mb-4">
            <TemplateSelector selected={template} onChange={handleTemplateChange} />
          </div>

          {/* Gap Analysis toggle */}
          {resumeId && (
            <div className="mb-4">
              <button
                onClick={() => setShowGapAnalysis(!showGapAnalysis)}
                className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition ${
                  showGapAnalysis
                    ? "border-blue-600 bg-blue-50 text-blue-700"
                    : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
                {showGapAnalysis ? "Hide Gap Analysis" : "Gap Analysis"}
              </button>
            </div>
          )}

          {/* Gap Analysis panel */}
          {showGapAnalysis && resumeId && (
            <div className="mb-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
              <GapAnalysis resumeId={resumeId} onAddSkill={handleAddGapSkill} />
            </div>
          )}

          {/* Preview area */}
          <div className="mx-auto max-w-[600px]">
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
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
            </div>
          </div>
        </div>
      </div>
    </FormProvider>
  );
}
