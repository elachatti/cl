import type { Metadata } from "next";
import { Suspense } from "react";

import VerifyEmailStatus from "@/components/auth/VerifyEmailStatus";
import AuthShell from "@/components/layout/AuthShell";

export const metadata: Metadata = { title: "Verify email" };

export default function VerifyEmailPage() {
  return (
    <AuthShell title="Email verification" subtitle="We are confirming your email address.">
      <Suspense fallback={null}>
        <VerifyEmailStatus />
      </Suspense>
    </AuthShell>
  );
}
