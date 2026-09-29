import { forwardRef, type ButtonHTMLAttributes } from "react";

import { SpinnerIcon } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  loading?: boolean;
  fullWidth?: boolean;
}

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-cobalt-600 text-white hover:bg-cobalt-700 active:bg-cobalt-800 disabled:bg-cobalt-600/60",
  secondary:
    "border border-ink-200 bg-white text-ink-800 hover:bg-ink-50 dark:border-ink-700 dark:bg-ink-800 dark:text-ink-100 dark:hover:bg-ink-700",
  ghost:
    "text-ink-600 hover:bg-ink-100 dark:text-ink-300 dark:hover:bg-ink-800",
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", loading = false, fullWidth = false, className, disabled, type = "button", children, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(
        "inline-flex h-11 items-center justify-center gap-2 rounded-lg px-5 text-[15px] font-semibold transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-ink-900",
        "disabled:cursor-not-allowed disabled:opacity-80",
        variantClasses[variant],
        fullWidth && "w-full",
        className,
      )}
      {...props}
    >
      {loading && <SpinnerIcon width={18} height={18} />}
      {children}
    </button>
  );
});

export default Button;
