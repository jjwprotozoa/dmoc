// src/app/dashboard/transporters/page.tsx
'use client';

import { MapPin, Star, Truck, Users } from 'lucide-react';

export default function TransportersPage() {
  return (
    <div className="p-6">
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-2">
          <Truck className="w-8 h-8 text-amber-600" />
          <h1 className="text-3xl font-bold text-gray-900">Transporters</h1>
        </div>
        <p className="text-gray-600">
          Manage transportation providers and their capabilities
        </p>
      </div>

      {/* Placeholder Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="text-center">
          <Truck className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Transportation Providers
          </h2>
          <p className="text-gray-600 mb-6">
            This page will manage transporter profiles, certifications, fleet
            information, and service capabilities.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
            <div className="bg-gray-50 p-4 rounded-lg">
              <Users className="w-6 h-6 text-amber-600 mb-2" />
              <h3 className="font-medium text-gray-900">Provider Profiles</h3>
              <p className="text-sm text-gray-600">
                Manage transporter company information
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <MapPin className="w-6 h-6 text-amber-600 mb-2" />
              <h3 className="font-medium text-gray-900">Service Areas</h3>
              <p className="text-sm text-gray-600">
                Define coverage regions and routes
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <Star className="w-6 h-6 text-amber-600 mb-2" />
              <h3 className="font-medium text-gray-900">Performance Rating</h3>
              <p className="text-sm text-gray-600">
                Track reliability and service quality
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
