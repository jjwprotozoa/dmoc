// src/app/dashboard/trackers/page.tsx
'use client';

import {
  Radar,
  MapPin,
  Signal,
  Battery,
  Clock,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';

export default function TrackersPage() {
  // Mock data - replace with actual data from your API
  const trackers = [
    {
      id: '1',
      deviceId: 'TRK-001',
      vehicleId: 'ABC-123',
      status: 'Online',
      signal: 95,
      battery: 78,
      lastPing: '30 seconds ago',
      location: 'Johannesburg, SA',
      speed: 65,
      heading: 'South',
      temperature: 24,
    },
    {
      id: '2',
      deviceId: 'TRK-002',
      vehicleId: 'XYZ-789',
      status: 'Online',
      signal: 87,
      battery: 45,
      lastPing: '1 minute ago',
      location: 'Cape Town, SA',
      speed: 0,
      heading: 'North',
      temperature: 22,
    },
    {
      id: '3',
      deviceId: 'TRK-003',
      vehicleId: 'DEF-456',
      status: 'Offline',
      signal: 0,
      battery: 12,
      lastPing: '2 hours ago',
      location: 'Durban, SA',
      speed: 0,
      heading: 'Unknown',
      temperature: 0,
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Online':
        return 'bg-green-100 text-green-800';
      case 'Offline':
        return 'bg-red-100 text-red-800';
      case 'Low Battery':
        return 'bg-amber-100 text-amber-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getSignalColor = (signal: number) => {
    if (signal >= 80) return 'text-green-600';
    if (signal >= 60) return 'text-amber-600';
    return 'text-red-600';
  };

  const getBatteryColor = (battery: number) => {
    if (battery >= 50) return 'text-green-600';
    if (battery >= 20) return 'text-amber-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">GPS Tracking</h1>
          <p className="text-gray-600">
            Monitor vehicle locations and tracking devices
          </p>
        </div>
        <div className="flex space-x-3">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Refresh All
          </button>
          <button className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors">
            Add Tracker
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <Radar className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Total Trackers
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {trackers.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Online</p>
              <p className="text-2xl font-bold text-gray-900">
                {trackers.filter((t) => t.status === 'Online').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <AlertTriangle className="h-8 w-8 text-red-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Offline</p>
              <p className="text-2xl font-bold text-gray-900">
                {trackers.filter((t) => t.status === 'Offline').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <Battery className="h-8 w-8 text-amber-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Low Battery</p>
              <p className="text-2xl font-bold text-gray-900">
                {trackers.filter((t) => t.battery < 20).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Trackers List */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Tracking Devices
          </h2>
        </div>

        <div className="divide-y divide-gray-200">
          {trackers.map((tracker) => (
            <div
              key={tracker.id}
              className="p-6 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <Radar className="h-6 w-6 text-gray-400" />
                    <h3 className="text-lg font-medium text-gray-900">
                      {tracker.deviceId}
                    </h3>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(tracker.status)}`}
                    >
                      {tracker.status}
                    </span>
                    {tracker.battery < 20 && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        <Battery className="h-3 w-3 mr-1" />
                        Low Battery
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-gray-600">
                    Vehicle: {tracker.vehicleId} • {tracker.location}
                  </p>
                  <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center">
                      <Signal className="h-4 w-4 mr-2 text-gray-400" />
                      <span className={getSignalColor(tracker.signal)}>
                        {tracker.signal}% signal
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Battery className="h-4 w-4 mr-2 text-gray-400" />
                      <span className={getBatteryColor(tracker.battery)}>
                        {tracker.battery}% battery
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2 text-gray-400" />
                      <span className="text-gray-500">{tracker.lastPing}</span>
                    </div>
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                      <span className="text-gray-500">
                        {tracker.speed} km/h {tracker.heading}
                      </span>
                    </div>
                  </div>
                  {tracker.temperature > 0 && (
                    <div className="mt-2 text-xs text-gray-400">
                      Temperature: {tracker.temperature}°C
                    </div>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <button className="px-3 py-1 text-sm bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-colors">
                    View Details
                  </button>
                  <button className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 transition-colors">
                    Track Live
                  </button>
                  {tracker.battery < 20 && (
                    <button className="px-3 py-1 text-sm bg-red-100 text-red-800 rounded-lg hover:bg-red-200 transition-colors">
                      Replace Battery
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
