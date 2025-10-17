// src/app/dashboard/logistics-officers/page.tsx
'use client';

import { Clipboard, Shield, TrendingUp, Users } from 'lucide-react';

export default function LogisticsOfficersPage() {
  return (
    <div className="p-6">
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-2">
          <Shield className="w-8 h-8 text-amber-600" />
          <h1 className="text-3xl font-bold text-gray-900">
            Logistics Officers
          </h1>
        </div>
        <p className="text-gray-600">
          Manage logistics staff and their operational responsibilities
        </p>
      </div>

      {/* Placeholder Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="text-center">
          <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Officer Management
          </h2>
          <p className="text-gray-600 mb-6">
            This page will handle logistics officer assignments,
            responsibilities, and performance tracking for operational
            oversight.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
            <div className="bg-gray-50 p-4 rounded-lg">
              <Users className="w-6 h-6 text-amber-600 mb-2" />
              <h3 className="font-medium text-gray-900">Officer Profiles</h3>
              <p className="text-sm text-gray-600">
                Manage officer information and roles
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <Clipboard className="w-6 h-6 text-amber-600 mb-2" />
              <h3 className="font-medium text-gray-900">Assignment Tracking</h3>
              <p className="text-sm text-gray-600">
                Monitor officer responsibilities and tasks
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <TrendingUp className="w-6 h-6 text-amber-600 mb-2" />
              <h3 className="font-medium text-gray-900">Performance Metrics</h3>
              <p className="text-sm text-gray-600">
                Track operational efficiency and outcomes
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
