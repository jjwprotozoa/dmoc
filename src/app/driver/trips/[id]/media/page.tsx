// src/app/driver/trips/[id]/media/page.tsx
// Media upload form page

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { MediaForm } from "@/features/driver/components/forms/MediaForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function MediaPage({ params }: { params: { id: string } }) {
  const s = await getServerSession(authOptions);
  const driverId = s?.user?.driverId ?? s?.user?.id ?? "D-1";
  return (
    <div className="space-y-6">
      <div className="page-header">
        <div className="page-header-title">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Add Media</h1>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Upload Photo/Video</CardTitle>
        </CardHeader>
        <CardContent>
          <MediaForm manifestId={params.id} driverId={driverId} />
        </CardContent>
      </Card>
    </div>
  );
}

