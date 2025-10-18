// src/app/dashboard/manifests/active/page.tsx
'use client';

import { Clock, FileText, MapPin, Truck } from 'lucide-react';
import { useMemo } from 'react';
import { trpc } from '../../../../lib/trpc';

interface Manifest {
  id: string;
  title: string;
  status: string;
  scheduledAt: string;
  createdAt: string;
  company: {
    id: string;
    name: string;
  };
  stops: Array<{
    id: string;
    order: number;
    location: string;
    arrivedAt: string | null;
    departedAt: string | null;
    createdAt: string;
    updatedAt: string;
    manifestId: string;
  }>;
}

export default function ActiveManifestsPage() {
  const { data: manifests, isLoading } = trpc.manifest.getAll.useQuery({});

  // Memoize active manifests filtering to prevent unnecessary recalculations
  const activeManifests = useMemo(() => {
    return manifests?.filter(
      (manifest: Manifest) => manifest.status === 'IN_PROGRESS'
    ) || [];
  }, [manifests]);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Active Manifests</h1>
          <p className="text-sm sm:text-base text-gray-600">
            Manage your active logistics manifests
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-gray-600">
            {activeManifests.length} active
          </span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
            <div className="ml-2 sm:ml-4">
              <p className="text-xs sm:text-sm font-medium text-gray-600">Total Active</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900">
                {activeManifests.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-amber-600" />
            <div className="ml-2 sm:ml-4">
              <p className="text-xs sm:text-sm font-medium text-gray-600">In Transit</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900">
                {
                  activeManifests.filter(
                    (m: Manifest) => m.status === 'IN_PROGRESS'
                  ).length
                }
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <MapPin className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
            <div className="ml-2 sm:ml-4">
              <p className="text-xs sm:text-sm font-medium text-gray-600">Locations</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900">
                {activeManifests.length > 0
                  ? activeManifests[0].stops.length
                  : 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <Truck className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600" />
            <div className="ml-2 sm:ml-4">
              <p className="text-xs sm:text-sm font-medium text-gray-600">Vehicles</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900">
                {activeManifests.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Manifests List */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900">
            Active Manifests
          </h2>
        </div>

        {isLoading ? (
          <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading manifests...</p>
          </div>
        ) : activeManifests.length === 0 ? (
          <div className="p-6 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Active Manifests
            </h3>
            <p className="text-gray-600">
              All manifests are currently completed or inactive.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {activeManifests.map((manifest: Manifest) => (
              <div
                key={manifest.id}
                className="p-4 sm:p-6 hover:bg-gray-50 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                      <h3 className="text-base sm:text-lg font-medium text-gray-900">
                        {manifest.title}
                      </h3>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          manifest.status === 'IN_PROGRESS'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {manifest.status}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-gray-600">
                      Company: {manifest.company.name} • Stops:{' '}
                      {manifest.stops.length}
                    </p>
                    <div className="mt-2 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-gray-500">
                      <span>
                        Scheduled:{' '}
                        {new Date(manifest.scheduledAt).toLocaleDateString()}
                      </span>
                      <span>
                        Created:{' '}
                        {new Date(manifest.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button className="px-3 py-1 text-sm bg-amber-100 text-amber-800 rounded-lg hover:bg-amber-200 transition-colors">
                      View Details
                    </button>
                    <button className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 transition-colors">
                      Track
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
