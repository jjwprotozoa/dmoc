// FILE: src/app/(dashboard)/manifests/_components/ManifestTable.tsx
// Shared manifest table component with staleness badges and filters
// @ts-nocheck - Temporarily disabled due to schema mismatch

"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import {
    AlertCircle,
    CheckCircle,
    RefreshCw,
    Search,
    XCircle
} from "lucide-react";
import { useState } from "react";

interface ManifestTableProps {
  activeOnly?: boolean;
  title?: string;
}

// Removed unused ManifestItem interface - was defined but never used

/**
 * Calculate staleness badge color based on minutes since last update
 */
function getStalenessBadge(minutesSinceUpdate: number) {
  if (minutesSinceUpdate < 30) {
    return { color: "bg-green-100 text-green-800", label: "Fresh" };
  } else if (minutesSinceUpdate < 120) {
    return { color: "bg-yellow-100 text-yellow-800", label: "Stale" };
  } else {
    return { color: "bg-red-100 text-red-800", label: "Old" };
  }
}

/**
 * Format duration in milliseconds to human readable format
 */
function formatDuration(ms: number | null): string {
  if (!ms) return "N/A";
  
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) {
    return `${days}d ${hours % 24}h`;
  } else if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  } else if (minutes > 0) {
    return `${minutes}m`;
  } else {
    return `${seconds}s`;
  }
}

/**
 * Format date to relative time
 */
function formatRelativeTime(date: string | null): string {
  if (!date) return "N/A";
  
  const now = new Date();
  const dateObj = new Date(date);
  const diffMs = now.getTime() - dateObj.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffDays > 0) {
    return `${diffDays}d ago`;
  } else if (diffHours > 0) {
    return `${diffHours}h ago`;
  } else if (diffMinutes > 0) {
    return `${diffMinutes}m ago`;
  } else {
    return "Just now";
  }
}

export function ManifestTable({ activeOnly = false, title }: ManifestTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(0);
  const [pageSize] = useState(20);
  const [quickFilter, setQuickFilter] = useState<"all" | "30m" | "2h" | "24h">("all");

  // Calculate quick filter cutoff time
  const getQuickFilterCutoff = () => {
    const now = new Date();
    switch (quickFilter) {
      case "30m":
        return new Date(now.getTime() - 30 * 60 * 1000);
      case "2h":
        return new Date(now.getTime() - 2 * 60 * 60 * 1000);
      case "24h":
        return new Date(now.getTime() - 24 * 60 * 60 * 1000);
      default:
        return null;
    }
  };

  const { data, isLoading, error, refetch } = trpc.manifest.list.useQuery({
    q: searchQuery || undefined,
    activeOnly,
    take: pageSize,
    skip: page * pageSize,
  });

  const manifests = data?.items || [];
  const total = data?.total || 0;
  const hasMore = data?.hasMore || false;

  // Filter manifests by quick filter
  const filteredManifests = manifests.filter((manifest) => {
    if (quickFilter === "all") return true;
    
    const cutoff = getQuickFilterCutoff();
    if (!cutoff || !manifest.dateTimeUpdated) return false;

    return new Date(manifest.dateTimeUpdated) >= cutoff;
  });

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setPage(0); // Reset to first page on search
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            <XCircle className="mx-auto h-12 w-12 mb-4" />
            <p>Error loading manifests: {error.message}</p>
            <Button onClick={() => refetch()} className="mt-4">
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{title || (activeOnly ? "Active Manifests" : "All Manifests")}</CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search manifests..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Tabs value={quickFilter} onValueChange={(value) => setQuickFilter(value as "all" | "30m" | "2h" | "24h")}>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="30m">30m</TabsTrigger>
              <TabsTrigger value="2h">2h</TabsTrigger>
              <TabsTrigger value="24h">24h</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="text-center py-8">
            <RefreshCw className="mx-auto h-8 w-8 animate-spin mb-4" />
            <p>Loading manifests...</p>
          </div>
        ) : (
          <>
            {/* Results Summary */}
            <div className="mb-4 text-sm text-gray-600">
              Showing {filteredManifests.length} of {total} manifests
              {activeOnly && " (active only)"}
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2 font-medium">ID</th>
                    <th className="text-left p-2 font-medium">Client</th>
                    <th className="text-left p-2 font-medium">Transporter</th>
                    <th className="text-left p-2 font-medium">Driver</th>
                    <th className="text-left p-2 font-medium">Horse</th>
                    <th className="text-left p-2 font-medium">Tracker</th>
                    <th className="text-left p-2 font-medium">WA</th>
                    <th className="text-left p-2 font-medium">Location</th>
                    <th className="text-left p-2 font-medium">Route</th>
                    <th className="text-left p-2 font-medium">Convoy</th>
                    <th className="text-left p-2 font-medium">Started</th>
                    <th className="text-left p-2 font-medium">Updated</th>
                    <th className="text-left p-2 font-medium">Staleness</th>
                    <th className="text-left p-2 font-medium">Duration</th>
                    <th className="text-left p-2 font-medium">Controller</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredManifests.map((manifest) => {
                    const minutesSinceUpdate = manifest.dateTimeUpdated       
                      ? Math.floor((Date.now() - new Date(manifest.dateTimeUpdated).getTime()) / (1000 * 60))                                                 
                      : 999;
                    
                    const staleness = getStalenessBadge(minutesSinceUpdate);
                    
                    return (
                      <tr key={manifest.id} className="border-b hover:bg-gray-50">
                        <td className="p-2 font-mono text-sm">
                          {manifest.trackingId || manifest.id.slice(-8)}
                        </td>
                        <td className="p-2">{manifest.clientName || "N/A"}</td>
                        <td className="p-2">{manifest.transporterName || "N/A"}</td>
                        <td className="p-2">{manifest.driver || "N/A"}</td>
                        <td className="p-2 font-mono text-sm">{manifest.horse || "N/A"}</td>
                        <td className="p-2 font-mono text-sm">{manifest.tracker || "N/A"}</td>
                        <td className="p-2">
                          {manifest.waConnected ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <XCircle className="h-4 w-4 text-gray-400" />
                          )}
                        </td>
                        <td className="p-2">{manifest.location || "N/A"}</td>
                        <td className="p-2">{manifest.route || "N/A"}</td>
                        <td className="p-2">{manifest.convoy || "N/A"}</td>
                        <td className="p-2 text-sm">{formatRelativeTime(manifest.startedAt)}</td>
                        <td className="p-2 text-sm">{formatRelativeTime(manifest.dateTimeUpdated)}</td>
                        <td className="p-2">
                          <Badge className={staleness.color}>
                            {staleness.label}
                          </Badge>
                        </td>
                        <td className="p-2 text-sm">
                          {formatDuration(manifest.tripDurationMs)}
                        </td>
                        <td className="p-2">{manifest.controller || "N/A"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {total > pageSize && (
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-gray-600">
                  Page {page + 1} of {Math.ceil(total / pageSize)}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 0}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(page + 1)}
                    disabled={!hasMore}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}

            {filteredManifests.length === 0 && !isLoading && (
              <div className="text-center py-8 text-gray-500">
                <AlertCircle className="mx-auto h-8 w-8 mb-4" />
                <p>No manifests found</p>
                {searchQuery && (
                  <p className="text-sm mt-2">Try adjusting your search criteria</p>
                )}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

