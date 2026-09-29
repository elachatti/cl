import type { Metadata } from "next";
import Link from "next/link";

import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";
import AuthShell from "@/components/layout/AuthShell";

export const metadata: Metadata = { title: "Forgot password" };

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      title="Reset your password"
      subtitle="Enter your email and we will send you a link to choose a new password."
      footer={
        <Link href="/login" className="font-semibold text-cobalt-600 hover:underline dark:text-cobalt-300">
          Back to sign in
        </Link>
      }
    >
      <ForgotPasswordForm />
    </AuthShell>
  );
}
