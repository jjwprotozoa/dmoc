// src/app/dashboard/convoys/page.tsx
'use client';

import { MapPin, Shield, Truck, Users } from 'lucide-react';

export default function ConvoysPage() {
  return (
    <div className="p-6">
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-2">
          <Truck className="w-8 h-8 text-amber-600" />
          <h1 className="text-3xl font-bold text-gray-900">Convoys</h1>
        </div>
        <p className="text-gray-600">Manage convoy operations and multi-vehicle coordination</p>
      </div>

      {/* Placeholder Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="text-center">
          <Truck className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Convoy Management</h2>
          <p className="text-gray-600 mb-6">
            This page will handle convoy planning, vehicle coordination, 
            and group transportation operations.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
            <div className="bg-gray-50 p-4 rounded-lg">
              <Users className="w-6 h-6 text-amber-600 mb-2" />
              <h3 className="font-medium text-gray-900">Convoy Formation</h3>
              <p className="text-sm text-gray-600">Plan and organize convoy groups</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <MapPin className="w-6 h-6 text-amber-600 mb-2" />
              <h3 className="font-medium text-gray-900">Route Coordination</h3>
              <p className="text-sm text-gray-600">Synchronize routes and timing</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <Shield className="w-6 h-6 text-amber-600 mb-2" />
              <h3 className="font-medium text-gray-900">Security Protocols</h3>
              <p className="text-sm text-gray-600">Manage convoy security and safety</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
