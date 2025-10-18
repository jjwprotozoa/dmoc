// src/components/dashboard/ManifestsList.tsx
'use client';

import { AlertCircle, CheckCircle, Clock, MapPin, XCircle } from 'lucide-react';

interface Manifest {
  id: string;
  title: string;
  status: string;
  scheduledAt: string;
  stops: Array<{
    id: string;
    order: number;
    location: string; // JSON string: {lat: number, lng: number}
    arrivedAt: string | null;
    departedAt: string | null;
    createdAt: string;
    updatedAt: string;
    manifestId: string;
  }>;
}

interface ManifestsListProps {
  manifests: Manifest[];
  selectedManifest: string | null;
  onSelectManifest: (id: string | null) => void;
}

const statusConfig = {
  SCHEDULED: { icon: Clock, color: 'text-blue-600', bg: 'bg-blue-100' },
  IN_PROGRESS: { icon: MapPin, color: 'text-yellow-600', bg: 'bg-yellow-100' },
  COMPLETED: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100' },
  CANCELLED: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-100' },
};

export function ManifestsList({
  manifests,
  selectedManifest,
  onSelectManifest,
}: ManifestsListProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border h-full overflow-x-hidden max-w-full">
      <div className="p-2 sm:p-3 md:p-4 border-b">
        <h2 className="text-sm sm:text-base md:text-lg font-semibold">Manifests</h2>
      </div>

      <div className="overflow-y-auto h-[calc(100%-3rem)] sm:h-[calc(100%-4rem)] overflow-x-hidden max-w-full">
        {manifests.length === 0 ? (
          <div className="p-2 sm:p-3 md:p-4 text-center text-gray-500">
            <AlertCircle className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-2" />
            <p className="text-xs sm:text-sm">No manifests found</p>
          </div>
        ) : (
          <div className="divide-y">
            {manifests.map((manifest) => {
              const status = manifest.status as keyof typeof statusConfig;
              const config = statusConfig[status] || statusConfig.SCHEDULED;
              const Icon = config.icon;

              return (
                <div
                  key={manifest.id}
                  className={`p-2 sm:p-3 md:p-4 cursor-pointer hover:bg-gray-50 overflow-x-hidden max-w-full ${
                    selectedManifest === manifest.id
                      ? 'bg-blue-50 border-r-2 border-blue-500'
                      : ''
                  }`}
                  onClick={() => onSelectManifest(manifest.id)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 text-xs sm:text-sm md:text-base truncate">
                        {manifest.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-500 mt-1 truncate">
                        {new Date(manifest.scheduledAt).toLocaleDateString()} at{' '}
                        {new Date(manifest.scheduledAt).toLocaleTimeString()}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {manifest.stops.length} stops
                      </p>
                    </div>

                    <div
                      className={`flex items-center space-x-1 ${config.color} flex-shrink-0`}
                    >
                      <Icon className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span
                        className={`text-xs px-1 sm:px-2 py-1 rounded-full ${config.bg} ${config.color} whitespace-nowrap`}
                      >
                        {manifest.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
