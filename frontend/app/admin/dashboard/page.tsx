import type { Metadata } from "next";

import RoleDashboard from "@/components/dashboard/RoleDashboard";

export const metadata: Metadata = { title: "Admin dashboard" };

export default function AdminDashboardPage() {
  return <RoleDashboard role="admin" />;
}
