// src/app/dashboard/manifests/page.tsx
"use client";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Search, 
  Filter, 
  Calendar, 
  Building2, 
  FileText,
  Plus,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const statusColors = {
  SCHEDULED: "bg-blue-100 text-blue-800 border-blue-200",
  IN_PROGRESS: "bg-yellow-100 text-yellow-800 border-yellow-200", 
  COMPLETED: "bg-green-100 text-green-800 border-green-200",
  CANCELLED: "bg-red-100 text-red-800 border-red-200",
};

export default function ManifestsPage() {
  // Feature flag check
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

  const [q, setQ] = useState("");
  const [status, setStatus] = useState<string[]>([]);
  const { data, isLoading, error } = trpc.manifest.list.useQuery({ 
    q, 
    status, 
    take: 50, 
    skip: 0 
  });

  const toggleStatus = (statusValue: string) => {
    setStatus((prev) => 
      prev.includes(statusValue) 
        ? prev.filter(s => s !== statusValue)
        : [...prev, statusValue]
    );
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manifests</h1>
          <p className="text-muted-foreground">
            Manage your logistics manifests and track deliveries
          </p>
        </div>
        <Button className="w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          New Manifest
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search manifests..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {/* Status Filters */}
            <div className="flex flex-wrap gap-2">
              {Object.keys(statusColors).map((statusValue) => (
                <Button
                  key={statusValue}
                  variant={status.includes(statusValue) ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleStatus(statusValue)}
                  className="text-xs"
                >
                  <Filter className="h-3 w-3 mr-1" />
                  {statusValue.replace('_', ' ')}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {isLoading && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-2 text-muted-foreground">Loading manifests...</span>
            </div>
          </CardContent>
        </Card>
      )}

      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="text-center text-destructive">
              <p className="font-semibold">Error loading manifests</p>
              <p className="text-sm">{error.message}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {!isLoading && !error && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <FileText className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">Total</p>
                    <p className="text-2xl font-bold">{data?.total ?? 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <Calendar className="h-8 w-8 text-yellow-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">Scheduled</p>
                    <p className="text-2xl font-bold">
                      {data?.items?.filter(m => m.status === 'SCHEDULED').length ?? 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <FileText className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">In Progress</p>
                    <p className="text-2xl font-bold">
                      {data?.items?.filter(m => m.status === 'IN_PROGRESS').length ?? 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <Building2 className="h-8 w-8 text-purple-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">Completed</p>
                    <p className="text-2xl font-bold">
                      {data?.items?.filter(m => m.status === 'COMPLETED').length ?? 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Manifests List */}
          <Card>
            <CardHeader>
              <CardTitle>Manifests</CardTitle>
            </CardHeader>
            <CardContent>
              {data?.items?.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No manifests found</h3>
                  <p className="text-muted-foreground mb-4">
                    {q || status.length > 0 
                      ? "Try adjusting your search criteria" 
                      : "Get started by creating your first manifest"
                    }
                  </p>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Manifest
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Desktop Table View */}
                  <div className="hidden lg:block">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left p-4 font-semibold">Title</th>
                            <th className="text-left p-4 font-semibold">Status</th>
                            <th className="text-left p-4 font-semibold">Company</th>
                            <th className="text-left p-4 font-semibold">Scheduled</th>
                            <th className="text-left p-4 font-semibold">Created</th>
                            <th className="text-right p-4 font-semibold">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {data?.items?.map((manifest) => (
                            <tr key={manifest.id} className="border-b hover:bg-muted/50 transition-colors">
                              <td className="p-4">
                                <div className="font-medium">{manifest.title}</div>
                                <div className="text-sm text-muted-foreground">ID: {manifest.id.slice(0, 8)}...</div>
                              </td>
                              <td className="p-4">
                                <Badge 
                                  variant="outline" 
                                  className={statusColors[manifest.status as keyof typeof statusColors]}
                                >
                                  {manifest.status.replace('_', ' ')}
                                </Badge>
                              </td>
                              <td className="p-4">
                                <div className="flex items-center">
                                  <Building2 className="h-4 w-4 text-muted-foreground mr-2" />
                                  {manifest.company?.name ?? "Unknown"}
                                </div>
                              </td>
                              <td className="p-4">
                                <div className="flex items-center">
                                  <Calendar className="h-4 w-4 text-muted-foreground mr-2" />
                                  {manifest.scheduledAt 
                                    ? new Date(manifest.scheduledAt).toLocaleDateString()
                                    : "-"
                                  }
                                </div>
                              </td>
                              <td className="p-4">
                                {new Date(manifest.createdAt).toLocaleDateString()}
                              </td>
                              <td className="p-4">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm">
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem>
                                      <Eye className="h-4 w-4 mr-2" />
                                      View Details
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                      <Edit className="h-4 w-4 mr-2" />
                                      Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="text-destructive">
                                      <Trash2 className="h-4 w-4 mr-2" />
                                      Delete
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Mobile Card View */}
                  <div className="lg:hidden space-y-4">
                    {data?.items?.map((manifest) => (
                      <Card key={manifest.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="pt-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg">{manifest.title}</h3>
                              <p className="text-sm text-muted-foreground">ID: {manifest.id.slice(0, 8)}...</p>
                            </div>
                            <Badge 
                              variant="outline" 
                              className={statusColors[manifest.status as keyof typeof statusColors]}
                            >
                              {manifest.status.replace('_', ' ')}
                            </Badge>
                          </div>
                          
                          <div className="space-y-2 mb-4">
                            <div className="flex items-center text-sm">
                              <Building2 className="h-4 w-4 text-muted-foreground mr-2" />
                              <span className="text-muted-foreground">Company:</span>
                              <span className="ml-2 font-medium">{manifest.company?.name ?? "Unknown"}</span>
                            </div>
                            
                            <div className="flex items-center text-sm">
                              <Calendar className="h-4 w-4 text-muted-foreground mr-2" />
                              <span className="text-muted-foreground">Scheduled:</span>
                              <span className="ml-2 font-medium">
                                {manifest.scheduledAt 
                                  ? new Date(manifest.scheduledAt).toLocaleDateString()
                                  : "Not set"
                                }
                              </span>
                            </div>
                            
                            <div className="flex items-center text-sm">
                              <FileText className="h-4 w-4 text-muted-foreground mr-2" />
                              <span className="text-muted-foreground">Created:</span>
                              <span className="ml-2 font-medium">
                                {new Date(manifest.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="flex-1">
                              <Eye className="h-4 w-4 mr-2" />
                              View
                            </Button>
                            <Button variant="outline" size="sm" className="flex-1">
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem className="text-destructive">
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}