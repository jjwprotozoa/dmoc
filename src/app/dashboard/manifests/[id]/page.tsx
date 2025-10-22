// src/app/dashboard/manifests/[id]/page.tsx
"use client";

import { useParams } from "next/navigation";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, 
  Building2, 
  Calendar, 
  FileText, 
  MapPin,
  Clock,
  CheckCircle,
  XCircle
} from "lucide-react";
import Link from "next/link";

const statusColors = {
  SCHEDULED: "bg-blue-100 text-blue-800 border-blue-200",
  IN_PROGRESS: "bg-yellow-100 text-yellow-800 border-yellow-200", 
  COMPLETED: "bg-green-100 text-green-800 border-green-200",
  CANCELLED: "bg-red-100 text-red-800 border-red-200",
};

const statusIcons = {
  SCHEDULED: Clock,
  IN_PROGRESS: FileText,
  COMPLETED: CheckCircle,
  CANCELLED: XCircle,
};

export default function ManifestDetailPage() {
  // Feature-flag gate: soft-block if disabled
  if (process.env.NEXT_PUBLIC_DMOC_MIGRATION !== "1") {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Migration Feature Disabled</h3>
              <p className="text-muted-foreground">
                Set NEXT_PUBLIC_DMOC_MIGRATION=1 to enable this page
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const params = useParams<{ id: string }>();
  const id = params?.id;

  const { data, isLoading, error } = trpc.manifest.getById.useQuery(
    { id },
    { enabled: Boolean(id) }
  );

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-2 text-muted-foreground">Loading manifest details...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="text-center text-destructive">
              <p className="font-semibold">Error loading manifest</p>
              <p className="text-sm">{error.message}</p>
              <Button asChild className="mt-4">
                <Link href="/dashboard/manifests">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Manifests
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Manifest not found</h3>
              <p className="text-muted-foreground mb-4">
                The manifest you're looking for doesn't exist or you don't have access to it.
              </p>
              <Button asChild>
                <Link href="/dashboard/manifests">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Manifests
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const StatusIcon = statusIcons[data.status as keyof typeof statusIcons] || FileText;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button asChild variant="outline" size="sm">
            <Link href="/dashboard/manifests">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{data.title}</h1>
            <p className="text-muted-foreground">Manifest ID: {data.id}</p>
          </div>
        </div>
        <Badge 
          variant="outline" 
          className={statusColors[data.status as keyof typeof statusColors]}
        >
          <StatusIcon className="h-3 w-3 mr-1" />
          {data.status.replace('_', ' ')}
        </Badge>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Manifest Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Manifest Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Title</label>
                  <p className="text-sm font-medium">{data.title}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Status</label>
                  <div className="mt-1">
                    <Badge 
                      variant="outline" 
                      className={statusColors[data.status as keyof typeof statusColors]}
                    >
                      <StatusIcon className="h-3 w-3 mr-1" />
                      {data.status.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Scheduled Date</label>
                  <p className="text-sm font-medium">
                    {data.scheduledAt 
                      ? new Date(data.scheduledAt).toLocaleString()
                      : "Not scheduled"
                    }
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Created Date</label>
                  <p className="text-sm font-medium">
                    {new Date(data.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Company Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Company Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Company Name</label>
                  <p className="text-sm font-medium">{data.company?.name ?? "Unknown"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Organization</label>
                  <p className="text-sm font-medium">{data.company?.organization?.name ?? "Unknown"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stops/Routes */}
          {data.stops && data.stops.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Route Stops ({data.stops.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data.stops.map((stop, index) => {
                    let location;
                    try {
                      location = JSON.parse(stop.location);
                    } catch {
                      location = { lat: 0, lng: 0 };
                    }
                    
                    return (
                      <div key={stop.id} className="flex items-center gap-4 p-3 border rounded-lg">
                        <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                          {stop.order}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">
                              Stop {stop.order}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            Lat: {location.lat?.toFixed(6)}, Lng: {location.lng?.toFixed(6)}
                          </p>
                          {stop.arrivedAt && (
                            <p className="text-xs text-green-600 mt-1">
                              Arrived: {new Date(stop.arrivedAt).toLocaleString()}
                            </p>
                          )}
                          {stop.departedAt && (
                            <p className="text-xs text-blue-600 mt-1">
                              Departed: {new Date(stop.departedAt).toLocaleString()}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full" variant="outline">
                <FileText className="h-4 w-4 mr-2" />
                Edit Manifest
              </Button>
              <Button className="w-full" variant="outline">
                <MapPin className="h-4 w-4 mr-2" />
                View on Map
              </Button>
              <Button className="w-full" variant="outline">
                <Calendar className="h-4 w-4 mr-2" />
                Update Schedule
              </Button>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium">Created</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(data.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                {data.scheduledAt && (
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <div>
                      <p className="text-sm font-medium">Scheduled</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(data.scheduledAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}
                {data.status === 'COMPLETED' && (
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div>
                      <p className="text-sm font-medium">Completed</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(data.updatedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
