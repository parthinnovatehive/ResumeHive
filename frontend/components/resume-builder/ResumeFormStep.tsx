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
    <section aria-labelledby={`step-${stepNumber}`} className="space-y-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
          Step {stepNumber} of {totalSteps}
        </p>
        <h2
          id={`step-${stepNumber}`}
          className="mt-1 text-xl font-bold text-gray-900"
        >
          {title}
        </h2>
        {description && (
          <p className="mt-1 text-sm text-gray-500">{description}</p>
        )}
      </div>
      <div>{children}</div>
    </section>
  );
}
