"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BulletFeedback } from "./BulletFeedback";

interface FieldConfig {
  name: string;
  placeholder: string;
  type?: "text" | "textarea" | "month" | "checkbox";
  span?: "full" | "half";
  /** Show debounced per-bullet quality feedback under this textarea. */
  bulletFeedback?: boolean;
}

interface DynamicListProps<T extends Record<string, unknown>> {
  items: T[];
  onChange: (items: T[]) => void;
  fields: FieldConfig[];
  emptyMessage?: string;
  addButtonLabel?: string;
}

export function DynamicList<T extends Record<string, unknown>>({
  items,
  onChange,
  fields,
  emptyMessage = "No entries yet.",
  addButtonLabel = "Add entry",
}: DynamicListProps<T>) {
  const add = () => {
    const blank = Object.fromEntries(
      fields.map((f) => [f.name, f.type === "checkbox" ? false : ""]),
    ) as T;
    onChange([...items, blank]);
  };

  const remove = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  const update = (index: number, key: string, value: unknown) => {
    const copy = items.map((item, i) =>
      i === index ? { ...item, [key]: value } : item,
    );
    onChange(copy);
  };

  const halfFields = fields.filter((f) => f.span !== "full");
  const fullFields = fields.filter((f) => f.span === "full");

  return (
    <div className="space-y-4">
      {items.length === 0 && (
        <p className="text-sm italic text-gray-400">{emptyMessage}</p>
      )}

      <AnimatePresence mode="popLayout">
        {items.map((item, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 15, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="relative rounded-2xl border border-slate-200/60 bg-white/50 backdrop-blur-md p-6 shadow-sm hover:shadow-md transition-shadow group"
          >
          <button
            type="button"
            onClick={() => remove(idx)}
            className="absolute right-4 top-4 rounded-full p-1.5 text-slate-400 hover:bg-premium-red/10 hover:text-premium-red opacity-0 group-hover:opacity-100 transition-all duration-200"
            aria-label={`Remove entry ${idx + 1}`}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>

          <p className="mb-4 text-xs font-bold uppercase tracking-widest text-premium-blue">
            Entry {idx + 1}
          </p>

          {fullFields.map((f) => (
            <div key={f.name} className="mb-3">
              {renderField(f, (item[f.name] as string) ?? "", (val) =>
                update(idx, f.name, val),
              )}
            </div>
          ))}

          <div className="grid grid-cols-2 gap-3">
            {halfFields.map((f) => (
              <HalfField
                key={f.name}
                field={f}
                value={item[f.name]}
                onChange={(val) => update(idx, f.name, val)}
              />
            ))}
          </div>
          </motion.div>
        ))}
      </AnimatePresence>

      <motion.button
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.98 }}
        type="button"
        onClick={add}
        className="w-full rounded-2xl border-2 border-dashed border-premium-blue/30 bg-premium-blueLight/10 py-3.5 text-sm font-bold tracking-wide text-premium-blue transition-all hover:border-premium-blue/60 hover:bg-premium-blueLight/30 hover:shadow-sm"
      >
        + {addButtonLabel}
      </motion.button>
    </div>
  );
}

/* ── Handles the half-width field logic (checkbox vs text) ────── */

function HalfField({
  field,
  value,
  onChange,
}: {
  field: FieldConfig;
  value: unknown;
  onChange: (val: string | boolean) => void;
}) {
  if (field.type === "checkbox") {
    return (
      <label className="flex items-center gap-2.5 text-sm font-medium text-slate-700 cursor-pointer group pt-6">
        <div className="relative flex items-center justify-center">
          <input
            type="checkbox"
            checked={(value as boolean) ?? false}
            onChange={(e) => onChange(e.target.checked)}
            className="peer h-5 w-5 appearance-none rounded-md border-2 border-slate-300 bg-white/50 transition-all checked:border-premium-blue checked:bg-premium-blue hover:border-premium-blue/50 focus:outline-none focus:ring-4 focus:ring-premium-blue/20"
          />
          <svg className="absolute w-3 h-3 text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" viewBox="0 0 14 10" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="1.5 5 5 8.5 12.5 1"/></svg>
        </div>
        <span className="group-hover:text-premium-blue transition-colors">{field.placeholder}</span>
      </label>
    );
  }

  return (
    <div>
      {renderField(
        field,
        (value as string) ?? "",
        onChange as (val: string) => void,
      )}
    </div>
  );
}

/* ── Renders a single text / textarea / month field ───────────── */

function renderField(
  f: FieldConfig,
  value: string,
  onChange: (val: string) => void,
) {
  const base =
    "w-full rounded-xl bg-white/60 backdrop-blur-md px-4 py-3 text-sm outline-none border border-slate-200/80 shadow-sm transition-all duration-300 focus:bg-white focus:border-premium-blue/40 focus:ring-4 focus:ring-premium-blue/10 hover:border-slate-300 text-slate-900 placeholder:text-slate-400";

  if (f.type === "textarea") {
    return (
      <div>
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={f.placeholder}
          rows={3}
          className={base}
          aria-label={f.placeholder}
        />
        {f.bulletFeedback && <BulletFeedback text={value} />}
      </div>
    );
  }

  if (f.type === "month") {
    return (
      <div className="relative group">
        <label className="mb-1.5 block text-xs font-semibold tracking-wide text-slate-500 transition-colors group-focus-within:text-premium-blue">
          {f.placeholder}
        </label>
        <input
          type="month"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={base}
          aria-label={f.placeholder}
        />
      </div>
    );
  }

  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={f.placeholder}
      className={base}
      aria-label={f.placeholder}
    />
  );
}
