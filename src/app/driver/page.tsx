// src/app/driver/page.tsx
// Driver home page showing today's trips - uses tRPC with driver access control

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DriverTripsList } from "@/features/driver/components/DriverTripsList";
import { InstallPrompt } from "@/components/install/InstallPrompt";

export default async function DriverHome() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "DRIVER") {
    redirect("/sign-in");
  }

  // Get today's date range (convert to ISO strings for tRPC serialization)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  return (
    <div className="space-y-6">
      <InstallPrompt />
      <div className="page-header">
        <div className="page-header-title">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Trips</h1>
        </div>
      </div>
      <DriverTripsList 
        dateFrom={today.toISOString()} 
        dateTo={tomorrow.toISOString()} 
      />
    </div>
  );
}

