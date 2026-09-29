"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import Alert from "@/components/ui/Alert";
import { SpinnerIcon } from "@/components/ui/icons";
import { parseApiError } from "@/lib/utils";
import { authService } from "@/services/auth.service";

type Status = "loading" | "success" | "error";

export default function VerifyEmailStatus() {
  const token = useSearchParams().get("token");
  const [status, setStatus] = useState<Status>(token ? "loading" : "error");
  const [message, setMessage] = useState<string>(
    token ? "" : "This verification link is incomplete. Open the link from your email again.",
  );
  const requested = useRef(false);

  useEffect(() => {
    if (!token || requested.current) return;
    requested.current = true;

    authService
      .verifyEmail(token)
      .then((response) => {
        setStatus("success");
        setMessage(response.message);
      })
      .catch((error: unknown) => {
        setStatus("error");
        setMessage(parseApiError(error).message);
      });
  }, [token]);

  if (status === "loading") {
    return (
      <div className="flex items-center gap-3 text-ink-600 dark:text-ink-300" role="status">
        <SpinnerIcon />
        <span>Verifying your email address...</span>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <Alert tone={status === "success" ? "success" : "error"}>{message}</Alert>
      <Link
        href="/login"
        className="inline-flex h-11 w-full items-center justify-center rounded-lg bg-cobalt-600 px-5 text-[15px] font-semibold text-white transition-colors hover:bg-cobalt-700"
      >
        Go to sign in
      </Link>
    </div>
  );
}
