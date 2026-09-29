"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/hooks/useAuth";
import { parseApiError } from "@/lib/utils";

export default function LoginPage() {
  const router = useRouter();
  const { user, login, logout } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFeedback(null);
    setSubmitting(true);

    try {
      await login({ email: email.trim(), password, remember_me: true });
      router.push("/feed");
    } catch (err: any) {
      const msg = parseApiError(err, "Identifiants invalides. Veuillez vérifier votre adresse email et mot de passe.").message;
      setFeedback(msg);
    } finally {
      setSubmitting(false);
    }
  }

  function setDemoAccount(userEmail: string, userPass: string) {
    setEmail(userEmail);
    setPassword(userPass);
    setFeedback(null);
  }

  async function handleLogout() {
    try {
      await logout();
      setFeedback("Vous avez été déconnecté.");
    } catch (err) {
      console.warn("Logout error:", err);
    }
  }

  return (
    <>
      <Navbar />

      <div className="form-wrap">
        <div className="form-card">
          <h2>Connexion à Clubi</h2>
          <p className="subtitle">
            Connecte-toi avec ton compte étudiant ou club pour interagir et publier sur le panneau.
          </p>

          {user && (
            <div
              style={{
                background: "var(--cork-dark)",
                color: "var(--note)",
                borderRadius: "var(--radius)",
                padding: "14px 18px",
                marginBottom: "24px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "14px",
                flexWrap: "wrap",
                boxShadow: "inset 0 1px 3px rgba(0,0,0,0.2)",
              }}
            >
              <div>
                <div style={{ fontSize: "0.82rem", opacity: 0.9 }}>Actuellement connecté :</div>
                <div style={{ fontWeight: 700, fontSize: "1rem" }}>{user.full_name}</div>
                <div style={{ fontSize: "0.78rem", opacity: 0.85 }}>
                  {user.email} · Rôle : <span style={{ textTransform: "capitalize" }}>{user.role}</span>
                </div>
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  type="button"
                  onClick={() => router.push("/feed")}
                  style={{
                    background: "var(--ink)",
                    color: "var(--note)",
                    border: "none",
                    padding: "7px 14px",
                    borderRadius: "999px",
                    cursor: "pointer",
                    fontWeight: 600,
                    fontSize: "0.82rem",
                  }}
                >
                  📰 Voir Le panneau
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  style={{
                    background: "#fff",
                    color: "var(--ink)",
                    border: "1px solid var(--ink)",
                    padding: "7px 14px",
                    borderRadius: "999px",
                    cursor: "pointer",
                    fontWeight: 600,
                    fontSize: "0.82rem",
                  }}
                >
                  Se déconnecter
                </button>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Adresse email universitaire</label>
              <input
                id="email"
                type="email"
                placeholder="ex: etudiant@campus.edu ou demo@clubi.app"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Mot de passe</label>
              <input
                id="password"
                type="password"
                placeholder="Ton mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn-primary" disabled={submitting}>
              📌 {submitting ? "Connexion en cours..." : "Se connecter"}
            </button>

            {feedback && (
              <p
                className={`form-feedback ${
                  feedback.includes("déconnecté") ? "" : "error"
                }`}
              >
                {feedback}
              </p>
            )}

            <div className="auth-switch">
              Pas encore de compte ?{" "}
              <Link href="/register">Créer un compte</Link>
            </div>

            <div
              style={{
                marginTop: "24px",
                paddingTop: "18px",
                borderTop: "1px dashed #00000022",
                fontSize: "0.82rem",
                color: "var(--ink-soft)",
              }}
            >
              <p style={{ margin: "0 0 10px", fontWeight: "bold" }}>
                Remplir en 1 clic avec un compte de test :
              </p>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                <button
                  type="button"
                  onClick={() => setDemoAccount("demo@clubi.app", "club123456")}
                  style={{
                    padding: "6px 12px",
                    background: "#0000000d",
                    border: "1.5px solid var(--ink-soft)",
                    borderRadius: "999px",
                    cursor: "pointer",
                    fontSize: "0.78rem",
                    fontWeight: 600,
                    color: "var(--ink)",
                  }}
                >
                  🏢 Club Démo
                </button>
                <button
                  type="button"
                  onClick={() => setDemoAccount("etudiant.demo@clubi.app", "student123456")}
                  style={{
                    padding: "6px 12px",
                    background: "#0000000d",
                    border: "1.5px solid var(--ink-soft)",
                    borderRadius: "999px",
                    cursor: "pointer",
                    fontSize: "0.78rem",
                    fontWeight: 600,
                    color: "var(--ink)",
                  }}
                >
                  🎓 Étudiant Démo
                </button>
                <button
                  type="button"
                  onClick={() => setDemoAccount("admin@example.com", "ChangeMe123")}
                  style={{
                    padding: "6px 12px",
                    background: "#0000000d",
                    border: "1.5px solid var(--ink-soft)",
                    borderRadius: "999px",
                    cursor: "pointer",
                    fontSize: "0.78rem",
                    fontWeight: 600,
                    color: "var(--ink)",
                  }}
                >
                  ⚙️ Admin
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
