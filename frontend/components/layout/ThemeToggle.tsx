"use client";

import { MoonIcon, SunIcon } from "@/components/ui/icons";
import { useTheme } from "@/hooks/useTheme";

export default function ThemeToggle() {
  const { toggleTheme } = useTheme();

  // Both icons are always rendered and switched with CSS, so the server and
  // client markup always match and there is no flash on load.
  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="Toggle dark mode"
      title="Toggle dark mode"
      className="grid h-10 w-10 place-items-center rounded-lg border border-ink-200 bg-white text-ink-700 transition-colors hover:bg-ink-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt-400 dark:border-ink-700 dark:bg-ink-800 dark:text-ink-100 dark:hover:bg-ink-700"
    >
      <MoonIcon className="dark:hidden" />
      <SunIcon className="hidden dark:block" />
    </button>
  );
}
