// src/features/driver/components/DriverTripsList.tsx
// Client component that fetches driver's trips via tRPC (enforces access control)

"use client";

import { trpc } from "@/lib/trpc";
import { TripCard } from "./TripCard";
import { ManifestTrip } from "../types";

interface DriverTripsListProps {
  dateFrom?: string | Date; // ISO string or Date object
  dateTo?: string | Date;
  status?: "unstarted" | "enroute" | "arrived" | "delayed" | "completed";
}

export function DriverTripsList({ dateFrom, dateTo, status }: DriverTripsListProps) {
  // tRPC call - backend enforces driver access control
  // z.coerce.date() will automatically parse ISO strings to Date objects
  const { data: manifests, isLoading, error } = trpc.driver.getMyTrips.useQuery({
    ...(dateFrom && { dateFrom: dateFrom instanceof Date ? dateFrom : new Date(dateFrom) }),
    ...(dateTo && { dateTo: dateTo instanceof Date ? dateTo : new Date(dateTo) }),
    ...(status && { status }),
  });

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
        <p className="text-gray-500">Loading trips...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600">Error loading trips: {error.message}</p>
      </div>
    );
  }

  // Transform manifest data to ManifestTrip format
  const trips: ManifestTrip[] = (manifests || []).map((m) => ({
    id: m.id,
    jobNumber: m.jobNumber || undefined,
    clientName: m.company?.name
      ? `${m.company.name[0]}****` // Mask client name for privacy
      : undefined,
    routeName: m.route?.name || m.title || "Untitled Route",
    vehicle: undefined, // TODO: Get from vehicle combinations
    state: (m.status?.toLowerCase() as "unstarted" | "enroute" | "arrived" | "delayed" | "completed") || "unstarted",
    eta: m.scheduledAt || undefined,
    stops: [
      ...(m.location
        ? [
            {
              id: `stop-${m.location.id}`,
              name: m.location.description || "Location",
              lat: m.location.latitude || 0,
              lng: m.location.longitude || 0,
              reached: m.status === "completed",
            },
          ]
        : []),
      ...(m.parkLocation
        ? [
            {
              id: `park-${m.parkLocation.id}`,
              name: m.parkLocation.description || "Park Location",
              lat: m.parkLocation.latitude || 0,
              lng: m.parkLocation.longitude || 0,
              reached: false,
            },
          ]
        : []),
    ],
  }));

  if (trips.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
        <p className="text-gray-500">No trips assigned.</p>
      </div>
    );
  }

  // Group trips by route (routes are preassigned in manifests)
  const tripsByRoute = trips.reduce((acc, trip) => {
    const routeName = trip.routeName || "Unassigned";
    if (!acc[routeName]) {
      acc[routeName] = [];
    }
    acc[routeName].push(trip);
    return acc;
  }, {} as Record<string, ManifestTrip[]>);

  // Sort routes: active routes first (by scheduled time), then completed
  // Within each route, sort trips by scheduled date/time (earliest first)
  const routeNames = Object.keys(tripsByRoute).sort((a, b) => {
    const tripsA = tripsByRoute[a];
    const tripsB = tripsByRoute[b];
    
    // Get earliest scheduled time for each route
    const earliestA = tripsA
      .map((t) => (t.eta ? new Date(t.eta).getTime() : Infinity))
      .sort((x, y) => x - y)[0];
    const earliestB = tripsB
      .map((t) => (t.eta ? new Date(t.eta).getTime() : Infinity))
      .sort((x, y) => x - y)[0];
    
    // Active routes (with future/present scheduled times) first
    const now = Date.now();
    const aIsActive = earliestA <= now || tripsA.some((t) => t.state !== "completed");
    const bIsActive = earliestB <= now || tripsB.some((t) => t.state !== "completed");
    
    if (aIsActive && !bIsActive) return -1;
    if (!aIsActive && bIsActive) return 1;
    
    // Then sort by earliest scheduled time
    return earliestA - earliestB;
  });

  // Sort trips within each route by scheduled date/time (earliest first)
  routeNames.forEach((routeName) => {
    tripsByRoute[routeName].sort((a, b) => {
      const timeA = a.eta ? new Date(a.eta).getTime() : Infinity;
      const timeB = b.eta ? new Date(b.eta).getTime() : Infinity;
      
      // If same time, prioritize by status: enroute > unstarted > completed
      if (Math.abs(timeA - timeB) < 60000) {
        const statusOrder: Record<string, number> = {
          enroute: 1,
          unstarted: 2,
          arrived: 3,
          delayed: 4,
          completed: 5,
        };
        return (statusOrder[a.state] || 99) - (statusOrder[b.state] || 99);
      }
      
      return timeA - timeB;
    });
  });

  return (
    <div className="space-y-6">
      {routeNames.map((routeName) => {
        const routeTrips = tripsByRoute[routeName];
        
        return (
          <div key={routeName} className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                {routeName}
              </h2>
              <span className="text-sm text-gray-500">
                {routeTrips.length} trip{routeTrips.length !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
              {routeTrips.map((trip) => (
                <TripCard key={trip.id} trip={trip} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

