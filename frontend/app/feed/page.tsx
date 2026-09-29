"use client";

import { useEffect, useMemo, useState } from "react";
import Navbar from "@/components/Navbar";
import TagFilters from "@/components/TagFilters";
import EventCard from "@/components/EventCard";
import { fetchEvents } from "@/lib/api";
import { TAG_META, USER_INTERESTS } from "@/lib/data";

export default function Feed() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTags, setActiveTags] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchEvents().then((data) => {
      setEvents(data);
      setLoading(false);
    });
  }, []);

  function toggleTag(key: string) {
    setActiveTags((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  }

  function score(event: any) {
    return (event.tags || []).reduce(
      (s: number, t: string) => s + (USER_INTERESTS.includes(t.toLowerCase()) ? 2 : 0),
      0
    );
  }

  const filtered = useMemo(() => {
    return events
      .filter((e) => activeTags.size === 0 || (e.tags || []).some((t: string) => activeTags.has(t.toLowerCase())))
      .filter((e) => {
        if (!search.trim()) return true;
        const haystack = `${e.title || ""} ${e.club || ""} ${e.desc || ""} ${(e.tags || [])
          .map((t: string) => TAG_META[t.toLowerCase()]?.label ?? t)
          .join(" ")}`.toLowerCase();
        return haystack.includes(search.trim().toLowerCase());
      })
      .sort((a, b) => score(b) - score(a));
  }, [events, activeTags, search]);

  return (
    <>
      <Navbar />

      <div className="page-intro">
        <h1>Le panneau</h1>
        <p className="subtitle">Ce que tes clubs préparent, trié pour toi</p>
      </div>

      <main>
        <div className="search-bar">
          <input
            type="text"
            placeholder="Rechercher un événement, un tag..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <TagFilters
          activeTags={activeTags}
          onToggle={toggleTag}
          onClear={() => setActiveTags(new Set())}
        />

        <p className="result-count">
          {loading
            ? "Chargement..."
            : `${filtered.length} événement${filtered.length > 1 ? "s" : ""} à découvrir`}
        </p>

        {!loading && filtered.length === 0 && (
          <p className="empty-state">Rien par ici pour ces filtres. Essaie d&apos;en retirer un.</p>
        )}

        <section className="board">
          {filtered.map((event, i) => (
            <EventCard key={event.id || i} event={event} index={i} />
          ))}
        </section>
      </main>
    </>
  );
}
