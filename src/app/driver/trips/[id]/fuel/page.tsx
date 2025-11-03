// src/app/driver/trips/[id]/fuel/page.tsx
// Fuel logging form page

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { FuelForm } from "@/features/driver/components/forms/FuelForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function FuelPage({ params }: { params: { id: string } }) {
  const s = await getServerSession(authOptions);
  const driverId = s?.user?.driverId ?? s?.user?.id ?? "D-1";
  return (
    <div className="space-y-6">
      <div className="page-header">
        <div className="page-header-title">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Fuel Log</h1>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Fuel Information</CardTitle>
        </CardHeader>
        <CardContent>
          <FuelForm manifestId={params.id} driverId={driverId} />
        </CardContent>
      </Card>
    </div>
  );
}

