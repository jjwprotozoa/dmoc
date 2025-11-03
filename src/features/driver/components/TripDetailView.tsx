// src/features/driver/components/TripDetailView.tsx
// Client component for trip detail with real map and driver-scoped data

"use client";

import dynamic from "next/dynamic";
import { trpc } from "@/lib/trpc";
import { useSocket } from "@/hooks/useSocket";
import { QuickActions } from "./QuickActions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";

// Dynamically import Map to avoid SSR issues
const Map = dynamic(
  () => import("@/components/map/Map").then((mod) => ({ default: mod.Map })),
  {
    ssr: false,
    loading: () => (
      <div className="h-full bg-gray-100 flex items-center justify-center rounded-lg border border-gray-200">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
          <p className="text-gray-500">Loading map...</p>
        </div>
      </div>
    ),
  }
);

interface TripDetailViewProps {
  manifestId: string;
}

export function TripDetailView({ manifestId }: TripDetailViewProps) {
  const { socket, isConnected } = useSocket();
  const [latestPing, setLatestPing] = useState<any>(null);

  // Fetch trip data - backend enforces driver access control
  const { data: manifest, isLoading, error } = trpc.driver.getMyTripById.useQuery({
    manifestId,
  });

  // Fetch location history for this trip
  const { data: locationHistory } = trpc.driver.getMyLocationHistory.useQuery(
    {
      manifestId,
      limit: 50,
    },
    {
      enabled: !!manifest,
      refetchInterval: 30000, // Refresh every 30 seconds
    }
  );

  // Listen for real-time location updates via Socket.IO
  useEffect(() => {
    if (socket && isConnected && manifest?.trackingId) {
      socket.on(`ping:new`, (ping) => {
        // Check if ping is for this trip's tracker
        if (ping.device?.id && manifest.trackingId) {
          setLatestPing(ping);
        }
      });

      return () => {
        socket.off(`ping:new`);
      };
    }
  }, [socket, isConnected, manifest?.trackingId]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
          <p className="text-gray-500">Loading trip details...</p>
        </div>
      </div>
    );
  }

  if (error || !manifest) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <p className="text-red-600">
          {error?.message || "Trip not found or you don't have access to it."}
        </p>
      </div>
    );
  }

  // Transform location data for Map component
  const pings = [
    ...(locationHistory || []).map((ping) => ({
      id: ping.id,
      lat: ping.latitude,
      lng: ping.longitude,
      speed: ping.speed,
      heading: ping.heading,
      timestamp: ping.timestamp.toISOString(),
      device: {
        id: ping.device.id,
        externalId: ping.device.externalId || "Tracker",
      },
    })),
    // Add latest real-time ping if available
    ...(latestPing
      ? [
          {
            id: `realtime-${latestPing.id}`,
            lat: latestPing.lat || latestPing.latitude,
            lng: latestPing.lng || latestPing.longitude,
            speed: latestPing.speed,
            heading: latestPing.heading,
            timestamp: latestPing.timestamp || new Date().toISOString(),
            device: {
              id: latestPing.device?.id || "realtime",
              externalId: latestPing.device?.externalId || "Live",
            },
          },
        ]
      : []),
    // Add stop locations as markers
    ...(manifest.location
      ? [
          {
            id: `stop-${manifest.location.id}`,
            lat: manifest.location.latitude || 0,
            lng: manifest.location.longitude || 0,
            speed: null,
            heading: null,
            timestamp: new Date().toISOString(),
            device: {
              id: "destination",
              externalId: manifest.location.description || "Destination",
            },
          },
        ]
      : []),
  ];

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div className="page-header-title">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            {manifest.route?.name || manifest.title || "Trip Details"}
          </h1>
          {manifest.jobNumber && (
            <span className="text-sm text-gray-500 mt-2">Job: {manifest.jobNumber}</span>
          )}
        </div>
      </div>

      {/* Live Map */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="h-[400px]">
          <Map pings={pings} />
        </div>
      </div>

      {/* Trip Details */}
      <Card>
        <CardHeader>
          <CardTitle>Trip Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div>
            <span className="font-medium text-gray-700">Status:</span>{" "}
            <span className="text-gray-900 capitalize">{manifest.status || "Unknown"}</span>
          </div>
          {manifest.route && (
            <div>
              <span className="font-medium text-gray-700">Route:</span>{" "}
              <span className="text-gray-900">{manifest.route.name}</span>
            </div>
          )}
          {manifest.location && (
            <div>
              <span className="font-medium text-gray-700">Destination:</span>{" "}
              <span className="text-gray-900">
                {manifest.location.description || "Location"}
              </span>
            </div>
          )}
          {manifest.scheduledAt && (
            <div>
              <span className="font-medium text-gray-700">Scheduled:</span>{" "}
              <span className="text-gray-900">
                {new Date(manifest.scheduledAt).toLocaleString()}
              </span>
            </div>
          )}
          {isConnected && (
            <div className="flex items-center gap-2 mt-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-gray-500">Live tracking active</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <QuickActions manifestId={manifest.id} />
        </CardContent>
      </Card>
    </div>
  );
}

