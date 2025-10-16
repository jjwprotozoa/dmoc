// src/app/dashboard/countries/page.tsx
'use client';

import { Building, Flag, Globe, Plane } from 'lucide-react';

export default function CountriesPage() {
  return (
    <div className="p-6">
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-2">
          <Globe className="w-8 h-8 text-amber-600" />
          <h1 className="text-3xl font-bold text-gray-900">Countries</h1>
        </div>
        <p className="text-gray-600">Manage international operations and country-specific settings</p>
      </div>

      {/* Placeholder Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="text-center">
          <Globe className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">International Operations</h2>
          <p className="text-gray-600 mb-6">
            This page will handle country-specific regulations, customs procedures, 
            and international logistics operations.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
            <div className="bg-gray-50 p-4 rounded-lg">
              <Flag className="w-6 h-6 text-amber-600 mb-2" />
              <h3 className="font-medium text-gray-900">Country Profiles</h3>
              <p className="text-sm text-gray-600">Manage country-specific information and regulations</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <Plane className="w-6 h-6 text-amber-600 mb-2" />
              <h3 className="font-medium text-gray-900">Customs Procedures</h3>
              <p className="text-sm text-gray-600">Track customs requirements and procedures</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <Building className="w-6 h-6 text-amber-600 mb-2" />
              <h3 className="font-medium text-gray-900">Local Partners</h3>
              <p className="text-sm text-gray-600">Manage international partnerships and agents</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
