// FILE: src/app/dashboard/manifests/card-view/page.tsx
// Manifest card view page with comprehensive field display and privacy controls

'use client';

import {
  ArrowLeft,
  Calendar,
  CheckCircle,
  Clock,
  Edit,
  Eye,
  FileText,
  MapPin,
  MoreHorizontal,
  Package,
  Plus,
  RefreshCw,
  Shield,
  Truck,
  XCircle,
} from 'lucide-react';
import { useState } from 'react';
import {
  FilterState,
  ManifestFilters,
} from '../../../../components/dashboard/ManifestFilters';
import { AuthDialog } from '../../../../components/ui/auth-dialog';
import { Button } from '../../../../components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../../../components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../../../components/ui/dropdown-menu';
import { SensitiveDataField } from '../../../../components/ui/sensitive-data-field';
import { PrivacyConfig } from '../../../../lib/privacy';
import { trpc } from '../../../../lib/trpc';

interface ManifestItem {
  id: string;
  title: string | null;
  status: string;
  trackingId: string | null;
  tripStateId: number | null;
  routeId: string | null;
  clientId: string | null;
  transporterId: string | null;
  companyId: string | null;
  horseId: string | null;
  trailerId1: string | null;
  trailerId2: string | null;
  locationId: string | null;
  parkLocationId: string | null;
  countryId: number | null; // Changed from string | null to number | null to match Prisma schema
  invoiceStateId: string | null;
  invoiceNumber: string | null;
  rmn: string | null;
  jobNumber: string | null;
  scheduledAt: string | null;
  dateTimeAdded: string;
  dateTimeUpdated: string | null;
  dateTimeEnded: string | null;
  createdAt: string;
  // Relations
  company?: { id: string; name: string } | null;
  route?: { id: string; name: string } | null;
  invoiceState?: { name: string; code: string } | null;
  location?: {
    id: string;
    description: string;
    latitude: number | null;
    longitude: number | null;
  } | null;
  parkLocation?: {
    id: string;
    description: string;
    latitude: number | null;
    longitude: number | null;
  } | null;
}

export default function ManifestsCardViewPage() {
  const [filters, setFilters] = useState<FilterState>({
    status: [],
    dateRange: 'all',
    staleness: 'all',
    searchQuery: '',
    quickFilter: 'all',
  });
  const [selectedManifests, setSelectedManifests] = useState<string[]>([]);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);
  const [unlockedManifests, setUnlockedManifests] = useState<Set<number>>(
    new Set()
  );
  // Removed unused callContact state - fixed linting errors

  // Privacy controls - in real app this would come from auth system
  const currentUserRole = 'operator'; // Mock role for demo
  const canViewSensitive = ['admin', 'manager'].includes(currentUserRole);

  const privacyConfig: PrivacyConfig = {
    userRole: currentUserRole,
    canViewSensitive,
    unlockedItems: unlockedManifests,
  };

  // Get filter counts
  const { data: filterCounts } = trpc.manifest.getFilterCounts.useQuery();

  const { data, isLoading, error, refetch } = trpc.manifest.list.useQuery({
    q: filters.searchQuery || undefined,
    status: filters.status.length > 0 ? filters.status : undefined,
    dateRange: filters.dateRange !== 'all' ? filters.dateRange : undefined,
    customDateFrom: filters.customDateFrom,
    customDateTo: filters.customDateTo,
    staleness: filters.staleness !== 'all' ? filters.staleness : undefined,
    quickFilter:
      filters.quickFilter !== 'all' ? filters.quickFilter : undefined,
    take: 50,
    skip: 0,
  });

  const manifests = data?.items || [];

  const handleFiltersChange = (newFilters: FilterState) => {
    setFilters(newFilters);
  };

  const handleSelectManifest = (manifestId: string) => {
    setSelectedManifests((prev) =>
      prev.includes(manifestId)
        ? prev.filter((id) => id !== manifestId)
        : [...prev, manifestId]
    );
  };

  const handleManifestAction = (action: string, manifest: ManifestItem) => {
    console.log(`${action} action for manifest:`, manifest.trackingId);
    // TODO: Implement actual action handlers
    switch (action) {
      case 'add':
        // Open add manifest dialog
        break;
      case 'edit':
        // Open edit manifest dialog
        break;
      case 'track':
        // Open tracking interface
        break;
      case 'generate-report':
        // Generate manifest report
        break;
    }
  };

  const handleAuthenticated = () => {
    if (pendingAction) {
      pendingAction();
      setPendingAction(null);
    }
  };

  const handleUnlockManifest = (manifestId: number) => {
    if (canViewSensitive) {
      // Admin/manager can always unlock
      setUnlockedManifests((prev) => new Set([...prev, manifestId]));
    } else {
      // Regular users need authentication for each card
      setPendingAction(
        () => () =>
          setUnlockedManifests((prev) => new Set([...prev, manifestId]))
      );
      setShowAuthDialog(true);
    }
  };

  // Removed unused handleCallContact and handleCall functions

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return 'N/A';

    const now = new Date();
    const dateObj = new Date(dateString);

    if (isNaN(dateObj.getTime())) return 'Invalid date';

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
      return 'Just now';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800';
      case 'SCHEDULED':
        return 'bg-yellow-100 text-yellow-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStalenessBadge = (minutesSinceUpdate: number) => {
    if (minutesSinceUpdate < 30) {
      return { color: 'bg-green-100 text-green-800', label: 'Fresh' };
    } else if (minutesSinceUpdate < 120) {
      return { color: 'bg-yellow-100 text-yellow-800', label: 'Stale' };
    } else {
      return { color: 'bg-red-100 text-red-800', label: 'Old' };
    }
  };

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center text-red-600">
          <XCircle className="mx-auto h-12 w-12 mb-4" />
          <p>Error loading manifests: {error.message}</p>
          <Button onClick={() => refetch()} className="mt-4">
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <div className="page-header">
          <div className="page-header-title">
            <FileText className="w-8 h-8 text-amber-600" />
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Manifests
              </h1>
              <p className="text-gray-600 text-sm sm:text-base">
                Card view • Comprehensive manifest management
              </p>
            </div>
          </div>
          <div className="page-header-actions">
            <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
              Card view
            </span>
            <a
              href="/dashboard/manifests"
              className="inline-flex items-center gap-1 px-3 py-1.5 text-sm bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back to Table</span>
              <span className="sm:hidden">Table</span>
            </a>
          </div>
        </div>

        {/* Privacy Notice */}
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <Shield className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">
              Privacy Notice
            </span>
          </div>
          <p className="text-xs text-blue-700 mt-1">
            Current role:{' '}
            <span className="font-semibold">{currentUserRole}</span> •
            {canViewSensitive ? (
              <span className="text-green-700">
                {' '}
                Full access to sensitive data
              </span>
            ) : (
              <span className="text-orange-700">
                {' '}
                Limited access - each card requires individual authentication
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Modern Filter Component */}
      <ManifestFilters
        filters={filters}
        counts={
          filterCounts || {
            all: 0,
            active: 0,
            waiting: 0,
            breakdown: 0,
            accident: 0,
            logistical: 0,
            closed: 0,
            handed_over: 0,
            foreign: 0,
            total: 0,
          }
        }
        onFiltersChange={handleFiltersChange}
        onRefresh={() => refetch()}
        isLoading={isLoading}
      />

      {/* Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="text-sm text-gray-600">
            Showing {manifests.length} manifests
            {selectedManifests.length > 0 && (
              <span className="ml-2 text-amber-600">
                • {selectedManifests.length} selected
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleManifestAction('add', {} as ManifestItem)}
              className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors flex items-center space-x-2 w-full sm:w-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Add Manifest</span>
            </button>
          </div>
        </div>
      </div>

      {/* Manifests Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 mb-8">
        {manifests.map((manifest: ManifestItem) => {
          const now = typeof window !== 'undefined' ? Date.now() : 0;
          const minutesSinceUpdate = manifest.dateTimeUpdated
            ? Math.floor(
                (now - new Date(manifest.dateTimeUpdated).getTime()) /
                  (1000 * 60)
              )
            : 999;

          const staleness = getStalenessBadge(minutesSinceUpdate);
          const manifestIdNumber = parseInt(manifest.id.slice(-8), 16);
          // Removed unused isUnlocked variable

          return (
            <div
              key={manifest.id}
              className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow ${
                selectedManifests.includes(manifest.id)
                  ? 'ring-2 ring-amber-500 bg-amber-50'
                  : ''
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={selectedManifests.includes(manifest.id)}
                    onChange={(e) => {
                      e.stopPropagation();
                      handleSelectManifest(manifest.id);
                    }}
                    className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                  />
                  <div className="flex items-center space-x-2">
                    <FileText className="w-4 h-4 text-amber-600" />
                    <div>
                      <h3 className="font-semibold text-gray-900 text-sm leading-tight">
                        {manifest.title || manifest.trackingId || 'Untitled'}
                      </h3>
                      <p className="text-xs text-gray-500">
                        {manifest.trackingId
                          ? `ID: ${manifest.trackingId}`
                          : 'No tracking ID'}
                      </p>
                    </div>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="h-6 w-6 p-0"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreHorizontal className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Manifest Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => handleManifestAction('edit', manifest)}
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Manifest
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => handleManifestAction('track', manifest)}
                    >
                      <MapPin className="mr-2 h-4 w-4" />
                      Track Manifest
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() =>
                        handleManifestAction('generate-report', manifest)
                      }
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      Generate Report
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="space-y-2">
                {/* Status */}
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">Status:</span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(manifest.status)}`}
                  >
                    {manifest.status}
                  </span>
                </div>

                {/* Company */}
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">Company:</span>
                  <span className="text-gray-900 truncate max-w-24">
                    {manifest.company?.name || 'N/A'}
                  </span>
                </div>

                {/* Route */}
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">Route:</span>
                  <span className="text-gray-900 truncate max-w-24">
                    {manifest.route?.name || 'N/A'}
                  </span>
                </div>

                {/* Job Number */}
                <SensitiveDataField
                  label="Job Number"
                  value={manifest.jobNumber || 'N/A'}
                  type="id"
                  config={privacyConfig}
                  itemId={manifestIdNumber}
                  onUnlock={() => handleUnlockManifest(manifestIdNumber)}
                />

                {/* RMN */}
                <SensitiveDataField
                  label="RMN"
                  value={manifest.rmn || 'N/A'}
                  type="id"
                  config={privacyConfig}
                  itemId={manifestIdNumber}
                  onUnlock={() => handleUnlockManifest(manifestIdNumber)}
                />

                {/* Scheduled Time */}
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">Scheduled:</span>
                  <span className="text-gray-900">
                    {formatDate(manifest.scheduledAt)}
                  </span>
                </div>

                {/* Last Update */}
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">Updated:</span>
                  <span className="text-gray-900">
                    {formatDate(manifest.dateTimeUpdated)}
                  </span>
                </div>

                {/* Staleness */}
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">Staleness:</span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${staleness.color}`}
                  >
                    {staleness.label}
                  </span>
                </div>

                {/* Invoice State */}
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">Invoice:</span>
                  <span className="text-gray-900">
                    {manifest.invoiceState?.name || 'N/A'}
                  </span>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    Added {formatDate(manifest.dateTimeAdded)}
                  </span>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-6 px-2 text-xs"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        View Details
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle className="flex items-center space-x-2">
                          <FileText className="w-6 h-6 text-amber-600" />
                          <span>
                            Manifest Details -{' '}
                            {manifest.trackingId || 'Untitled'}
                          </span>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(manifest.status)}`}
                          >
                            {manifest.status}
                          </span>
                        </DialogTitle>
                        <DialogDescription>
                          Complete manifest information and operational details
                        </DialogDescription>
                      </DialogHeader>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                        {/* Basic Information */}
                        <div className="space-y-4">
                          <h3 className="font-semibold text-gray-900">
                            Basic Information
                          </h3>
                          <div className="space-y-3">
                            <div>
                              <label className="text-sm font-medium text-gray-500">
                                Title
                              </label>
                              <p className="text-gray-900">
                                {manifest.title || 'N/A'}
                              </p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-gray-500">
                                Tracking ID
                              </label>
                              <p className="text-gray-900 font-mono">
                                {manifest.trackingId || 'N/A'}
                              </p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-gray-500">
                                Status
                              </label>
                              <p className="text-gray-900">{manifest.status}</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-gray-500">
                                Company
                              </label>
                              <p className="text-gray-900">
                                {manifest.company?.name || 'N/A'}
                              </p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-gray-500">
                                Route
                              </label>
                              <p className="text-gray-900">
                                {manifest.route?.name || 'N/A'}
                              </p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-gray-500">
                                Scheduled At
                              </label>
                              <p className="text-gray-900">
                                {manifest.scheduledAt
                                  ? new Date(
                                      manifest.scheduledAt
                                    ).toLocaleString()
                                  : 'N/A'}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Sensitive Information */}
                        <div className="space-y-4">
                          <h3 className="font-semibold text-gray-900">
                            Operational Details
                          </h3>
                          <div className="space-y-3">
                            <SensitiveDataField
                              label="Job Number"
                              value={manifest.jobNumber || 'N/A'}
                              type="id"
                              config={privacyConfig}
                              itemId={manifestIdNumber}
                              onUnlock={() =>
                                handleUnlockManifest(manifestIdNumber)
                              }
                            />
                            <SensitiveDataField
                              label="RMN"
                              value={manifest.rmn || 'N/A'}
                              type="id"
                              config={privacyConfig}
                              itemId={manifestIdNumber}
                              onUnlock={() =>
                                handleUnlockManifest(manifestIdNumber)
                              }
                            />
                            <div>
                              <label className="text-sm font-medium text-gray-500">
                                Trip State ID
                              </label>
                              <p className="text-gray-900">
                                {manifest.tripStateId || 'N/A'}
                              </p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-gray-500">
                                Client ID
                              </label>
                              <p className="text-gray-900">
                                {manifest.clientId || 'N/A'}
                              </p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-gray-500">
                                Transporter ID
                              </label>
                              <p className="text-gray-900">
                                {manifest.transporterId || 'N/A'}
                              </p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-gray-500">
                                Invoice Number
                              </label>
                              <p className="text-gray-900">
                                {manifest.invoiceNumber || 'N/A'}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Vehicle Information */}
                      <div className="mt-6 pt-6 border-t border-gray-200">
                        <h3 className="font-semibold text-gray-900 mb-4">
                          Vehicle Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <div className="flex items-center space-x-2 mb-2">
                              <Truck className="w-4 h-4 text-blue-600" />
                              <span className="text-sm font-medium text-gray-700">
                                Horse ID
                              </span>
                            </div>
                            <p className="text-lg font-bold text-gray-900">
                              {manifest.horseId || 'N/A'}
                            </p>
                          </div>
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <div className="flex items-center space-x-2 mb-2">
                              <Package className="w-4 h-4 text-green-600" />
                              <span className="text-sm font-medium text-gray-700">
                                Trailer 1
                              </span>
                            </div>
                            <p className="text-lg font-bold text-gray-900">
                              {manifest.trailerId1 || 'N/A'}
                            </p>
                          </div>
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <div className="flex items-center space-x-2 mb-2">
                              <Package className="w-4 h-4 text-orange-600" />
                              <span className="text-sm font-medium text-gray-700">
                                Trailer 2
                              </span>
                            </div>
                            <p className="text-lg font-bold text-gray-900">
                              {manifest.trailerId2 || 'N/A'}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Location Information */}
                      <div className="mt-6 pt-6 border-t border-gray-200">
                        <h3 className="font-semibold text-gray-900 mb-4">
                          Location Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <div className="flex items-center space-x-2 mb-2">
                              <MapPin className="w-4 h-4 text-purple-600" />
                              <span className="text-sm font-medium text-gray-700">
                                Current Location
                              </span>
                            </div>
                            <p className="text-lg font-bold text-gray-900">
                              {manifest.location?.description || 'N/A'}
                            </p>
                            {manifest.location?.latitude &&
                              manifest.location?.longitude && (
                                <p className="text-xs text-gray-500 mt-1">
                                  {manifest.location.latitude.toFixed(4)},{' '}
                                  {manifest.location.longitude.toFixed(4)}
                                </p>
                              )}
                          </div>
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <div className="flex items-center space-x-2 mb-2">
                              <MapPin className="w-4 h-4 text-indigo-600" />
                              <span className="text-sm font-medium text-gray-700">
                                Park Location
                              </span>
                            </div>
                            <p className="text-lg font-bold text-gray-900">
                              {manifest.parkLocation?.description || 'N/A'}
                            </p>
                            {manifest.parkLocation?.latitude &&
                              manifest.parkLocation?.longitude && (
                                <p className="text-xs text-gray-500 mt-1">
                                  {manifest.parkLocation.latitude.toFixed(4)},{' '}
                                  {manifest.parkLocation.longitude.toFixed(4)}
                                </p>
                              )}
                          </div>
                        </div>
                      </div>

                      {/* Timestamps */}
                      <div className="mt-6 pt-6 border-t border-gray-200">
                        <h3 className="font-semibold text-gray-900 mb-4">
                          Timeline
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <div className="flex items-center space-x-2 mb-2">
                              <Clock className="w-4 h-4 text-green-600" />
                              <span className="text-sm font-medium text-gray-700">
                                Date Added
                              </span>
                            </div>
                            <p className="text-lg font-bold text-gray-900">
                              {manifest.dateTimeAdded
                                ? new Date(
                                    manifest.dateTimeAdded
                                  ).toLocaleString()
                                : 'N/A'}
                            </p>
                          </div>
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <div className="flex items-center space-x-2 mb-2">
                              <Calendar className="w-4 h-4 text-blue-600" />
                              <span className="text-sm font-medium text-gray-700">
                                Last Updated
                              </span>
                            </div>
                            <p className="text-lg font-bold text-gray-900">
                              {manifest.dateTimeUpdated
                                ? new Date(
                                    manifest.dateTimeUpdated
                                  ).toLocaleString()
                                : 'N/A'}
                            </p>
                          </div>
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <div className="flex items-center space-x-2 mb-2">
                              <CheckCircle className="w-4 h-4 text-red-600" />
                              <span className="text-sm font-medium text-gray-700">
                                Date Ended
                              </span>
                            </div>
                            <p className="text-lg font-bold text-gray-900">
                              {manifest.dateTimeEnded
                                ? new Date(
                                    manifest.dateTimeEnded
                                  ).toLocaleString()
                                : 'N/A'}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex justify-end space-x-2 mt-6 pt-6 border-t border-gray-200">
                        <Button
                          variant="outline"
                          onClick={() => handleManifestAction('edit', manifest)}
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Edit Manifest
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() =>
                            handleManifestAction('track', manifest)
                          }
                        >
                          <MapPin className="w-4 h-4 mr-2" />
                          Track Manifest
                        </Button>
                        <Button
                          onClick={() =>
                            handleManifestAction('generate-report', manifest)
                          }
                        >
                          <FileText className="w-4 h-4 mr-2" />
                          Generate Report
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {manifests.length === 0 && !isLoading && (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No manifests found
          </h3>
          <p className="text-gray-500">
            {filters.searchQuery
              ? 'Try adjusting your search criteria'
              : 'No manifests have been added yet'}
          </p>
        </div>
      )}

      {isLoading && (
        <div className="text-center py-8">
          <RefreshCw className="mx-auto h-8 w-8 animate-spin mb-4" />
          <p>Loading manifests...</p>
        </div>
      )}

      {/* Feature Cards */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <MapPin className="w-8 h-8 text-amber-600 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Real-time Tracking
          </h3>
          <p className="text-gray-600 mb-4">
            Monitor manifest locations and progress
          </p>
          <button className="text-amber-600 hover:text-amber-700 font-medium">
            View Tracking →
          </button>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <FileText className="w-8 h-8 text-amber-600 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Manifest Reports
          </h3>
          <p className="text-gray-600 mb-4">
            Generate comprehensive manifest reports
          </p>
          <button className="text-amber-600 hover:text-amber-700 font-medium">
            Generate Reports →
          </button>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <Shield className="w-8 h-8 text-amber-600 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Privacy Controls
          </h3>
          <p className="text-gray-600 mb-4">
            Manage sensitive data access and compliance
          </p>
          <button className="text-amber-600 hover:text-amber-700 font-medium">
            View Privacy →
          </button>
        </div>
      </div>

      {/* Authentication Dialog */}
      <AuthDialog
        open={showAuthDialog}
        onOpenChange={setShowAuthDialog}
        onAuthenticated={handleAuthenticated}
        title="View Sensitive Information"
        description="Please authenticate to view unmasked manifest details for this specific manifest"
      />
    </div>
  );
}
