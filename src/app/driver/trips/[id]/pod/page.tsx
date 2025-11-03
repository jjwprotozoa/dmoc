// src/app/driver/trips/[id]/pod/page.tsx
// Proof of delivery form page

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PodForm } from "@/features/driver/components/forms/PodForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function PodPage({ params }: { params: { id: string } }) {
  const s = await getServerSession(authOptions);
  const driverId = s?.user?.driverId ?? s?.user?.id ?? "D-1";
  return (
    <div className="space-y-6">
      <div className="page-header">
        <div className="page-header-title">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Proof of Delivery</h1>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Delivery Confirmation</CardTitle>
        </CardHeader>
        <CardContent>
          <PodForm manifestId={params.id} driverId={driverId} />
        </CardContent>
      </Card>
    </div>
  );
}

