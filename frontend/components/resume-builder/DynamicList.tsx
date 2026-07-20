"use client";

import React from "react";
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

      {items.map((item, idx) => (
        <div
          key={idx}
          className="relative rounded-lg border border-gray-200 bg-gray-50 p-4"
        >
          <button
            type="button"
            onClick={() => remove(idx)}
            className="absolute right-3 top-3 text-gray-400 hover:text-red-500"
            aria-label={`Remove entry ${idx + 1}`}
          >
            &times;
          </button>

          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
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
        </div>
      ))}

      <button
        type="button"
        onClick={add}
        className="w-full rounded-lg border-2 border-dashed border-gray-300 py-2 text-sm font-medium text-blue-600 transition hover:border-blue-400 hover:bg-blue-50"
      >
        + {addButtonLabel}
      </button>
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
      <label className="flex items-center gap-2 text-sm text-gray-700">
        <input
          type="checkbox"
          checked={(value as boolean) ?? false}
          onChange={(e) => onChange(e.target.checked)}
          className="rounded border-gray-300"
        />
        {field.placeholder}
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
    "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200";

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
      <div>
        <label className="mb-1 block text-xs text-gray-500">
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
