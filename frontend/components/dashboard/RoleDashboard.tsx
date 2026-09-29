"use client";

import Link from "next/link";

import AuthGuard from "@/components/auth/AuthGuard";
import Logo from "@/components/layout/Logo";
import ThemeToggle from "@/components/layout/ThemeToggle";
import Button from "@/components/ui/Button";
import { CheckCircleIcon } from "@/components/ui/icons";
import { useAuth } from "@/hooks/useAuth";
import { ROLE_LABEL } from "@/lib/constants";
import { formatDate, getInitials } from "@/lib/utils";
import type { UserRole } from "@/types/auth";

const UPCOMING: Record<UserRole, string[]> = {
  student: [
    "Browse and filter hackathons, workshops and conferences",
    "Save favorites and mark events you are interested in or joining",
    "Chat with the AI assistant for recommendations and preparation",
  ],
  club: [
    "See who is interested in or joining your events",
    "Reply to questions in your event comments",
    "Track attendance once an event has taken place",
  ],
  admin: [
    "Review and moderate published events",
    "Manage users and their roles",
    "Monitor activity across the platform",
  ],
};

function DashboardContent({ role }: { role: UserRole }) {
  const { user, logout } = useAuth();
  if (!user) return null;

  return (
    <div className="min-h-screen">
      <header className="border-b border-ink-200 bg-white dark:border-ink-800 dark:bg-ink-900">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
          <Logo />
          <div className="flex items-center gap-3">
            <Link
              href="/events"
              className="hidden text-sm font-medium text-ink-600 hover:text-ink-900 dark:text-ink-300 dark:hover:text-white sm:inline"
            >
              Browse events
            </Link>
            {role === "club" && (
              <Link
                href="/club/events/create"
                className="inline-flex h-10 items-center justify-center rounded-lg bg-cobalt-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-cobalt-700"
              >
                Publish an event
              </Link>
            )}
            <ThemeToggle />
            <Button variant="secondary" onClick={() => void logout()} className="h-10 px-4">
              Sign out
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <h1 className="text-3xl font-semibold tracking-tight text-ink-900 dark:text-white">
          Welcome, {user.full_name.split(" ")[0]}
        </h1>
        <p className="mt-2 text-ink-500 dark:text-ink-300">
          You are signed in to the {ROLE_LABEL[role].toLowerCase()} workspace.
        </p>

        <div className="mt-8 grid gap-6 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
          <section
            aria-labelledby="account-heading"
            className="rounded-2xl border border-ink-200 bg-white p-6 dark:border-ink-800 dark:bg-ink-900"
          >
            <h2 id="account-heading" className="sr-only">
              Your account
            </h2>
            <div className="flex items-center gap-4">
              <span className="grid h-14 w-14 place-items-center rounded-full bg-cobalt-600 text-lg font-semibold text-white">
                {getInitials(user.full_name)}
              </span>
              <div className="min-w-0">
                <p className="truncate font-semibold text-ink-900 dark:text-white">{user.full_name}</p>
                <p className="truncate text-sm text-ink-500 dark:text-ink-300">{user.email}</p>
              </div>
            </div>

            <dl className="mt-6 space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-ink-500 dark:text-ink-400">Role</dt>
                <dd className="font-medium text-ink-900 dark:text-white">{ROLE_LABEL[user.role]}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-ink-500 dark:text-ink-400">Email</dt>
                <dd className="font-medium text-ink-900 dark:text-white">
                  {user.is_verified ? "Verified" : "Not verified"}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-ink-500 dark:text-ink-400">Member since</dt>
                <dd className="font-medium text-ink-900 dark:text-white">{formatDate(user.created_at)}</dd>
              </div>
            </dl>
          </section>

          <section
            aria-labelledby="next-heading"
            className="rounded-2xl border border-ink-200 bg-white p-6 dark:border-ink-800 dark:bg-ink-900"
          >
            <h2 id="next-heading" className="text-lg font-semibold text-ink-900 dark:text-white">
              Coming to your workspace
            </h2>
            <p className="mt-1 text-sm text-ink-500 dark:text-ink-300">
              Your account, sign-in and role access are ready. These features arrive in the next modules.
            </p>
            <ul className="mt-5 space-y-3">
              {UPCOMING[role].map((item) => (
                <li key={item} className="flex items-start gap-3 text-[15px] text-ink-700 dark:text-ink-200">
                  <CheckCircleIcon width={18} height={18} className="mt-0.5 shrink-0 text-ink-300 dark:text-ink-600" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </main>
    </div>
  );
}

export default function RoleDashboard({ role }: { role: UserRole }) {
  return (
    <AuthGuard allowedRoles={[role]}>
      <DashboardContent role={role} />
    </AuthGuard>
  );
}
