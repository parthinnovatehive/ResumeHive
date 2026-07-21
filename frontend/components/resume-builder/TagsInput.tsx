"use client";

import React, { useState } from "react";

interface TagsInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  suggestions?: string[];
  label?: string;
}

export function TagsInput({
  value,
  onChange,
  placeholder = "Type and press Enter",
  suggestions = [],
  label,
}: TagsInputProps) {
  const [input, setInput] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  const filtered = suggestions.filter(
    (s) =>
      s.toLowerCase().includes(input.toLowerCase()) && !value.includes(s),
  );

  const addTag = (tag: string) => {
    const trimmed = tag.trim();
    if (trimmed && !value.includes(trimmed)) {
      onChange([...value, trimmed]);
    }
    setInput("");
    setShowSuggestions(false);
  };

  const removeTag = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag(input);
    } else if (e.key === "Backspace" && input === "" && value.length > 0) {
      removeTag(value.length - 1);
    }
  };

  return (
    <div className="relative group">
      {label && (
        <label className="mb-1.5 block text-sm font-semibold tracking-wide text-slate-700 transition-colors group-focus-within:text-premium-blue">
          {label}
        </label>
      )}
      <div className="flex flex-wrap gap-2.5 rounded-xl bg-white/50 backdrop-blur-md px-4 py-3 border border-slate-200/60 shadow-sm transition-all duration-300 focus-within:bg-white focus-within:border-premium-blue/40 focus-within:ring-4 focus-within:ring-premium-blue/10 hover:border-slate-300">
        {value.map((tag, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-1.5 rounded-lg bg-premium-blueLight/50 px-3 py-1.5 text-sm font-medium text-premium-blue shadow-sm border border-premium-blue/10"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(i)}
              className="ml-1 rounded-full p-0.5 hover:bg-premium-blue/10 transition-colors"
              aria-label={`Remove ${tag}`}
            >
              &times;
            </button>
          </span>
        ))}
        <input
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setShowSuggestions(e.target.value.length > 0);
          }}
          onFocus={() => input.length > 0 && setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
          onKeyDown={handleKeyDown}
          placeholder={value.length === 0 ? placeholder : ""}
          className="min-w-[140px] flex-1 bg-transparent text-sm outline-none text-slate-900 placeholder:text-slate-400"
          aria-label={label || "Add tag"}
        />
      </div>
      {showSuggestions && filtered.length > 0 && (
        <ul className="absolute z-50 w-full mt-2 max-h-48 overflow-y-auto rounded-xl border border-white/60 bg-white/80 backdrop-blur-xl shadow-premium">
          {filtered.slice(0, 8).map((s) => (
            <li key={s}>
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  addTag(s);
                }}
                className="w-full px-4 py-2.5 text-left text-sm font-medium text-slate-700 hover:bg-premium-blueLight/30 hover:text-premium-blue transition-colors"
              >
                {s}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
