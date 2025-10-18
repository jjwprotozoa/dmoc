// src/app/dashboard/routes/page.tsx
'use client';

import {
    Clock,
    CloudLightning,
    MapPin,
    Navigation,
    Route,
    Truck,
} from 'lucide-react';
import { useMemo } from 'react';

export default function RoutesPage() {
  // Mock data - replace with actual data from your API
  const routes = useMemo(() => [
    {
      id: '1',
      name: 'JHB to CPT Express',
      origin: 'Johannesburg',
      destination: 'Cape Town',
      distance: '1,400 km',
      estimatedTime: '14 hours',
      status: 'Active',
      vehicles: 3,
      efficiency: 92,
      lastOptimized: '2 hours ago',
    },
    {
      id: '2',
      name: 'Durban Coastal Route',
      origin: 'Durban',
      destination: 'Port Elizabeth',
      distance: '890 km',
      estimatedTime: '9 hours',
      status: 'Optimizing',
      vehicles: 2,
      efficiency: 87,
      lastOptimized: '30 minutes ago',
    },
    {
      id: '3',
      name: 'Northern Circuit',
      origin: 'Pretoria',
      destination: 'Polokwane',
      distance: '320 km',
      estimatedTime: '3.5 hours',
      status: 'Inactive',
      vehicles: 1,
      efficiency: 95,
      lastOptimized: '1 day ago',
    },
  ], []);

  // Memoize route statistics to prevent unnecessary recalculations
  const routeStats = useMemo(() => ({
    active: routes.filter((r) => r.status === 'Active').length,
    totalVehicles: routes.reduce((sum, r) => sum + r.vehicles, 0),
    averageEfficiency: routes.reduce((sum, r) => sum + r.efficiency, 0) / routes.length,
  }), [routes]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800';
      case 'Optimizing':
        return 'bg-blue-100 text-blue-800';
      case 'Inactive':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getEfficiencyColor = (efficiency: number) => {
    if (efficiency >= 90) return 'text-green-600';
    if (efficiency >= 80) return 'text-amber-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Route Management</h1>
          <p className="text-sm sm:text-base text-gray-600">
            Plan, optimize, and monitor delivery routes
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2">
            <span>Optimize All Routes</span>
          </button>
          <button className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors flex items-center justify-center space-x-2">
            <span>Create Route</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <Route className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Routes</p>
              <p className="text-2xl font-bold text-gray-900">
                {routes.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <Navigation className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Routes</p>
              <p className="text-2xl font-bold text-gray-900">
                {routeStats.active}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <Truck className="h-8 w-8 text-amber-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Total Vehicles
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {routeStats.totalVehicles}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <CloudLightning className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Avg Efficiency
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {Math.round(routeStats.averageEfficiency)}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Routes List */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Route Network</h2>
        </div>

        <div className="divide-y divide-gray-200">
          {routes.map((route) => (
            <div
              key={route.id}
              className="p-6 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <Route className="h-6 w-6 text-gray-400" />
                    <h3 className="text-lg font-medium text-gray-900">
                      {route.name}
                    </h3>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(route.status)}`}
                    >
                      {route.status}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-gray-600">
                    {route.origin} → {route.destination}
                  </p>
                  <div className="mt-2 flex items-center space-x-6 text-sm text-gray-500">
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      {route.distance}
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {route.estimatedTime}
                    </div>
                    <div className="flex items-center">
                      <Truck className="h-4 w-4 mr-1" />
                      {route.vehicles} vehicles
                    </div>
                    <div className="flex items-center">
                      <CloudLightning className="h-4 w-4 mr-1" />
                      <span className={getEfficiencyColor(route.efficiency)}>
                        {route.efficiency}% efficient
                      </span>
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-gray-400">
                    Last optimized: {route.lastOptimized}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="px-3 py-1 text-sm bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-colors">
                    View Map
                  </button>
                  <button className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 transition-colors">
                    Optimize
                  </button>
                  <button className="px-3 py-1 text-sm bg-amber-100 text-amber-800 rounded-lg hover:bg-amber-200 transition-colors">
                    Edit
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
