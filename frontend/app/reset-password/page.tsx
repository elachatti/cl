import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import ResetPasswordForm from "@/components/auth/ResetPasswordForm";
import AuthShell from "@/components/layout/AuthShell";

export const metadata: Metadata = { title: "Choose a new password" };

export default function ResetPasswordPage() {
  return (
    <AuthShell
      title="Choose a new password"
      subtitle="Pick a password you have not used on this account before."
      footer={
        <Link href="/login" className="font-semibold text-cobalt-600 hover:underline dark:text-cobalt-300">
          Back to sign in
        </Link>
      }
    >
      <Suspense fallback={null}>
        <ResetPasswordForm />
      </Suspense>
    </AuthShell>
  );
}
