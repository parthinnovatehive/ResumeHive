"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Sparkles, Wand2, Type, FileEdit, Zap, GripVertical, Plus, Trash2, Copy, ChevronDown, ChevronUp } from "lucide-react";
import { useFormContext, Controller } from "react-hook-form";
import type { ResumeFormData } from "@/lib/validations/resume.schema";
import { ResumeFormStep } from "./ResumeFormStep";
import { TagsInput } from "./TagsInput";

const TOTAL_STEPS = 7;

/* ── HERO COMPONENT ────────────────────────────────────────────── */

const HERO_TAGLINES = [
  { text: "Build a resume that opens doors to your ", highlight: "dream career." },
  { text: "Create ATS-ready resumes with ", highlight: "confidence." },
  { text: "Turn your experience into ", highlight: "opportunity." }
];

function AnimatedBuilderHero() {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const i = setInterval(() => setIndex(prev => (prev + 1) % HERO_TAGLINES.length), 4000);
    return () => clearInterval(i);
  }, []);

  return (
    <div className="relative mb-10 -mt-2 flex flex-col items-start w-full">
      <div className="absolute left-[-5%] top-[-20%] w-[110%] h-[150%] z-[-1] bg-indigo-500/10 blur-[60px] rounded-[100%] pointer-events-none" />
      <div className="min-h-[88px] flex items-start w-full">
        <AnimatePresence mode="wait">
          <motion.p key={index} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} transition={{ duration: 0.5 }} className="text-2xl md:text-3xl font-extrabold text-slate-800 leading-snug tracking-tight">
            {HERO_TAGLINES[index].text}
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">{HERO_TAGLINES[index].highlight}</span>
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ── SMART FIELD WITH FLOATING LABEL ───────────────────────────── */

interface FieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}
const Field = React.forwardRef<HTMLInputElement, FieldProps>(({ label, error, placeholder, className, ...props }, ref) => (
  <div className="relative group pt-2 w-full">
    <input ref={ref} {...props} placeholder={placeholder} className={`peer w-full rounded-2xl bg-slate-50/50 backdrop-blur-md px-5 pb-3 pt-7 text-[15px] font-bold text-slate-900 outline-none border border-slate-200/80 shadow-sm transition-all duration-300 placeholder:text-transparent focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 hover:border-slate-300 ${className}`} />
    <label className="absolute left-5 top-5 text-[15px] font-bold tracking-wide text-slate-400 transition-all duration-300 pointer-events-none peer-focus:text-indigo-600 peer-focus:text-[11px] peer-focus:top-2.5 peer-focus:uppercase peer-focus:tracking-widest peer-placeholder-shown:top-5 peer-placeholder-shown:text-[15px] peer-placeholder-shown:text-slate-400 peer-placeholder-shown:normal-case peer-[&:not(:placeholder-shown)]:text-[11px] peer-[&:not(:placeholder-shown)]:top-2.5 peer-[&:not(:placeholder-shown)]:text-slate-500 peer-[&:not(:placeholder-shown)]:uppercase peer-[&:not(:placeholder-shown)]:tracking-widest">
      {label}
    </label>
    {error && <p className="mt-1.5 text-xs font-bold text-red-500 pl-1">{error}</p>}
  </div>
));
Field.displayName = "Field";

/* ── AI ASSISTANT TOOLBAR ──────────────────────────────────────── */

function AIToolbar({ onAction }: { onAction: (action: string) => void }) {
  return (
    <div className="flex flex-wrap items-center gap-2 p-2 bg-slate-50/80 backdrop-blur-xl border border-slate-200 rounded-xl mt-3 shadow-sm">
      <div className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-500 flex items-center gap-1.5 px-2 mr-2"><Sparkles className="w-3.5 h-3.5"/> AI Assist</div>
      <button type="button" onClick={() => onAction('improve')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-white text-slate-600 hover:text-indigo-600 hover:shadow-sm border border-slate-100 transition-all"><Wand2 className="w-3.5 h-3.5"/> Improve</button>
      <button type="button" onClick={() => onAction('rewrite')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-white text-slate-600 hover:text-indigo-600 hover:shadow-sm border border-slate-100 transition-all"><FileEdit className="w-3.5 h-3.5"/> Rewrite</button>
      <button type="button" onClick={() => onAction('professional')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-white text-slate-600 hover:text-indigo-600 hover:shadow-sm border border-slate-100 transition-all"><Type className="w-3.5 h-3.5"/> Professional Tone</button>
      <button type="button" onClick={() => onAction('ats')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 hover:shadow-sm border border-indigo-100 transition-all"><Zap className="w-3.5 h-3.5"/> ATS Optimize</button>
    </div>
  );
}

/* ── SMART TEXTAREA ────────────────────────────────────────────── */

const SmartTextarea = React.forwardRef<HTMLTextAreaElement, any>(({ label, error, onChange, value, ...props }, ref) => {
  const [isAiLoading, setIsAiLoading] = useState(false);
  const handleAiAction = (action: string) => {
    setIsAiLoading(true);
    setTimeout(() => setIsAiLoading(false), 1500);
  };
  
  return (
    <div className="relative group pt-2 w-full">
      <div className={`relative rounded-2xl bg-slate-50/50 backdrop-blur-md border shadow-sm transition-all duration-300 focus-within:bg-white focus-within:border-indigo-400 focus-within:ring-4 focus-within:ring-indigo-500/10 hover:border-slate-300 ${error ? 'border-red-300' : 'border-slate-200/80'}`}>
        <label className={`absolute left-5 top-4 text-[11px] font-bold uppercase tracking-widest transition-all ${value ? 'text-slate-500' : 'text-slate-400'}`}>{label}</label>
        <textarea ref={ref} value={value} onChange={onChange} {...props} className="w-full bg-transparent px-5 pb-4 pt-9 text-[15px] font-bold text-slate-900 outline-none resize-y min-h-[140px] custom-scrollbar" />
        
        <AnimatePresence>
          {isAiLoading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center z-10">
              <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-2" />
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">AI Optimizing...</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <AIToolbar onAction={handleAiAction} />
      {error && <p className="mt-1.5 text-xs font-bold text-red-500 pl-1">{error}</p>}
    </div>
  );
});
SmartTextarea.displayName = "SmartTextarea";

/* ── SECTION MANAGEMENT (DND / CARDS) ──────────────────────────── */

function PremiumSectionCard({ title, subtitle, isExpanded, onToggle, onRemove, onDuplicate, children }: any) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} className="mb-6 bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group">
      <div className="p-4 md:p-5 flex items-center justify-between bg-slate-50/50 cursor-pointer select-none" onClick={onToggle}>
        <div className="flex items-center gap-4">
           <div className="cursor-grab active:cursor-grabbing p-1.5 text-slate-300 hover:text-slate-500 transition-colors"><GripVertical className="w-5 h-5"/></div>
           <div>
             <h4 className="text-[15px] font-extrabold text-slate-900">{title || "(Not Specified)"}</h4>
             {subtitle && <p className="text-xs font-bold text-slate-500">{subtitle}</p>}
           </div>
        </div>
        <div className="flex items-center gap-2">
           <button type="button" onClick={(e) => { e.stopPropagation(); onDuplicate(); }} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"><Copy className="w-4 h-4"/></button>
           <button type="button" onClick={(e) => { e.stopPropagation(); onRemove(); }} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"><Trash2 className="w-4 h-4"/></button>
           <div className={`p-2 rounded-xl transition-transform ${isExpanded ? 'rotate-180 bg-slate-200 text-slate-700' : 'bg-white text-slate-500 shadow-sm'}`}><ChevronDown className="w-4 h-4"/></div>
        </div>
      </div>
      <AnimatePresence>
        {isExpanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="border-t border-slate-100">
            <div className="p-6 md:p-8 space-y-6">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function PremiumDynamicList({ items = [], onChange, fields, addButtonLabel, emptyMessage }: any) {
  const [expandedIndex, setExpandedIndex] = useState<number>(0);
  
  const handleAdd = () => {
    const newItem: any = {};
    fields.forEach((f: any) => { newItem[f.name] = ""; });
    onChange([...items, newItem]);
    setExpandedIndex(items.length);
  };
  
  const handleRemove = (i: number) => {
    onChange(items.filter((_, idx) => idx !== i));
    if (expandedIndex === i) setExpandedIndex(-1);
  };

  const handleDuplicate = (i: number) => {
    onChange([...items, { ...items[i] }]);
  };
  
  const handleChange = (index: number, field: string, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    onChange(newItems);
  };

  return (
    <div className="w-full">
      {items.length === 0 ? (
        <div className="py-12 border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center text-center bg-slate-50/50 mb-6">
          <p className="text-sm font-bold text-slate-500 mb-4">{emptyMessage}</p>
          <button type="button" onClick={handleAdd} className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold hover:bg-indigo-100 transition-all"><Plus className="w-4 h-4"/> {addButtonLabel}</button>
        </div>
      ) : (
        <div className="mb-6">
          <AnimatePresence>
            {items.map((item: any, i: number) => (
              <PremiumSectionCard 
                key={i} 
                title={item.company || item.institution || item.name || `Entry ${i + 1}`} 
                subtitle={item.title || item.degree || item.technologies || ""}
                isExpanded={expandedIndex === i}
                onToggle={() => setExpandedIndex(expandedIndex === i ? -1 : i)}
                onRemove={() => handleRemove(i)}
                onDuplicate={() => handleDuplicate(i)}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {fields.map((f: any) => {
                    const isFull = f.span === "full";
                    if (f.type === "textarea") {
                      return <div key={f.name} className="col-span-1 md:col-span-2"><SmartTextarea label={f.placeholder} value={item[f.name]} onChange={(e:any) => handleChange(i, f.name, e.target.value)} /></div>
                    }
                    if (f.type === "checkbox") {
                       return <label key={f.name} className="col-span-1 md:col-span-2 flex items-center gap-3 cursor-pointer"><input type="checkbox" checked={item[f.name]} onChange={(e) => handleChange(i, f.name, e.target.checked)} className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"/><span className="text-[13px] font-bold text-slate-700">{f.placeholder}</span></label>
                    }
                    return <div key={f.name} className={isFull ? "col-span-1 md:col-span-2" : "col-span-1"}><Field type={f.type || "text"} label={f.placeholder} value={item[f.name] || ""} onChange={(e) => handleChange(i, f.name, e.target.value)} /></div>
                  })}
                </div>
              </PremiumSectionCard>
            ))}
          </AnimatePresence>
          <button type="button" onClick={handleAdd} className="w-full flex justify-center items-center gap-2 py-4 rounded-2xl border-2 border-dashed border-slate-200 text-slate-500 font-bold text-sm hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50/50 transition-all"><Plus className="w-4 h-4"/> {addButtonLabel}</button>
        </div>
      )}
    </div>
  );
}

/* ── MAIN FORM STEP ────────────────────────────────────────────── */

export function FormStep({ step }: { step: number }) {
  const { register, control, watch } = useFormContext<ResumeFormData>();
  const summary = watch("summary");

  switch (step) {
    case 0:
      return (
        <ResumeFormStep title="Contact Information" stepNumber={1} totalSteps={TOTAL_STEPS}>
          <AnimatedBuilderHero />
          <div className="space-y-6">
            <Field label="Full Name" {...register("full_name")} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Field label="Email Address" type="email" {...register("email")} />
              <Field label="Phone Number" type="tel" {...register("phone")} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Field label="Location" {...register("location")} />
              <Field label="LinkedIn URL" {...register("linkedin_url")} />
            </div>
          </div>
        </ResumeFormStep>
      );

    case 1:
      return (
        <ResumeFormStep title="Professional Summary" description="A brief pitch about your career goals and expertise." stepNumber={2} totalSteps={TOTAL_STEPS}>
          <Controller name="summary" control={control} render={({ field }) => (
            <div>
              <SmartTextarea label="Summary" {...field} />
              <div className="mt-2 flex justify-end"><span className={`text-[10px] font-bold tracking-widest uppercase ${summary?.length > 300 ? 'text-amber-500' : 'text-slate-400'}`}>{summary?.length || 0} Chars</span></div>
            </div>
          )} />
        </ResumeFormStep>
      );

    case 2:
      return (
        <ResumeFormStep title="Education" description="Add your academic background." stepNumber={3} totalSteps={TOTAL_STEPS}>
          <Controller name="education" control={control} render={({ field }) => (
            <PremiumDynamicList
              items={field.value} onChange={field.onChange} addButtonLabel="Add Education" emptyMessage="No education entries yet."
              fields={[
                { name: "institution", placeholder: "College / University", span: "full" },
                { name: "degree", placeholder: "Degree (e.g. B.Tech)" },
                { name: "field_of_study", placeholder: "Field of Study (e.g. Computer Science)" },
                { name: "start_date", placeholder: "Start Date", type: "month" },
                { name: "end_date", placeholder: "End Date", type: "month" },
                { name: "gpa", placeholder: "GPA / Percentage" },
              ]}
            />
          )} />
        </ResumeFormStep>
      );

    case 3:
      return (
        <ResumeFormStep title="Work Experience" description="Highlight your professional roles and impact." stepNumber={4} totalSteps={TOTAL_STEPS}>
          <Controller name="experience" control={control} render={({ field }) => (
            <PremiumDynamicList
              items={field.value} onChange={field.onChange} addButtonLabel="Add Experience" emptyMessage="No work experience yet."
              fields={[
                { name: "company", placeholder: "Company Name", span: "full" },
                { name: "title", placeholder: "Job Title" },
                { name: "is_current", placeholder: "I currently work here", type: "checkbox", span: "full" },
                { name: "start_date", placeholder: "Start Date", type: "month" },
                { name: "end_date", placeholder: "End Date", type: "month" },
                { name: "description", placeholder: "Describe your achievements (bullet points recommended)", type: "textarea", span: "full" },
              ]}
            />
          )} />
        </ResumeFormStep>
      );

    case 4:
      return (
        <ResumeFormStep title="Projects" description="Showcase your key projects and technical contributions." stepNumber={5} totalSteps={TOTAL_STEPS}>
          <Controller name="projects" control={control} render={({ field }) => (
            <PremiumDynamicList
              items={field.value} onChange={field.onChange} addButtonLabel="Add Project" emptyMessage="No projects yet."
              fields={[
                { name: "name", placeholder: "Project Name", span: "full" },
                { name: "technologies", placeholder: "Technologies Used (e.g. React, Next.js, Node)", span: "full" },
                { name: "link", placeholder: "Project Link / GitHub URL", span: "full" },
                { name: "description", placeholder: "What did you build and how?", type: "textarea", span: "full" },
              ]}
            />
          )} />
        </ResumeFormStep>
      );

    case 5:
      return (
        <ResumeFormStep title="Skills" description="Add technical and soft skills." stepNumber={6} totalSteps={TOTAL_STEPS}>
          <Controller name="skills" control={control} render={({ field }) => (
            <TagsInput value={field.value} onChange={field.onChange} label="Skills" placeholder="Type a skill and press Enter" suggestions={["JavaScript", "TypeScript", "React", "Python", "AWS", "SQL", "Docker", "Machine Learning"]} />
          )} />
        </ResumeFormStep>
      );

    case 6:
      return (
        <ResumeFormStep title="Certifications" description="Any relevant industry certifications." stepNumber={7} totalSteps={TOTAL_STEPS}>
          <Controller name="certifications" control={control} render={({ field }) => (
            <TagsInput value={field.value} onChange={field.onChange} label="Certifications" placeholder="Type a certification and press Enter" suggestions={["AWS Certified Solutions Architect", "Google Cloud Professional", "Cisco CCNA"]} />
          )} />
        </ResumeFormStep>
      );

    default:
      return null;
  }
}
