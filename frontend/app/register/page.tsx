"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/hooks/useAuth";
import { parseApiError } from "@/lib/utils";

export default function RegisterPage() {
  const router = useRouter();
  const { register: registerUser } = useAuth();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"student" | "club">("student");
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFeedback(null);
    setSubmitting(true);

    try {
      await registerUser({
        full_name: fullName.trim(),
        email: email.trim(),
        password,
        confirm_password: password,
        role,
      });
      setFeedback("Compte créé avec succès ! Redirection vers la connexion...");
      setTimeout(() => router.push("/login"), 1000);
    } catch (err: any) {
      const msg = parseApiError(err, "Impossible de créer le compte. Veuillez réessayer.").message;
      setFeedback(msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Navbar />

      <div className="form-wrap">
        <div className="form-card">
          <h2>Créer un compte Clubi</h2>
          <p className="subtitle">
            Rejoins la plateforme pour découvrir ce que préparent tes clubs.
          </p>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="role">Type de compte</label>
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value as "student" | "club")}
              >
                <option value="student">🎓 Étudiant</option>
                <option value="club">🏢 Club Universitaire</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="fullName">
                {role === "club" ? "Nom officiel du club" : "Nom et prénom"}
              </label>
              <input
                id="fullName"
                type="text"
                placeholder={role === "club" ? "ex: Club Robotique & IA" : "ex: Sarah Ben Ali"}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Adresse email</label>
              <input
                id="email"
                type="email"
                placeholder="ex: sarah@campus.edu ou contact@club.org"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Mot de passe (8 caractères min.)</label>
              <input
                id="password"
                type="password"
                placeholder="Choisis un mot de passe sécurisé"
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? "Création en cours..." : "Créer mon compte"}
            </button>

            {feedback && (
              <p className={`form-feedback ${feedback.includes("succès") ? "" : "error"}`}>
                {feedback}
              </p>
            )}

            <div className="auth-switch">
              Déjà un compte ?{" "}
              <Link href="/login">Se connecter</Link>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
