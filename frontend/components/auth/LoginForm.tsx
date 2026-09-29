"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";

import Alert from "@/components/ui/Alert";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import PasswordInput from "@/components/ui/PasswordInput";
import { useAuth } from "@/hooks/useAuth";
import { getSafeRedirect, parseApiError } from "@/lib/utils";
import { isValidEmail } from "@/lib/validators";
import { authService } from "@/services/auth.service";

interface FieldErrors {
  email?: string;
  password?: string;
}

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);

  const sessionExpired = searchParams.get("session") === "expired";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    setNeedsVerification(false);
    setResendMessage(null);

    const nextErrors: FieldErrors = {};
    if (!isValidEmail(email)) nextErrors.email = "Enter a valid email address";
    if (!password) nextErrors.password = "Enter your password";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    try {
      const user = await login({ email: email.trim(), password, remember_me: rememberMe });
      router.replace(getSafeRedirect(searchParams.get("next"), user.role));
      // Keep the button in its loading state while the redirect happens.
    } catch (error) {
      const { message, status } = parseApiError(error, "We could not sign you in. Please try again.");
      setFormError(message);
      setNeedsVerification(status === 403 && /verify/i.test(message));
      setSubmitting(false);
    }
  }

  async function handleResend() {
    setResending(true);
    setResendMessage(null);
    try {
      const response = await authService.resendVerification(email.trim());
      setResendMessage(response.message);
    } catch (error) {
      setResendMessage(parseApiError(error).message);
    } finally {
      setResending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {sessionExpired && !formError && (
        <Alert tone="info">Your session has ended. Sign in again to continue.</Alert>
      )}

      {formError && (
        <Alert tone="error">
          <p>{formError}</p>
          {needsVerification && (
            <button
              type="button"
              onClick={handleResend}
              disabled={resending || !isValidEmail(email)}
              className="mt-2 font-semibold underline underline-offset-2 disabled:opacity-60"
            >
              {resending ? "Sending..." : "Resend verification email"}
            </button>
          )}
        </Alert>
      )}

      {resendMessage && <Alert tone="success">{resendMessage}</Alert>}

      <Input
        label="Email"
        type="email"
        name="email"
        autoComplete="email"
        inputMode="email"
        placeholder="you@university.edu"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={errors.email}
      />

      <PasswordInput
        label="Password"
        name="password"
        autoComplete="current-password"
        placeholder="Your password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={errors.password}
      />

      <div className="flex items-center justify-between gap-4">
        <label className="flex cursor-pointer items-center gap-2.5 text-sm text-ink-700 dark:text-ink-200">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="h-4 w-4 rounded border-ink-300 text-cobalt-600 focus:ring-cobalt-500 dark:border-ink-600 dark:bg-ink-900"
          />
          Remember me
        </label>
        <Link
          href="/forgot-password"
          className="text-sm font-medium text-cobalt-600 hover:underline dark:text-cobalt-300"
        >
          Forgot password?
        </Link>
      </div>

      <Button type="submit" fullWidth loading={submitting}>
        {submitting ? "Signing in" : "Sign in"}
      </Button>
    </form>
  );
}
