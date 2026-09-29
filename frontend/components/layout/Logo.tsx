import Link from "next/link";

import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  tone?: "auto" | "light";
}

export default function Logo({ className, tone = "auto" }: LogoProps) {
  return (
    <Link
      href="/"
      className={cn(
        "group inline-flex items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt-400",
        className,
      )}
    >
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-cobalt-600 text-white shadow-sm transition-transform group-hover:scale-105">
        <span className="text-lg leading-none" role="img" aria-label="pin">
          📌
        </span>
      </span>
      <div className="flex flex-col">
        <span
          className={cn(
            "text-lg font-bold leading-none tracking-tight",
            tone === "light" ? "text-white" : "text-ink-900 dark:text-white",
          )}
        >
          Clubi
        </span>
        <span
          className={cn(
            "text-[10px] font-semibold uppercase tracking-wider",
            tone === "light" ? "text-white/70" : "text-ink-400 dark:text-ink-400",
          )}
        >
          Plateforme Clubs
        </span>
      </div>
    </Link>
  );
}

