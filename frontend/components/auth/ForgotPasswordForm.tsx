"use client";

import { useState, type FormEvent } from "react";

import Alert from "@/components/ui/Alert";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { parseApiError } from "@/lib/utils";
import { isValidEmail } from "@/lib/validators";
import { authService } from "@/services/auth.service";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [fieldError, setFieldError] = useState<string | undefined>();
  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);

    if (!isValidEmail(email)) {
      setFieldError("Enter a valid email address");
      return;
    }
    setFieldError(undefined);

    setSubmitting(true);
    try {
      const response = await authService.forgotPassword(email.trim());
      setMessage(response.message);
    } catch (err) {
      setError(parseApiError(err).message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {error && <Alert tone="error">{error}</Alert>}
      {message && <Alert tone="success">{message}</Alert>}

      <Input
        label="Email"
        type="email"
        name="email"
        autoComplete="email"
        inputMode="email"
        placeholder="you@university.edu"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={fieldError}
      />

      <Button type="submit" fullWidth loading={submitting}>
        {submitting ? "Sending link" : "Send reset link"}
      </Button>
    </form>
  );
}
