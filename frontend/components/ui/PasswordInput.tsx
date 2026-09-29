"use client";

import { forwardRef, useState } from "react";

import { EyeIcon, EyeOffIcon } from "@/components/ui/icons";
import Input, { type InputProps } from "@/components/ui/Input";

type PasswordInputProps = Omit<InputProps, "type" | "trailing">;

const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(function PasswordInput(
  props,
  ref,
) {
  const [visible, setVisible] = useState(false);

  return (
    <Input
      ref={ref}
      {...props}
      type={visible ? "text" : "password"}
      trailing={
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
          className="grid h-8 w-8 place-items-center rounded-md text-ink-500 transition-colors hover:bg-ink-100 hover:text-ink-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt-400 dark:text-ink-400 dark:hover:bg-ink-800 dark:hover:text-ink-100"
        >
          {visible ? <EyeOffIcon width={18} height={18} /> : <EyeIcon width={18} height={18} />}
        </button>
      }
    />
  );
});

export default PasswordInput;
