import type { ReactNode } from "react";

import Logo from "@/components/layout/Logo";
import ThemeToggle from "@/components/layout/ThemeToggle";
import TicketCard from "@/components/layout/TicketCard";

interface AuthShellProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}

export default function AuthShell({ title, subtitle, children, footer }: AuthShellProps) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[5fr_6fr]">
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-ink-950 p-10 lg:flex xl:p-14">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-32 top-1/3 h-96 w-96 rounded-full bg-cobalt-600/25 blur-3xl"
        />
        <Logo tone="light" className="relative" />

        <div className="relative">
          <h1 className="max-w-md text-4xl font-semibold leading-tight tracking-tight text-white">
            Find the event that moves your career forward.
          </h1>
          <p className="mt-4 max-w-md text-base leading-relaxed text-ink-300">
            Hackathons, competitions, workshops and conferences for computer science students,
            with an assistant to help you choose and prepare.
          </p>
          <TicketCard className="mt-10 animate-rise" />
        </div>

        <p className="relative text-sm text-ink-400">Built for students and the clubs that serve them.</p>
      </aside>

      <main className="flex flex-col bg-white dark:bg-ink-900">
        <div className="flex items-center justify-between px-6 py-5 sm:px-10">
          <Logo className="lg:invisible" />
          <ThemeToggle />
        </div>

        <div className="flex flex-1 items-center justify-center px-6 pb-12 sm:px-10">
          <div className="w-full max-w-md">
            <h2 className="text-3xl font-semibold tracking-tight text-ink-900 dark:text-white">{title}</h2>
            {subtitle && (
              <p className="mt-2 text-[15px] leading-relaxed text-ink-500 dark:text-ink-300">{subtitle}</p>
            )}
            <div className="mt-8">{children}</div>
            {footer && <div className="mt-8 text-center text-sm text-ink-500 dark:text-ink-300">{footer}</div>}
          </div>
        </div>
      </main>
    </div>
  );
}
