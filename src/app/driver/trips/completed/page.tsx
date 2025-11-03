// src/app/driver/trips/completed/page.tsx
// Completed trips page for drivers

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DriverTripsList } from "@/features/driver/components/DriverTripsList";

export default async function CompletedTripsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "DRIVER") {
    redirect("/sign-in");
  }

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div className="page-header-title">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Completed Trips</h1>
        </div>
      </div>
      <DriverTripsList status="completed" />
    </div>
  );
}

