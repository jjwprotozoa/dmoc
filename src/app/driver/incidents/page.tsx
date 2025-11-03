// src/app/driver/incidents/page.tsx
// Driver incidents/reports page - shows all reported incidents

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DriverIncidentsList } from "@/features/driver/components/DriverIncidentsList";

export default async function DriverIncidentsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "DRIVER") {
    redirect("/sign-in");
  }

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div className="page-header-title">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Reports</h1>
          <p className="text-sm text-gray-500 mt-1">View all incidents, fuel logs, and other reports</p>
        </div>
      </div>
      <DriverIncidentsList />
    </div>
  );
}

