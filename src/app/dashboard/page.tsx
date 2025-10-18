// src/app/dashboard/page.tsx
'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';
import { ActivityFeed } from '../../components/dashboard/ActivityFeed';
import { ManifestsList } from '../../components/dashboard/ManifestsList';
import { InstallPrompt } from '../../components/install/InstallPrompt';
import { trpc } from '../../lib/trpc';

// Dynamically import Map to avoid SSR issues
const Map = dynamic(
  () =>
    import('../../components/map/Map').then((mod) => ({ default: mod.Map })),
  {
    ssr: false,
    loading: () => (
      <div className="h-full bg-gray-100 flex items-center justify-center">
        <p className="text-gray-500">Loading map...</p>
      </div>
    ),
  }
);

export default function DashboardPage() {
  const [selectedManifest, setSelectedManifest] = useState<string | null>(null);

  const { data: manifests } = trpc.manifest.getAll.useQuery({});
  const { data: latestPings } = trpc.tracking.getLatestPings.useQuery({});

  return (
    <div className="space-y-2 sm:space-y-4 md:space-y-6 overflow-x-hidden max-w-full">
      <InstallPrompt />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 sm:gap-4 md:gap-6 overflow-x-hidden max-w-full">
        {/* Left Column - Manifests */}
        <div className="lg:col-span-1 overflow-x-hidden max-w-full">
          <ManifestsList
            manifests={manifests || []}
            selectedManifest={selectedManifest}
            onSelectManifest={setSelectedManifest}
          />
        </div>

        {/* Center Column - Map */}
        <div className="lg:col-span-1 overflow-x-hidden max-w-full">
          <div className="bg-white rounded-lg shadow-sm border relative overflow-hidden h-[300px] sm:h-[400px] md:h-[500px] lg:h-[600px] flex flex-col max-w-full">
            <div className="p-2 sm:p-3 md:p-4 border-b flex-shrink-0">
              <h2 className="text-sm sm:text-base md:text-lg font-semibold">Live Tracking</h2>
            </div>
            <div className="flex-1 relative overflow-hidden max-w-full">
              <Map
                pings={latestPings || []}
                selectedManifest={selectedManifest}
              />
            </div>
          </div>
        </div>

        {/* Right Column - Activity Feed */}
        <div className="lg:col-span-1 overflow-x-hidden max-w-full">
          <ActivityFeed />
        </div>
      </div>
    </div>
  );
}
