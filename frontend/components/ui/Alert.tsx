import type { ReactNode } from "react";

import { AlertIcon, CheckCircleIcon } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

type AlertTone = "error" | "success" | "info";

interface AlertProps {
  tone?: AlertTone;
  children: ReactNode;
  className?: string;
}

const toneClasses: Record<AlertTone, string> = {
  error:
    "border-red-200 bg-red-50 text-red-800 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200",
  success:
    "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200",
  info: "border-cobalt-200 bg-cobalt-50 text-cobalt-900 dark:border-cobalt-400/30 dark:bg-cobalt-400/10 dark:text-cobalt-100",
};

export default function Alert({ tone = "info", children, className }: AlertProps) {
  const Icon = tone === "success" ? CheckCircleIcon : AlertIcon;

  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={cn("flex items-start gap-2.5 rounded-lg border px-3.5 py-3 text-sm", toneClasses[tone], className)}
    >
      <Icon width={18} height={18} className="mt-0.5 shrink-0" />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
