import type { Metadata } from "next";

import RoleDashboard from "@/components/dashboard/RoleDashboard";

export const metadata: Metadata = { title: "Club dashboard" };

export default function ClubDashboardPage() {
  return <RoleDashboard role="club" />;
}
