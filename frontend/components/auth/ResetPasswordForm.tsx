"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";

import Alert from "@/components/ui/Alert";
import Button from "@/components/ui/Button";
import PasswordInput from "@/components/ui/PasswordInput";
import { parseApiError } from "@/lib/utils";
import { validatePassword } from "@/lib/validators";
import { authService } from "@/services/auth.service";

export default function ResetPasswordForm() {
  const token = useSearchParams().get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<{ password?: string; confirmPassword?: string }>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!token) {
    return (
      <div className="space-y-5">
        <Alert tone="error">This reset link is incomplete. Request a new one to continue.</Alert>
        <Link
          href="/forgot-password"
          className="inline-flex h-11 w-full items-center justify-center rounded-lg bg-cobalt-600 px-5 text-[15px] font-semibold text-white transition-colors hover:bg-cobalt-700"
        >
          Request a new link
        </Link>
      </div>
    );
  }

  if (message) {
    return (
      <div className="space-y-5">
        <Alert tone="success">{message}</Alert>
        <Link
          href="/login"
          className="inline-flex h-11 w-full items-center justify-center rounded-lg bg-cobalt-600 px-5 text-[15px] font-semibold text-white transition-colors hover:bg-cobalt-700"
        >
          Go to sign in
        </Link>
      </div>
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    const nextErrors: { password?: string; confirmPassword?: string } = {};
    const passwordError = validatePassword(password);
    if (passwordError) nextErrors.password = passwordError;
    if (!confirmPassword) nextErrors.confirmPassword = "Confirm your new password";
    else if (confirmPassword !== password) nextErrors.confirmPassword = "Passwords do not match";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0 || !token) return;

    setSubmitting(true);
    try {
      const response = await authService.resetPassword(token, password, confirmPassword);
      setMessage(response.message);
    } catch (err) {
      setFormError(parseApiError(err).message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {formError && (
        <Alert tone="error">
          <p>{formError}</p>
          <Link href="/forgot-password" className="mt-2 inline-block font-semibold underline underline-offset-2">
            Request a new link
          </Link>
        </Alert>
      )}

      <PasswordInput
        label="New password"
        name="password"
        autoComplete="new-password"
        placeholder="At least 8 characters"
        hint="Use 8 or more characters with a letter and a number."
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={errors.password}
      />

      <PasswordInput
        label="Confirm new password"
        name="confirm_password"
        autoComplete="new-password"
        placeholder="Repeat your new password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        error={errors.confirmPassword}
      />

      <Button type="submit" fullWidth loading={submitting}>
        {submitting ? "Saving password" : "Save new password"}
      </Button>
    </form>
  );
}
