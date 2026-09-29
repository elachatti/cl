import type { Metadata } from "next";

import RoleDashboard from "@/components/dashboard/RoleDashboard";

export const metadata: Metadata = { title: "Student dashboard" };

export default function StudentDashboardPage() {
  return <RoleDashboard role="student" />;
}
