"use client";

import { useEffect, useState } from "react";

import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import { SORT_OPTIONS, TARGET_AUDIENCE_OPTIONS } from "@/types/event";
import type { EventSort, TargetAudience } from "@/types/event";

export interface EventFilterState {
  search: string;
  tags: string[];
  target: TargetAudience | "";
  upcoming: boolean;
  sort: EventSort;
}

interface EventFiltersProps {
  value: EventFilterState;
  onChange: (next: EventFilterState) => void;
}

export default function EventFilters({ value, onChange }: EventFiltersProps) {
  const [searchDraft, setSearchDraft] = useState(value.search);
  const [tagsDraft, setTagsDraft] = useState(value.tags.join(", "));

  // Keep local drafts in sync when filters change from outside (e.g. browser back/forward).
  useEffect(() => setSearchDraft(value.search), [value.search]);
  useEffect(() => setTagsDraft(value.tags.join(", ")), [value.tags]);

  // Debounce free-text inputs so the API isn't queried on every keystroke.
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (searchDraft !== value.search) onChange({ ...value, search: searchDraft });
    }, 400);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchDraft]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      const nextTags = tagsDraft
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      if (nextTags.join(",") !== value.tags.join(",")) onChange({ ...value, tags: nextTags });
    }, 400);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tagsDraft]);

  return (
    <div className="grid gap-4 rounded-2xl border border-ink-200 bg-white p-5 dark:border-ink-800 dark:bg-ink-900 sm:grid-cols-2 lg:grid-cols-5">
      <div className="sm:col-span-2 lg:col-span-2">
        <Input
          label="Search"
          placeholder="Search by title"
          value={searchDraft}
          onChange={(e) => setSearchDraft(e.target.value)}
        />
      </div>

      <Input
        label="Tags"
        placeholder="AI, Robotics"
        value={tagsDraft}
        onChange={(e) => setTagsDraft(e.target.value)}
        hint="Comma-separated"
      />

      <Select
        label="Audience"
        value={value.target}
        onChange={(e) => onChange({ ...value, target: e.target.value as TargetAudience | "" })}
      >
        <option value="">Any audience</option>
        {TARGET_AUDIENCE_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Select>

      <Select label="Sort by" value={value.sort} onChange={(e) => onChange({ ...value, sort: e.target.value as EventSort })}>
        {SORT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Select>

      <label className="flex items-center gap-2.5 self-end pb-2.5 text-sm text-ink-700 dark:text-ink-200 sm:col-span-2 lg:col-span-5">
        <input
          type="checkbox"
          checked={value.upcoming}
          onChange={(e) => onChange({ ...value, upcoming: e.target.checked })}
          className="h-4 w-4 rounded border-ink-300 text-cobalt-600 focus:ring-cobalt-500 dark:border-ink-600 dark:bg-ink-900"
        />
        Upcoming events only
      </label>
    </div>
  );
}
