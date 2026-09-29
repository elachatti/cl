"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";

export default function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className="navbar">
      <div className="nav-container">
        <Link href="/feed" className="logo">
          <span className="logo-icon">📌</span>
          <span className="logo-text">Clubi</span>
        </Link>
        <nav className="nav-tabs">
          <Link
            href="/feed"
            className={`tab-btn ${pathname === "/feed" || pathname === "/" ? "active" : ""}`}
          >
            <span>📰</span> Fil d&apos;actualité
          </Link>
          <Link
            href="/publier"
            className={`tab-btn ${pathname === "/publier" ? "active" : ""}`}
          >
            <span>➕</span> Publier un événement
          </Link>

          {user ? (
            <div style={{ position: "relative" }}>
              <button
                type="button"
                onClick={() => setShowUserMenu(!showUserMenu)}
                className={`tab-btn account-btn ${showUserMenu ? "active" : ""}`}
              >
                <span className="account-avatar">
                  {user.full_name?.charAt(0).toUpperCase() || "U"}
                </span>
                <span>{user.full_name || "Mon compte"}</span>
              </button>

              {showUserMenu && (
                <div
                  style={{
                    position: "absolute",
                    right: 0,
                    top: "calc(100% + 8px)",
                    background: "var(--note)",
                    border: "2px solid var(--ink)",
                    borderRadius: "var(--radius)",
                    padding: "10px 14px",
                    boxShadow: "0 8px 16px var(--note-shadow)",
                    zIndex: 100,
                    minWidth: "180px",
                  }}
                >
                  <p style={{ margin: "0 0 4px", fontSize: "0.85rem", fontWeight: "bold", color: "var(--ink)" }}>
                    {user.full_name}
                  </p>
                  <p style={{ margin: "0 0 10px", fontSize: "0.75rem", color: "var(--ink-soft)" }}>
                    {user.email} · <span style={{ textTransform: "capitalize" }}>{user.role}</span>
                  </p>
                  <Link
                    href="/login"
                    onClick={() => setShowUserMenu(false)}
                    style={{
                      display: "block",
                      width: "100%",
                      padding: "6px 10px",
                      marginBottom: "6px",
                      background: "#0000000a",
                      border: "1px solid var(--ink-soft)",
                      borderRadius: "var(--radius)",
                      textAlign: "center",
                      textDecoration: "none",
                      fontFamily: "var(--font-body)",
                      fontWeight: 600,
                      fontSize: "0.8rem",
                      color: "var(--ink)",
                    }}
                  >
                    Changer de compte
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      logout();
                      setShowUserMenu(false);
                    }}
                    style={{
                      width: "100%",
                      padding: "6px 10px",
                      background: "transparent",
                      border: "1px solid #dc2626",
                      borderRadius: "var(--radius)",
                      cursor: "pointer",
                      fontFamily: "var(--font-body)",
                      fontWeight: 600,
                      fontSize: "0.8rem",
                      color: "#dc2626",
                    }}
                  >
                    Se déconnecter
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className={`tab-btn account-btn ${pathname === "/login" ? "active" : ""}`}
            >
              <span className="account-avatar">?</span>
              <span>Mon compte</span>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
