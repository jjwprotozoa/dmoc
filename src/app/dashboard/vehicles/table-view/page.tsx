// src/app/dashboard/vehicles/table-view/page.tsx
'use client';

import { Car, Clock, Fuel, MapPin, Wrench } from 'lucide-react';

export default function VehiclesTableViewPage() {
  // Mock data - replace with actual data from your API
  const vehicles = [
    {
      id: '1',
      plateNumber: 'ABC-123',
      type: 'Semi-Truck',
      status: 'Active',
      location: 'Johannesburg, SA',
      lastSeen: '2 minutes ago',
      fuelLevel: 85,
      maintenanceDue: false,
      driver: 'John Doe'
    },
    {
      id: '2',
      plateNumber: 'XYZ-789',
      type: 'Delivery Van',
      status: 'In Transit',
      location: 'Cape Town, SA',
      lastSeen: '5 minutes ago',
      fuelLevel: 45,
      maintenanceDue: true,
      driver: 'Jane Smith'
    },
    {
      id: '3',
      plateNumber: 'DEF-456',
      type: 'Semi-Truck',
      status: 'Maintenance',
      location: 'Durban, SA',
      lastSeen: '1 hour ago',
      fuelLevel: 90,
      maintenanceDue: false,
      driver: 'Mike Johnson'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800';
      case 'In Transit':
        return 'bg-blue-100 text-blue-800';
      case 'Maintenance':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-3">
          <Car className="w-6 h-6 sm:w-8 sm:h-8 text-amber-600" />
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Fleet Management (Table View)</h1>
            <p className="text-sm sm:text-base text-gray-600">Monitor and manage your vehicle fleet</p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
          <a 
            href="/dashboard/vehicles" 
            className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-full hover:bg-blue-200 transition-colors"
          >
            Back to Vehicles
          </a>
          <button className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors text-sm sm:text-base">
            Add Vehicle
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <Car className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
            <div className="ml-2 sm:ml-4">
              <p className="text-xs sm:text-sm font-medium text-gray-600">Total Vehicles</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900">{vehicles.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <MapPin className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
            <div className="ml-2 sm:ml-4">
              <p className="text-xs sm:text-sm font-medium text-gray-600">Active</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900">
                {vehicles.filter(v => v.status === 'Active').length}
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
                {vehicles.filter(v => v.status === 'In Transit').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <Wrench className="h-6 w-6 sm:h-8 sm:w-8 text-red-600" />
            <div className="ml-2 sm:ml-4">
              <p className="text-xs sm:text-sm font-medium text-gray-600">Maintenance</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900">
                {vehicles.filter(v => v.status === 'Maintenance').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Vehicles List */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900">Vehicle Fleet</h2>
        </div>
        
        <div className="divide-y divide-gray-200">
          {vehicles.map((vehicle) => (
            <div key={vehicle.id} className="p-4 sm:p-6 hover:bg-gray-50 transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <Car className="h-5 w-5 sm:h-6 sm:w-6 text-gray-400" />
                      <h3 className="text-base sm:text-lg font-medium text-gray-900">
                        {vehicle.plateNumber}
                      </h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(vehicle.status)}`}>
                        {vehicle.status}
                      </span>
                      {vehicle.maintenanceDue && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          <Wrench className="h-3 w-3 mr-1" />
                          Maintenance Due
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="mt-1 text-sm text-gray-600">
                    {vehicle.type} • Driver: {vehicle.driver}
                  </p>
                  <div className="mt-2 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 text-sm text-gray-500">
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      {vehicle.location}
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {vehicle.lastSeen}
                    </div>
                    <div className="flex items-center">
                      <Fuel className="h-4 w-4 mr-1" />
                      {vehicle.fuelLevel}%
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button className="px-3 py-1 text-sm bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-colors">
                    View Details
                  </button>
                  <button className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 transition-colors">
                    Track
                  </button>
                  {vehicle.maintenanceDue && (
                    <button className="px-3 py-1 text-sm bg-red-100 text-red-800 rounded-lg hover:bg-red-200 transition-colors">
                      Schedule Service
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
