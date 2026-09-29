import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from "react";

import { cn } from "@/lib/utils";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
  /** Element rendered inside the field on the right (e.g. a show/hide button). */
  trailing?: ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, hint, trailing, className, id, ...props },
  ref,
) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const messageId = error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined;

  return (
    <div>
      <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-ink-800 dark:text-ink-100">
        {label}
      </label>
      <div className="relative">
        <input
          ref={ref}
          id={inputId}
          aria-invalid={error ? true : undefined}
          aria-describedby={messageId}
          className={cn(
            "h-11 w-full rounded-lg border bg-white px-3.5 text-[15px] text-ink-900 placeholder:text-ink-400",
            "transition-colors focus:outline-none focus:ring-2",
            "dark:bg-ink-900 dark:text-ink-50 dark:placeholder:text-ink-500",
            error
              ? "border-red-500 focus:ring-red-500/30 dark:border-red-400"
              : "border-ink-200 focus:border-cobalt-500 focus:ring-cobalt-500/25 dark:border-ink-700 dark:focus:border-cobalt-400",
            trailing ? "pr-11" : "",
            className,
          )}
          {...props}
        />
        {trailing && <div className="absolute inset-y-0 right-1.5 flex items-center">{trailing}</div>}
      </div>
      {error ? (
        <p id={`${inputId}-error`} className="mt-1.5 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      ) : hint ? (
        <p id={`${inputId}-hint`} className="mt-1.5 text-sm text-ink-500 dark:text-ink-400">
          {hint}
        </p>
      ) : null}
    </div>
  );
});

export default Input;
