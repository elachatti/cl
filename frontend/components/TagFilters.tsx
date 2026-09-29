"use client";

import { TAG_META, CATEGORY_COLOR } from "@/lib/data";

interface TagFiltersProps {
  activeTags: Set<string>;
  onToggle: (key: string) => void;
  onClear: () => void;
}

export default function TagFilters({ activeTags, onToggle, onClear }: TagFiltersProps) {
  return (
    <nav className="tag-filters" aria-label="Filtrer par sujet">
      <button
        type="button"
        className={`tag-pill ${activeTags.size === 0 ? "active" : ""}`}
        onClick={onClear}
      >
        Tous
      </button>
      {Object.entries(TAG_META).map(([key, meta]) => (
        <button
          type="button"
          key={key}
          className={`tag-pill ${activeTags.has(key) ? "active" : ""}`}
          style={{ "--pill-color": CATEGORY_COLOR[meta.category] } as React.CSSProperties}
          onClick={() => onToggle(key)}
        >
          {meta.label}
        </button>
      ))}
    </nav>
  );
}
