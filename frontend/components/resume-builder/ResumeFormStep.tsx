import React from "react";

interface ResumeFormStepProps {
  title: string;
  description?: string;
  stepNumber: number;
  totalSteps: number;
  children: React.ReactNode;
}

export function ResumeFormStep({
  title,
  description,
  stepNumber,
  totalSteps,
  children,
}: ResumeFormStepProps) {
  return (
    <section aria-labelledby={`step-${stepNumber}`} className="space-y-8">
      <div className="relative">
        {/* Soft glowing orb behind the title */}
        <div className="absolute -inset-x-4 -inset-y-4 z-[-1] bg-gradient-to-r from-premium-blue/10 to-premium-purple/10 blur-xl opacity-60 rounded-full" />
        
        <div className="flex items-center gap-4 mb-4">
          <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-slate-500">
            Step {stepNumber}
          </p>
          <div className="flex-1 h-[2px] bg-slate-100 rounded-full overflow-hidden flex items-center">
            <div 
              className="h-full bg-gradient-to-r from-premium-blue to-premium-purple rounded-full transition-all duration-700 ease-out" 
              style={{ width: `${(stepNumber / totalSteps) * 100}%` }} 
            />
          </div>
          <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-slate-400">
            Of {totalSteps}
          </p>
        </div>
        <h2
          id={`step-${stepNumber}`}
          className="text-3xl font-extrabold tracking-tight text-slate-900 drop-shadow-sm"
        >
          {title}
        </h2>
        {description && (
          <p className="mt-2 text-base text-slate-500 font-medium">{description}</p>
        )}
      </div>
      <div className="space-y-6 relative z-10">{children}</div>
    </section>
  );
}
