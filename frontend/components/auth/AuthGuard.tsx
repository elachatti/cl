"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

import { SpinnerIcon } from "@/components/ui/icons";
import { useAuth } from "@/hooks/useAuth";
import { ROLE_HOME } from "@/lib/constants";
import type { UserRole } from "@/types/auth";

interface AuthGuardProps {
  /** Roles allowed to see the page. Omit to allow any signed-in user. */
  allowedRoles?: UserRole[];
  children: ReactNode;
}

/** Client-side route protection. The middleware handles the first redirect; this covers the rest. */
export default function AuthGuard({ allowedRoles, children }: AuthGuardProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const allowed = !!user && (!allowedRoles || allowedRoles.includes(user.role));

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    } else if (!allowed) {
      router.replace(ROLE_HOME[user.role]);
    }
  }, [loading, user, allowed, router, pathname]);

  if (loading || !allowed) {
    return (
      <div className="grid min-h-screen place-items-center text-cobalt-600 dark:text-cobalt-300" role="status">
        <SpinnerIcon width={28} height={28} />
        <span className="sr-only">Loading</span>
      </div>
    );
  }

  return <>{children}</>;
}
