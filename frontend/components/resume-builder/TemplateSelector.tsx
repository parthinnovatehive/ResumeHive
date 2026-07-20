"use client";

import React from "react";
import type { TemplateName } from "@/types/resume";
import { TEMPLATE_CONFIG, TEMPLATE_NAMES } from "@/types/resume";

interface Props {
  selected: TemplateName;
  onChange: (t: TemplateName) => void;
}

export function TemplateSelector({ selected, onChange }: Props) {
  return (
    <div className="flex flex-wrap gap-3">
      {TEMPLATE_NAMES.map((key) => {
        const cfg = TEMPLATE_CONFIG[key];
        const isActive = selected === key;
        return (
          <button
            key={key}
            onClick={() => onChange(key)}
            className={`group flex flex-col items-center rounded-lg border-2 p-2 transition ${
              isActive
                ? "border-blue-600 bg-blue-50 shadow-sm"
                : "border-gray-200 hover:border-gray-400 hover:bg-gray-50"
            }`}
          >
            {/* Mini preview thumbnail — all layouts are single-column (ATS-safe) */}
            <div className="mb-1.5 h-[80px] w-[56px] overflow-hidden rounded border border-gray-100 bg-white p-1 shadow-inner">
              <TemplateThumb template={key} />
            </div>
            <span
              className={`text-xs font-medium ${
                isActive ? "text-blue-700" : "text-gray-700"
              }`}
            >
              {cfg.label}
            </span>
            <span className="mt-0.5 max-w-[80px] text-center text-[10px] leading-tight text-gray-400">
              {cfg.description}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/* ── Tiny single-column thumbnails, styled per template ──────────── */

function TemplateThumb({ template }: { template: TemplateName }) {
  switch (template) {
    case "modern":
      return (
        <div className="flex h-full flex-col">
          <div className="mb-0.5 h-[3px] w-[60%] rounded bg-gray-800" />
          <div className="mb-1 h-[2px] w-[30%] rounded bg-blue-500" />
          <div className="mb-0.5 h-[2px] w-[40%] rounded bg-blue-400" />
          <div className="mb-0.5 h-[1px] w-full bg-blue-100" />
          <div className="mb-0.5 h-[2px] w-[70%] rounded bg-gray-400" />
          <div className="mb-1 h-[2px] w-[50%] rounded bg-gray-300" />
          <div className="mb-0.5 h-[2px] w-[35%] rounded bg-blue-400" />
          <div className="mb-0.5 h-[1px] w-full bg-blue-100" />
          <div className="h-[2px] w-[60%] rounded bg-gray-400" />
        </div>
      );
    case "minimal":
      return (
        <div className="flex h-full flex-col font-serif">
          <div className="mb-0.5 h-[3px] w-[50%] rounded bg-gray-700" />
          <div className="mb-1 h-[2px] w-[70%] rounded bg-gray-300" />
          <div className="mt-1 h-[1.5px] w-[30%] rounded bg-gray-400" />
          <div className="mb-0.5 h-[2px] w-[60%] rounded bg-gray-400" />
          <div className="h-[2px] w-[45%] rounded bg-gray-300" />
          <div className="mt-1 h-[1.5px] w-[25%] rounded bg-gray-400" />
          <div className="h-[2px] w-[55%] rounded bg-gray-400" />
        </div>
      );
    case "professional":
      return (
        <div className="flex h-full flex-col">
          <div className="mb-0.5 h-[3px] w-[55%] rounded bg-[#1e3a5f]" />
          <div className="mb-1 h-[2px] w-full rounded bg-[#1e3a5f]" />
          <div className="mb-0.5 h-[2px] w-[35%] rounded bg-[#1e3a5f]" />
          <div className="mb-0.5 h-[2px] w-[70%] rounded bg-gray-400" />
          <div className="mb-1 h-[2px] w-[50%] rounded bg-gray-300" />
          <div className="mb-0.5 h-[2px] w-[30%] rounded bg-[#1e3a5f]" />
          <div className="h-[2px] w-[60%] rounded bg-gray-400" />
        </div>
      );
    case "compact":
      return (
        <div className="flex h-full flex-col">
          <div className="mb-0.5 h-[2.5px] w-[50%] rounded bg-gray-800" />
          <div className="mb-0.5 h-[1px] w-full bg-gray-700" />
          <div className="mb-0.5 h-[2px] w-[40%] rounded bg-gray-200" />
          <div className="mb-0.5 h-[1.5px] w-[75%] rounded bg-gray-400" />
          <div className="mb-0.5 h-[1.5px] w-[65%] rounded bg-gray-300" />
          <div className="mb-0.5 h-[2px] w-[35%] rounded bg-gray-200" />
          <div className="mb-0.5 h-[1.5px] w-[70%] rounded bg-gray-400" />
          <div className="mb-0.5 h-[1.5px] w-[55%] rounded bg-gray-300" />
          <div className="h-[1.5px] w-[60%] rounded bg-gray-400" />
        </div>
      );
    default: // classic
      return (
        <div className="flex h-full flex-col">
          <div className="mb-0.5 h-[3px] w-[60%] rounded bg-gray-800" />
          <div className="mb-0.5 h-[2px] w-[80%] rounded bg-gray-300" />
          <div className="mb-0.5 mt-1 h-[2px] w-[40%] rounded bg-gray-500" />
          <div className="mb-0.5 h-[1px] w-full bg-gray-200" />
          <div className="mb-0.5 h-[2px] w-[70%] rounded bg-gray-400" />
          <div className="mb-0.5 h-[2px] w-[50%] rounded bg-gray-300" />
          <div className="mt-1 h-[2px] w-[35%] rounded bg-gray-500" />
          <div className="mb-0.5 h-[1px] w-full bg-gray-200" />
          <div className="h-[2px] w-[60%] rounded bg-gray-400" />
        </div>
      );
  }
}
