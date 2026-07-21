"use client";

import React from "react";
import { motion } from "framer-motion";
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
          <motion.button
            whileHover={{ y: -6, scale: 1.03 }}
            whileTap={{ scale: 0.95 }}
            key={key}
            onClick={() => onChange(key)}
            className={`group relative flex flex-col items-center rounded-2xl border p-4 transition-all duration-400 ${
              isActive
                ? "border-premium-blue/0 shadow-[0_8px_30px_rgba(37,99,235,0.12)]"
                : "border-slate-200/50 bg-white/40 hover:border-premium-blue/20 hover:bg-white/80 hover:shadow-lg"
            }`}
          >
            {/* Active Glow & Gradient Ring Effect */}
            {isActive && (
              <>
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-premium-blue to-premium-purple p-[2px]">
                  <div className="h-full w-full rounded-[14px] bg-white/90 backdrop-blur-md" />
                </div>
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-premium-blue/10 to-premium-purple/10 opacity-60" />
              </>
            )}
            
            {/* Mini preview thumbnail — all layouts are single-column (ATS-safe) */}
            <div className="relative z-10 mb-2.5 h-[84px] w-[60px] overflow-hidden rounded-md border border-slate-200/80 bg-white p-1.5 shadow-sm transition-transform duration-300 group-hover:shadow-md">
              <TemplateThumb template={key} />
            </div>
            <span
              className={`relative z-10 text-xs font-bold tracking-wide transition-colors ${
                isActive ? "text-premium-blue drop-shadow-sm" : "text-slate-600 group-hover:text-slate-900"
              }`}
            >
              {cfg.label}
            </span>
            <span className="relative z-10 mt-1 max-w-[80px] text-center text-[10px] leading-tight font-medium text-slate-400">
              {cfg.description}
            </span>
          </motion.button>
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
