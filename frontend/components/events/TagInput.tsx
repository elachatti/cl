"use client";

import { useState, type KeyboardEvent } from "react";

import { cn } from "@/lib/utils";

interface TagInputProps {
  label: string;
  value: string[];
  onChange: (tags: string[]) => void;
  error?: string;
  maxTags?: number;
  placeholder?: string;
}

/** A simple chip-style multi-select: type a tag and press Enter or comma to add it. */
export default function TagInput({
  label,
  value,
  onChange,
  error,
  maxTags = 8,
  placeholder = "Add a tag and press Enter",
}: TagInputProps) {
  const [draft, setDraft] = useState("");

  function addTag(raw: string) {
    const tag = raw.trim();
    if (!tag) return;
    if (value.length >= maxTags) return;
    if (value.some((existing) => existing.toLowerCase() === tag.toLowerCase())) {
      setDraft("");
      return;
    }
    onChange([...value, tag]);
    setDraft("");
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      addTag(draft);
    } else if (event.key === "Backspace" && draft === "" && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  }

  function removeTag(tag: string) {
    onChange(value.filter((existing) => existing !== tag));
  }

  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-ink-800 dark:text-ink-100">{label}</label>
      <div
        className={cn(
          "flex min-h-11 flex-wrap items-center gap-2 rounded-lg border bg-white px-3 py-2 transition-colors focus-within:ring-2",
          error
            ? "border-red-500 focus-within:ring-red-500/30"
            : "border-ink-200 focus-within:border-cobalt-500 focus-within:ring-cobalt-500/25 dark:border-ink-700",
          "dark:bg-ink-900",
        )}
      >
        {value.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1.5 rounded-full bg-cobalt-50 px-2.5 py-1 text-sm font-medium text-cobalt-700 dark:bg-cobalt-400/15 dark:text-cobalt-200"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              aria-label={`Remove tag ${tag}`}
              className="rounded-full text-cobalt-500 hover:text-cobalt-800 dark:hover:text-cobalt-50"
            >
              ×
            </button>
          </span>
        ))}
        {value.length < maxTags && (
          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={() => addTag(draft)}
            placeholder={value.length === 0 ? placeholder : ""}
            className="min-w-[8rem] flex-1 border-none bg-transparent text-[15px] text-ink-900 outline-none placeholder:text-ink-400 dark:text-ink-50 dark:placeholder:text-ink-500"
          />
        )}
      </div>
      {error ? (
        <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">{error}</p>
      ) : (
        <p className="mt-1.5 text-sm text-ink-500 dark:text-ink-400">
          Up to {maxTags} tags. Press Enter or comma to add.
        </p>
      )}
    </div>
  );
}
