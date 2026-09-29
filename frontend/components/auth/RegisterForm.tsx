"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";

import Alert from "@/components/ui/Alert";
import Button from "@/components/ui/Button";
import { MailIcon } from "@/components/ui/icons";
import Input from "@/components/ui/Input";
import PasswordInput from "@/components/ui/PasswordInput";
import { useAuth } from "@/hooks/useAuth";
import { cn, parseApiError } from "@/lib/utils";
import { getPasswordStrength, isValidEmail, validatePassword } from "@/lib/validators";
import { authService } from "@/services/auth.service";
import type { RegisterResponse, RegisterRole } from "@/types/auth";

interface FieldErrors {
  fullName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

const ROLE_OPTIONS: Array<{ value: RegisterRole; title: string; description: string }> = [
  {
    value: "student",
    title: "Student",
    description: "Discover events, save favorites and get AI guidance.",
  },
  {
    value: "club",
    title: "Club",
    description: "Publish events and reach students who want to join.",
  },
];

const STRENGTH_LABELS = ["", "Weak", "Fair", "Good", "Strong"];
const STRENGTH_COLORS = ["", "bg-red-500", "bg-amber-500", "bg-cobalt-500", "bg-emerald-500"];

function PasswordStrength({ password }: { password: string }) {
  const score = getPasswordStrength(password);
  if (!password) return null;

  return (
    <div className="mt-2" aria-live="polite">
      <div className="flex gap-1.5">
        {[1, 2, 3, 4].map((segment) => (
          <span
            key={segment}
            className={cn(
              "h-1.5 flex-1 rounded-full",
              segment <= score ? STRENGTH_COLORS[score] : "bg-ink-200 dark:bg-ink-700",
            )}
          />
        ))}
      </div>
      <p className="mt-1.5 text-xs text-ink-500 dark:text-ink-400">Password strength: {STRENGTH_LABELS[score]}</p>
    </div>
  );
}

export default function RegisterForm() {
  const { register } = useAuth();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<RegisterRole>("student");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<RegisterResponse | null>(null);
  const [resending, setResending] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    const nextErrors: FieldErrors = {};
    if (fullName.trim().length < 2) nextErrors.fullName = "Enter your full name";
    if (!isValidEmail(email)) nextErrors.email = "Enter a valid email address";
    const passwordError = validatePassword(password);
    if (passwordError) nextErrors.password = passwordError;
    if (!confirmPassword) nextErrors.confirmPassword = "Confirm your password";
    else if (confirmPassword !== password) nextErrors.confirmPassword = "Passwords do not match";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    try {
      const response = await register({
        full_name: fullName.trim(),
        email: email.trim(),
        password,
        confirm_password: confirmPassword,
        role,
      });
      setResult(response);
    } catch (error) {
      setFormError(parseApiError(error, "We could not create your account. Please try again.").message);
    } finally {
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

  if (result) {
    const needsVerification = !result.user.is_verified;

    return (
      <div className="space-y-5">
        <div className="flex items-start gap-4 rounded-xl border border-ink-200 p-5 dark:border-ink-700">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-cobalt-50 text-cobalt-600 dark:bg-cobalt-400/15 dark:text-cobalt-300">
            <MailIcon />
          </span>
          <div>
            <p className="font-semibold text-ink-900 dark:text-white">
              {needsVerification ? "Check your inbox" : "You're all set"}
            </p>
            <p className="mt-1 text-sm leading-relaxed text-ink-600 dark:text-ink-300">{result.message}</p>
            {needsVerification && (
              <p className="mt-2 text-sm text-ink-500 dark:text-ink-400">
                We sent the link to <span className="font-medium">{result.user.email}</span>.
              </p>
            )}
          </div>
        </div>

        {resendMessage && <Alert tone="success">{resendMessage}</Alert>}

        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/login"
            className="inline-flex h-11 flex-1 items-center justify-center rounded-lg bg-cobalt-600 px-5 text-[15px] font-semibold text-white transition-colors hover:bg-cobalt-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt-400 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-ink-900"
          >
            Go to sign in
          </Link>
          {needsVerification && (
            <Button variant="secondary" className="flex-1" loading={resending} onClick={handleResend}>
              Resend email
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {formError && <Alert tone="error">{formError}</Alert>}

      <fieldset>
        <legend className="mb-1.5 text-sm font-medium text-ink-800 dark:text-ink-100">I am a</legend>
        <div className="grid grid-cols-2 gap-3">
          {ROLE_OPTIONS.map((option) => {
            const selected = role === option.value;
            return (
              <label
                key={option.value}
                className={cn(
                  "flex cursor-pointer flex-col rounded-lg border p-3.5 transition-colors focus-within:ring-2 focus-within:ring-cobalt-500/40",
                  selected
                    ? "border-cobalt-600 bg-cobalt-50 dark:border-cobalt-400 dark:bg-cobalt-400/10"
                    : "border-ink-200 hover:bg-ink-50 dark:border-ink-700 dark:hover:bg-ink-800",
                )}
              >
                <input
                  type="radio"
                  name="role"
                  value={option.value}
                  checked={selected}
                  onChange={() => setRole(option.value)}
                  className="sr-only"
                />
                <span className="text-[15px] font-semibold text-ink-900 dark:text-white">{option.title}</span>
                <span className="mt-1 text-xs leading-snug text-ink-500 dark:text-ink-300">
                  {option.description}
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <Input
        label="Full name"
        name="full_name"
        autoComplete="name"
        placeholder={role === "club" ? "Club or organizer name" : "Your full name"}
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
        error={errors.fullName}
      />

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

      <div>
        <PasswordInput
          label="Password"
          name="password"
          autoComplete="new-password"
          placeholder="At least 8 characters"
          hint="Use 8 or more characters with a letter and a number."
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
        />
        <PasswordStrength password={password} />
      </div>

      <PasswordInput
        label="Confirm password"
        name="confirm_password"
        autoComplete="new-password"
        placeholder="Repeat your password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        error={errors.confirmPassword}
      />

      <Button type="submit" fullWidth loading={submitting}>
        {submitting ? "Creating account" : "Create account"}
      </Button>
    </form>
  );
}
