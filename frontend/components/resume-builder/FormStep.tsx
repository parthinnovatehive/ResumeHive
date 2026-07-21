"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";
import { useFormContext, Controller } from "react-hook-form";
import type { ResumeFormData } from "@/lib/validations/resume.schema";
import { ResumeFormStep } from "./ResumeFormStep";
import { DynamicList } from "./DynamicList";
import { TagsInput } from "./TagsInput";

const SKILL_SUGGESTIONS = [
  "JavaScript",
  "TypeScript",
  "Python",
  "Java",
  "C++",
  "React",
  "Next.js",
  "Node.js",
  "Express",
  "Django",
  "FastAPI",
  "SQL",
  "PostgreSQL",
  "MongoDB",
  "Git",
  "Docker",
  "AWS",
  "REST APIs",
  "GraphQL",
  "HTML",
  "CSS",
  "Tailwind CSS",
  "Machine Learning",
  "Data Structures",
  "Algorithms",
];

const TOTAL_STEPS = 7;

interface Props {
  step: number;
}

const HERO_TAGLINES = [
  { text: "Build a resume that opens doors to your ", highlight: "dream career." },
  { text: "Create ATS-ready resumes with ", highlight: "confidence." },
  { text: "Turn your experience into ", highlight: "opportunity." },
  { text: "Build smarter. ", highlight: "Apply stronger." },
  { text: "Professional resumes for ", highlight: "ambitious careers." },
  { text: "One powerful resume. ", highlight: "Unlimited opportunities." },
  { text: "Build with confidence. ", highlight: "Apply with impact." },
  { text: "Designed to impress ", highlight: "recruiters." },
];

function AnimatedBuilderHero() {
  const [index, setIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [phase, setPhase] = useState<"typing" | "paused" | "erasing" | "crossfade">("typing");

  useEffect(() => {
    const fullText = HERO_TAGLINES[index].text + HERO_TAGLINES[index].highlight;
    let timeout: NodeJS.Timeout;

    if (phase === "typing") {
      if (displayedText.length < fullText.length) {
        timeout = setTimeout(() => {
          setDisplayedText(fullText.slice(0, displayedText.length + 1));
        }, 45);
      } else {
        timeout = setTimeout(() => setPhase("paused"), 3500);
      }
    } else if (phase === "paused") {
      setPhase("erasing");
    } else if (phase === "erasing") {
      if (displayedText.length > 0) {
        timeout = setTimeout(() => {
          setDisplayedText(fullText.slice(0, displayedText.length - 1));
        }, 25);
      } else {
        setPhase("crossfade");
      }
    } else if (phase === "crossfade") {
      timeout = setTimeout(() => {
        setPhase("typing");
        setIndex((prev) => (prev + 1) % HERO_TAGLINES.length);
      }, 500); // 500ms smooth crossfade gap as requested
    }

    return () => clearTimeout(timeout);
  }, [displayedText, phase, index]);

  const baseText = HERO_TAGLINES[index].text;
  const currentBase = displayedText.slice(0, baseText.length);
  const currentHighlight = displayedText.slice(baseText.length);

  return (
    <div className="relative mb-8 -mt-2 flex flex-col items-start w-full">
      {/* Soft Ambient Light & Floating Particles */}
      <div className="absolute left-[-5%] top-[-20%] w-[110%] h-[150%] z-[-1] bg-premium-blue/10 blur-[60px] rounded-[100%] pointer-events-none" />
      <div className="absolute left-10 top-0 w-2 h-2 bg-premium-blue/30 rounded-full blur-[2px] animate-pulse-slow pointer-events-none" />
      <div className="absolute right-20 top-8 w-3 h-3 bg-premium-purple/20 rounded-full blur-[3px] animate-pulse pointer-events-none" style={{ animationDelay: "1s" }} />
      <div className="absolute left-1/3 bottom-0 w-1.5 h-1.5 bg-premium-indigo/40 rounded-full blur-[1px] animate-pulse-slow pointer-events-none" style={{ animationDelay: "2s" }} />
      
      {/* Min-height ensures the layout doesn't shift when text wraps on mobile */}
      <div className="min-h-[88px] flex items-start w-full">
        <motion.p
          initial={{ opacity: 0, y: 5 }}
          animate={{ 
            opacity: phase === "crossfade" ? 0 : 1, 
            y: phase === "crossfade" ? -2 : 0,
            filter: phase === "crossfade" ? "blur(4px)" : "blur(0px)"
          }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="text-[20px] md:text-[24px] lg:text-[28px] font-semibold text-slate-700 leading-snug tracking-[0.01em]"
        >
          {currentBase}
          <span className="relative inline-block">
            {currentHighlight.length > 0 && (
              <span className="bg-gradient-to-r from-premium-blue to-premium-indigo bg-clip-text text-transparent font-bold drop-shadow-[0_2px_12px_rgba(37,99,235,0.15)] transition-all duration-300">
                {currentHighlight}
              </span>
            )}
            {currentHighlight.length > 0 && (
              <span className="absolute inset-0 bg-premium-blue/15 blur-[16px] rounded-full z-[-1]" />
            )}
            <motion.span
              animate={{ opacity: phase === "crossfade" ? 0 : [1, 0, 1] }}
              transition={{ repeat: phase === "crossfade" ? 0 : Infinity, duration: 1.5, ease: "easeInOut" }}
              className="inline-block w-[2px] h-[0.9em] bg-premium-blue/50 align-middle ml-1 transition-opacity duration-300"
            />
          </span>
        </motion.p>
      </div>
      
      <div className="flex flex-wrap items-center gap-3 mt-2">
        {[
          { label: "ATS Optimized" },
          { label: "AI-Powered Suggestions" },
          { label: "Professional Templates" }
        ].map((item, i) => (
          <motion.div
            key={i}
            whileHover={{ y: -2, scale: 1.02 }}
            className="group flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/40 border border-white/60 shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:bg-white/80 hover:shadow-[0_4px_16px_rgba(37,99,235,0.06)] hover:border-premium-blue/20 transition-all duration-300 backdrop-blur-md cursor-default"
          >
            <div className="flex items-center justify-center w-4 h-4 rounded-full bg-premium-emerald/10 text-premium-emerald group-hover:bg-premium-emerald group-hover:text-white transition-colors duration-300">
              <Check size={10} strokeWidth={4} />
            </div>
            <span className="text-[10px] font-bold text-slate-600 tracking-wide uppercase transition-colors group-hover:text-slate-900">{item.label}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export function FormStep({ step }: Props) {
  const { register, control, watch } = useFormContext<ResumeFormData>();
  const summary = watch("summary");

  switch (step) {
    // ── Step 1: Personal Info ──────────────────────────────────
    case 0:
      return (
        <ResumeFormStep
          title="Contact Information"
          stepNumber={1}
          totalSteps={TOTAL_STEPS}
        >
          <AnimatedBuilderHero />
          <div className="space-y-4">
            <Field
              label="Full Name"
              error={undefined}
              {...register("full_name")}
              placeholder="Priya Sharma"
            />
            <div className="grid grid-cols-2 gap-4">
              <Field
                label="Email"
                type="email"
                error={undefined}
                {...register("email")}
                placeholder="priya@example.com"
              />
              <Field
                label="Phone"
                type="tel"
                error={undefined}
                {...register("phone")}
                placeholder="9876543210"
              />
            </div>
            <Field
              label="Location"
              error={undefined}
              {...register("location")}
              placeholder="Bangalore, India"
            />
            <Field
              label="LinkedIn URL"
              error={undefined}
              {...register("linkedin_url")}
              placeholder="https://linkedin.com/in/priya"
            />
          </div>
        </ResumeFormStep>
      );

    // ── Step 2: Professional Summary ───────────────────────────
    case 1:
      return (
        <ResumeFormStep
          title="Professional Summary"
          description="2-3 sentences about your experience and goals."
          stepNumber={2}
          totalSteps={TOTAL_STEPS}
        >
          <div>
            <textarea
              {...register("summary")}
              rows={6}
              placeholder="Software engineer with 3+ years of experience building scalable web applications..."
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              aria-label="Professional summary"
            />
            <div className="mt-1 flex justify-between text-xs text-gray-400">
              <span>Aim for 50-200 words</span>
              <span>{summary?.length || 0} characters</span>
            </div>
          </div>
        </ResumeFormStep>
      );

    // ── Step 3: Education ──────────────────────────────────────
    case 2:
      return (
        <ResumeFormStep
          title="Education"
          description="Add your educational background."
          stepNumber={3}
          totalSteps={TOTAL_STEPS}
        >
          <Controller
            name="education"
            control={control}
            render={({ field }) => (
              <DynamicList
                items={field.value as Record<string, unknown>[]}
                onChange={field.onChange}
                addButtonLabel="Add education"
                emptyMessage="No education entries yet."
                fields={[
                  { name: "institution", placeholder: "College / University", span: "full" },
                  { name: "degree", placeholder: "Degree (e.g. B.Tech)" },
                  { name: "field_of_study", placeholder: "Field of Study (e.g. CS)" },
                  { name: "start_date", placeholder: "Start", type: "month" },
                  { name: "end_date", placeholder: "End", type: "month" },
                  { name: "gpa", placeholder: "GPA / Percentage" },
                ]}
              />
            )}
          />
        </ResumeFormStep>
      );

    // ── Step 4: Experience ─────────────────────────────────────
    case 3:
      return (
        <ResumeFormStep
          title="Work Experience"
          description="Internships, part-time, or full-time roles."
          stepNumber={4}
          totalSteps={TOTAL_STEPS}
        >
          <Controller
            name="experience"
            control={control}
            render={({ field }) => (
              <DynamicList
                items={field.value as Record<string, unknown>[]}
                onChange={field.onChange}
                addButtonLabel="Add experience"
                emptyMessage="No experience entries yet."
                fields={[
                  { name: "company", placeholder: "Company", span: "full" },
                  { name: "title", placeholder: "Job Title" },
                  { name: "start_date", placeholder: "Start", type: "month" },
                  { name: "end_date", placeholder: "End", type: "month" },
                  { name: "is_current", placeholder: "Currently working here", type: "checkbox" },
                  { name: "description", placeholder: "Describe your role, achievements, and impact...", type: "textarea", span: "full", bulletFeedback: true },
                ]}
              />
            )}
          />
        </ResumeFormStep>
      );

    // ── Step 5: Projects ───────────────────────────────────────
    case 4:
      return (
        <ResumeFormStep
          title="Projects"
          description="Highlight key projects and contributions."
          stepNumber={5}
          totalSteps={TOTAL_STEPS}
        >
          <Controller
            name="projects"
            control={control}
            render={({ field }) => (
              <DynamicList
                items={field.value as Record<string, unknown>[]}
                onChange={field.onChange}
                addButtonLabel="Add project"
                emptyMessage="No projects yet."
                fields={[
                  { name: "name", placeholder: "Project Name", span: "full" },
                  { name: "technologies", placeholder: "Technologies (e.g. React, Node.js, PostgreSQL)", span: "full" },
                  { name: "description", placeholder: "What does this project do? What was your contribution?", type: "textarea", span: "full", bulletFeedback: true },
                  { name: "link", placeholder: "https://github.com/...", span: "full" },
                ]}
              />
            )}
          />
        </ResumeFormStep>
      );

    // ── Step 6: Skills ─────────────────────────────────────────
    case 5:
      return (
        <ResumeFormStep
          title="Skills"
          description="Add your technical and soft skills."
          stepNumber={6}
          totalSteps={TOTAL_STEPS}
        >
          <Controller
            name="skills"
            control={control}
            render={({ field }) => (
              <TagsInput
                value={field.value as string[]}
                onChange={field.onChange}
                label="Skills"
                placeholder="Type a skill and press Enter"
                suggestions={SKILL_SUGGESTIONS}
              />
            )}
          />
        </ResumeFormStep>
      );

    // ── Step 7: Certifications ─────────────────────────────────
    case 6:
      return (
        <ResumeFormStep
          title="Certifications"
          description="Any relevant certifications or courses."
          stepNumber={7}
          totalSteps={TOTAL_STEPS}
        >
          <Controller
            name="certifications"
            control={control}
            render={({ field }) => (
              <TagsInput
                value={field.value as string[]}
                onChange={field.onChange}
                label="Certifications"
                placeholder="Type a certification and press Enter"
                suggestions={[
                  "AWS Certified Solutions Architect",
                  "Google Cloud Professional",
                  "Meta Front-End Developer",
                  "Microsoft Azure Fundamentals",
                  "Cisco CCNA",
                  "ISTQB Foundation",
                ]}
              />
            )}
          />
        </ResumeFormStep>
      );

    default:
      return null;
  }
}

/* ── Small helper to keep field markup DRY ────────────────────── */

import type { InputHTMLAttributes } from "react";

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

const Field = React.forwardRef<HTMLInputElement, FieldProps>(
  ({ label, error, placeholder, ...props }, ref) => (
    <div className="relative group pt-2">
      <input
        ref={ref}
        {...props}
        placeholder={placeholder}
        className="peer w-full rounded-xl bg-white/40 backdrop-blur-md px-4 pb-2.5 pt-6 text-sm font-medium text-slate-900 outline-none border border-slate-200/80 shadow-[0_2px_10px_rgba(0,0,0,0.02)] transition-all duration-300 placeholder:text-transparent focus:bg-white/80 focus:border-premium-blue/50 focus:ring-4 focus:ring-premium-blue/10 focus:placeholder:text-slate-400 hover:border-slate-300 hover:bg-white/60"
      />
      <label className="absolute left-4 top-4 text-sm font-semibold tracking-wide text-slate-500 transition-all duration-300 pointer-events-none peer-focus:text-premium-blue peer-focus:text-[10px] peer-focus:top-2 peer-focus:opacity-100 peer-focus:font-bold peer-focus:uppercase peer-focus:tracking-widest peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-placeholder-shown:text-slate-500 peer-placeholder-shown:normal-case peer-placeholder-shown:font-semibold peer-[&:not(:placeholder-shown)]:text-[10px] peer-[&:not(:placeholder-shown)]:top-2 peer-[&:not(:placeholder-shown)]:text-slate-500 peer-[&:not(:placeholder-shown)]:opacity-80 peer-[&:not(:placeholder-shown)]:font-bold peer-[&:not(:placeholder-shown)]:uppercase peer-[&:not(:placeholder-shown)]:tracking-widest">
        {label}
      </label>
      {error && <p className="mt-1.5 text-xs font-bold text-premium-red animate-fade-in pl-1">{error}</p>}
    </div>
  ),
);
Field.displayName = "Field";
