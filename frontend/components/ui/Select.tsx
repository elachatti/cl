import { forwardRef, useId, type ReactNode, type SelectHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  hint?: string;
  children: ReactNode;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, error, hint, className, id, children, ...props },
  ref,
) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  const messageId = error ? `${fieldId}-error` : hint ? `${fieldId}-hint` : undefined;

  return (
    <div>
      <label htmlFor={fieldId} className="mb-1.5 block text-sm font-medium text-ink-800 dark:text-ink-100">
        {label}
      </label>
      <select
        ref={ref}
        id={fieldId}
        aria-invalid={error ? true : undefined}
        aria-describedby={messageId}
        className={cn(
          "h-11 w-full rounded-lg border bg-white px-3.5 text-[15px] text-ink-900",
          "transition-colors focus:outline-none focus:ring-2",
          "dark:bg-ink-900 dark:text-ink-50",
          error
            ? "border-red-500 focus:ring-red-500/30 dark:border-red-400"
            : "border-ink-200 focus:border-cobalt-500 focus:ring-cobalt-500/25 dark:border-ink-700 dark:focus:border-cobalt-400",
          className,
        )}
        {...props}
      >
        {children}
      </select>
      {error ? (
        <p id={`${fieldId}-error`} className="mt-1.5 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      ) : hint ? (
        <p id={`${fieldId}-hint`} className="mt-1.5 text-sm text-ink-500 dark:text-ink-400">
          {hint}
        </p>
      ) : null}
    </div>
  );
});

export default Select;
