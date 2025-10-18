// src/app/dashboard/locations/page.tsx
'use client';

import { Building, Globe, MapPin, Navigation } from 'lucide-react';

export default function LocationsPage() {
  return (
    <div className="p-6">
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-2">
          <MapPin className="w-8 h-8 text-amber-600" />
          <h1 className="text-3xl font-bold text-gray-900">Locations</h1>
        </div>
        <p className="text-gray-600">
          Manage pickup, delivery, and operational locations
        </p>
      </div>

      {/* Placeholder Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="text-center">
          <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Location Management
          </h2>
          <p className="text-gray-600 mb-6">
            This page will handle location databases, geofencing, and
            operational site management.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
            <div className="bg-gray-50 p-4 rounded-lg">
              <Building className="w-6 h-6 text-amber-600 mb-2" />
              <h3 className="font-medium text-gray-900">Facility Management</h3>
              <p className="text-sm text-gray-600">
                Manage warehouses, depots, and facilities
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <Globe className="w-6 h-6 text-amber-600 mb-2" />
              <h3 className="font-medium text-gray-900">Geographic Zones</h3>
              <p className="text-sm text-gray-600">
                Define service areas and boundaries
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <Navigation className="w-6 h-6 text-amber-600 mb-2" />
              <h3 className="font-medium text-gray-900">Route Optimization</h3>
              <p className="text-sm text-gray-600">
                Optimize delivery routes and schedules
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
