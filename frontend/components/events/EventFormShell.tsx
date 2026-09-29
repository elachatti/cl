"use client";

import type { ReactNode } from "react";

import AuthGuard from "@/components/auth/AuthGuard";
import Logo from "@/components/layout/Logo";
import ThemeToggle from "@/components/layout/ThemeToggle";

interface EventFormShellProps {
  title: string;
  subtitle: string;
  children: ReactNode;
}

export default function EventFormShell({ title, subtitle, children }: EventFormShellProps) {
  return (
    <AuthGuard allowedRoles={["club"]}>
      <div className="min-h-screen">
        <header className="border-b border-ink-200 bg-white dark:border-ink-800 dark:bg-ink-900">
          <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-4 sm:px-6">
            <Logo />
            <ThemeToggle />
          </div>
        </header>

        <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
          <h1 className="text-3xl font-semibold tracking-tight text-ink-900 dark:text-white">{title}</h1>
          <p className="mt-1 text-ink-500 dark:text-ink-300">{subtitle}</p>

          <div className="mt-8 rounded-2xl border border-ink-200 bg-white p-6 dark:border-ink-800 dark:bg-ink-900 sm:p-8">
            {children}
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
