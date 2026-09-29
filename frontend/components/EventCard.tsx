"use client";

import { useState } from "react";
import { TAG_META, tagAccent } from "@/lib/data";
import { postInteraction } from "@/lib/api";

interface EventCardProps {
  event: any;
  index: number;
}

export default function EventCard({ event, index }: EventCardProps) {
  const [interested, setInterested] = useState(event.user_interested || false);
  const [going, setGoing] = useState(event.user_going || false);
  const [shared, setShared] = useState(false);

  const firstTag = event.tags && event.tags.length > 0 ? event.tags[0] : "";
  const tagKey = typeof firstTag === "string" ? firstTag : (firstTag?.slug || firstTag?.key || "");
  const accent = tagAccent(tagKey);

  const tilt = `${(index % 2 === 0 ? -1 : 1) * (0.6 + (index % 3) * 0.4)}deg`;

  function handleInteract(type: "interested" | "going") {
    if (type === "interested") setInterested((v: boolean) => !v);
    if (type === "going") setGoing((v: boolean) => !v);
    postInteraction(event.id, type);
  }

  function handleShare() {
    if (typeof window !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
    }
    setShared(true);
    setTimeout(() => setShared(false), 1200);
  }

  const desc = event.desc || event.description || "";
  const interestedTotal = (event.interested || 0) + (interested ? 1 : 0);
  const goingTotal = (event.going || 0) + (going ? 1 : 0);

  return (
    <article
      className="event-card"
      style={{ "--accent": accent, "--tilt": tilt } as React.CSSProperties}
    >
      <div className="card-club">
        <span>{event.club || "Club"}</span>
        <span className="date">{event.date}</span>
      </div>
      <h3 className="card-title">{event.title}</h3>
      <p className="card-desc">{desc}</p>
      <div className="card-meta">📍 {event.location}</div>
      <div className="card-tags">
        {event.tags &&
          event.tags.map((t: any) => {
            const k = typeof t === "string" ? t : (t.slug || t.key || t.name);
            const label = TAG_META[k?.toLowerCase()]?.label ?? k;
            return <span key={k}>{label}</span>;
          })}
      </div>
      <div className="card-actions">
        <button
          type="button"
          className={interested ? "liked" : ""}
          onClick={() => handleInteract("interested")}
        >
          ★ Intéressé ({interestedTotal})
        </button>
        <button
          type="button"
          className={`primary ${going ? "liked" : ""}`}
          onClick={() => handleInteract("going")}
        >
          Je participe ({goingTotal})
        </button>
        <button type="button" onClick={handleShare} title="Partager">
          {shared ? "✓" : "↗"}
        </button>
      </div>
    </article>
  );
}
