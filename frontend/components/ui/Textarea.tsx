import { forwardRef, useId, type TextareaHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  hint?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, error, hint, className, id, rows = 5, ...props },
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
      <textarea
        ref={ref}
        id={fieldId}
        rows={rows}
        aria-invalid={error ? true : undefined}
        aria-describedby={messageId}
        className={cn(
          "w-full resize-y rounded-lg border bg-white px-3.5 py-2.5 text-[15px] text-ink-900 placeholder:text-ink-400",
          "transition-colors focus:outline-none focus:ring-2",
          "dark:bg-ink-900 dark:text-ink-50 dark:placeholder:text-ink-500",
          error
            ? "border-red-500 focus:ring-red-500/30 dark:border-red-400"
            : "border-ink-200 focus:border-cobalt-500 focus:ring-cobalt-500/25 dark:border-ink-700 dark:focus:border-cobalt-400",
          className,
        )}
        {...props}
      />
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

export default Textarea;
