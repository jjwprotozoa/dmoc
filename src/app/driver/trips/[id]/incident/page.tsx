// src/app/driver/trips/[id]/incident/page.tsx
// Incident reporting form page

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { IncidentForm } from "@/features/driver/components/forms/IncidentForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function IncidentPage({ params }: { params: { id: string } }) {
  const s = await getServerSession(authOptions);
  const driverId = s?.user?.driverId ?? s?.user?.id ?? "D-1";
  return (
    <div className="space-y-6">
      <div className="page-header">
        <div className="page-header-title">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Report Incident</h1>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Incident Details</CardTitle>
        </CardHeader>
        <CardContent>
          <IncidentForm manifestId={params.id} driverId={driverId} />
        </CardContent>
      </Card>
    </div>
  );
}

