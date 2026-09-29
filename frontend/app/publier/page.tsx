"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { createEvent } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";

const EMPTY_FORM = {
  title: "",
  date: "",
  location: "",
  tags: "",
  audience: "tous",
  desc: "",
};

export default function Publier() {
  const router = useRouter();
  const { user } = useAuth();
  const [form, setForm] = useState(EMPTY_FORM);
  const [feedback, setFeedback] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function update(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setFeedback("");

    const payload = {
      club: user?.full_name || "Ton club",
      title: form.title.trim(),
      date: form.date,
      location: form.location.trim(),
      tags: form.tags
        .split(",")
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean),
      audience: form.audience,
      desc: form.desc.trim(),
    };

    try {
      await createEvent(payload);
      setFeedback("Événement publié ! Redirection vers le fil...");
      setForm(EMPTY_FORM);
      setTimeout(() => router.push("/feed"), 900);
    } catch (err: any) {
      setFeedback("Erreur lors de la publication : " + (err.message || "Vérifiez la connexion au backend."));
      console.warn(err);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Navbar />

      <div className="form-wrap">
        <div className="form-card">
          <h2>Épingler un nouvel événement</h2>
          <p className="subtitle">Remplis les informations ci-dessous pour informer les étudiants</p>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="title">Titre de l&apos;événement</label>
              <input
                id="title"
                type="text"
                placeholder="ex: Atelier AgentAI & Python"
                value={form.title}
                onChange={(e) => update("title", e.target.value)}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="date">Date &amp; Heure</label>
                <input
                  id="date"
                  type="datetime-local"
                  value={form.date}
                  onChange={(e) => update("date", e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="location">Lieu / Salle</label>
                <input
                  id="location"
                  type="text"
                  placeholder="ex: Labo 101, Bloc B"
                  value={form.location}
                  onChange={(e) => update("location", e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="tags">Tags (séparés par des virgules)</label>
                <input
                  id="tags"
                  type="text"
                  placeholder="ia, web, cyber"
                  value={form.tags}
                  onChange={(e) => update("tags", e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="audience">Public cible</label>
                <select
                  id="audience"
                  value={form.audience}
                  onChange={(e) => update("audience", e.target.value)}
                >
                  <option value="tous">Tous les étudiants</option>
                  <option value="membres_club">Membres du club uniquement</option>
                  <option value="faculte">Étudiants de la faculté</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="image">Image de couverture (optionnel)</label>
              <input id="image" type="file" accept="image/*" />
            </div>

            <div className="form-group">
              <label htmlFor="description">Description complète</label>
              <textarea
                id="description"
                rows={5}
                placeholder="Décrivez le programme, les prérequis, et les objectifs de l'événement..."
                value={form.desc}
                onChange={(e) => update("desc", e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn-primary" disabled={submitting}>
              📌 {submitting ? "Publication..." : "Publier l'événement"}
            </button>
            {feedback && <p className="form-feedback">{feedback}</p>}
          </form>
        </div>
      </div>
    </>
  );
}
