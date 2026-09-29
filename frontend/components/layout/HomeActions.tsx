"use client";

import Link from "next/link";

import { useAuth } from "@/hooks/useAuth";
import { ROLE_HOME } from "@/lib/constants";

const primaryLink =
  "inline-flex h-12 items-center justify-center rounded-lg bg-cobalt-600 px-6 text-base font-semibold text-white transition-colors hover:bg-cobalt-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt-400 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-ink-950";
const secondaryLink =
  "inline-flex h-12 items-center justify-center rounded-lg border border-ink-200 bg-white px-6 text-base font-semibold text-ink-800 transition-colors hover:bg-ink-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt-400 dark:border-ink-700 dark:bg-ink-800 dark:text-ink-100 dark:hover:bg-ink-700";

export function HeaderActions() {
  const { user, loading } = useAuth();

  if (loading) return <div className="h-10 w-40" aria-hidden="true" />;

  if (user) {
    return (
      <div className="flex items-center gap-2">
        <Link
          href="/events"
          className="hidden text-sm font-medium text-ink-600 hover:text-ink-900 dark:text-ink-300 dark:hover:text-white sm:inline"
        >
          Events
        </Link>
        <Link href={ROLE_HOME[user.role]} className={`${secondaryLink} !h-10 !px-4 !text-sm`}>
          Open dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Link
        href="/events"
        className="hidden text-sm font-medium text-ink-600 hover:text-ink-900 dark:text-ink-300 dark:hover:text-white sm:inline"
      >
        Events
      </Link>
      <Link href="/login" className={`${secondaryLink} !h-10 !px-4 !text-sm`}>
        Sign in
      </Link>
      <Link href="/register" className={`${primaryLink} !h-10 !px-4 !text-sm`}>
        Create account
      </Link>
    </div>
  );
}

export function HeroActions() {
  const { user, loading } = useAuth();

  if (loading) return <div className="h-12" aria-hidden="true" />;

  if (user) {
    return (
      <div className="flex flex-wrap gap-3">
        <Link href="/feed" className={primaryLink}>
          <span>📌</span>
          <span className="ml-2">Le panneau d&apos;événements</span>
        </Link>
        <Link href={ROLE_HOME[user.role]} className={secondaryLink}>
          Mon tableau de bord
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-3">
      <Link href="/feed" className={primaryLink}>
        <span>📌</span>
        <span className="ml-2">Explorer le panneau</span>
      </Link>
      <Link href="/register" className={secondaryLink}>
        Créer un compte
      </Link>
      <Link href="/login" className="inline-flex h-12 items-center justify-center rounded-lg px-4 text-sm font-semibold text-ink-600 hover:text-ink-900 dark:text-ink-300 dark:hover:text-white">
        Connexion →
      </Link>
    </div>
  );
}
