// src/features/driver/components/DriverIncidentsList.tsx
// Client component showing driver's reported incidents and events

"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Fuel, FileText, CheckCircle, Camera } from "lucide-react";
import Link from "next/link";
// Helper function for relative time formatting
function formatRelativeTime(date: Date | string): string {
  const now = new Date();
  const then = new Date(date);
  const diffMs = now.getTime() - then.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? "s" : ""} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`;
  return then.toLocaleDateString();
}

export function DriverIncidentsList() {
  // TODO: Add getMyEvents query to driver router
  // For now, show a placeholder message since event storage isn't fully implemented
  interface DriverEvent {
    id: string;
    type: string;
    manifestId?: string;
    createdAt?: string | Date;
    payload?: Record<string, unknown>;
  }
  const events: DriverEvent[] = []; // Will be populated when backend is ready

  if (events.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
        <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500 mb-2">No reports yet</p>
        <p className="text-sm text-gray-400">
          Your incident reports, fuel logs, and other events will appear here
        </p>
      </div>
    );
  }

  const getEventIcon = (type: string) => {
    switch (type) {
      case "incident":
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case "fuel":
        return <Fuel className="h-5 w-5 text-blue-500" />;
      case "pod":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "note":
        return <Camera className="h-5 w-5 text-purple-500" />;
      default:
        return <FileText className="h-5 w-5 text-gray-500" />;
    }
  };

  const getEventTypeLabel = (type: string) => {
    switch (type) {
      case "incident":
        return "Incident";
      case "fuel":
        return "Fuel Log";
      case "pod":
        return "Proof of Delivery";
      case "note":
        return "Media Upload";
      default:
        return "Report";
    }
  };

  return (
    <div className="space-y-4">
      {events.map((event) => (
        <Card key={event.id} className="hover:shadow-md transition">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getEventIcon(event.type)}
                <CardTitle className="text-base">
                  {getEventTypeLabel(event.type)}
                </CardTitle>
              </div>
              <span className="text-xs text-gray-500">
                {event.createdAt ? formatRelativeTime(event.createdAt) : ""}
              </span>
            </div>
          </CardHeader>
          <CardContent>
            {event.manifestId && (
              <Link
                href={`/driver/trips/${event.manifestId}`}
                className="text-sm text-blue-600 hover:underline"
              >
                View Trip →
              </Link>
            )}
            {event.payload && (
              <div className="mt-2 text-sm text-gray-600">
                {/* Render payload based on event type */}
                {event.type === "incident" && (
                  <div>
                    <p>
                      <span className="font-medium">Severity:</span>{" "}
                      {String(event.payload.severity || "N/A")}
                    </p>
                    {event.payload.description && typeof event.payload.description === "string" && (
                      <p className="mt-1">{event.payload.description}</p>
                    )}
                  </div>
                )}
                {event.type === "fuel" && (
                  <div>
                    <p>
                      <span className="font-medium">Liters:</span>{" "}
                      {event.payload.liters ? String(event.payload.liters) : "N/A"}
                    </p>
                    <p>
                      <span className="font-medium">Amount:</span>{" "}
                      {event.payload.amount
                        ? `R${String(event.payload.amount)}`
                        : "N/A"}
                    </p>
                  </div>
                )}
                {event.type === "pod" && (
                  <div>
                    <p>
                      <span className="font-medium">Recipient:</span>{" "}
                      {String(event.payload.recipient || "N/A")}
                    </p>
                  </div>
                )}
                {event.type === "note" && (
                  <div>
                    {event.payload.note && typeof event.payload.note === "string" && (
                      <p>{event.payload.note}</p>
                    )}
                    {Array.isArray(event.payload.files) && event.payload.files.length > 0 && (
                      <p className="mt-1 text-xs text-gray-500">
                        {event.payload.files.length} file(s) attached
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

