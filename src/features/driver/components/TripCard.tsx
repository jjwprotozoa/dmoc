// src/features/driver/components/TripCard.tsx
"use client";

import { ManifestTrip } from "../types";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function TripCard({ trip }: { trip: ManifestTrip }) {
  return (
    <Link href={`/driver/trips/${trip.id}`}>
      <Card className="hover:shadow-md transition">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">
            {trip.routeName} <span className="text-xs text-muted-foreground">({trip.jobNumber})</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm flex flex-col gap-1">
          <div><b>Vehicle:</b> {trip.vehicle?.plate ?? "—"}</div>
          <div><b>State:</b> {trip.state}</div>
          <div><b>ETA:</b> {trip.eta ? new Date(trip.eta).toLocaleTimeString() : "—"}</div>
        </CardContent>
      </Card>
    </Link>
  );
}

