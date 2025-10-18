// src/app/dashboard/manifests/closed/page.tsx
'use client';

import { Archive, Calendar, FileText, Truck, User } from 'lucide-react';

export default function ClosedManifestsPage() {
  return (
    <div className="p-6">
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-2">
          <Archive className="w-8 h-8 text-amber-600" />
          <h1 className="text-3xl font-bold text-gray-900">Closed Manifests</h1>
        </div>
        <p className="text-gray-600">
          Review completed manifests and their final status
        </p>
      </div>

      {/* Placeholder Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="text-center">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Closed Manifests
          </h2>
          <p className="text-gray-600 mb-6">
            This page will display all completed manifests with their final
            status, delivery confirmations, and performance metrics.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
            <div className="bg-gray-50 p-4 rounded-lg">
              <Calendar className="w-6 h-6 text-amber-600 mb-2" />
              <h3 className="font-medium text-gray-900">Completion History</h3>
              <p className="text-sm text-gray-600">
                Track delivery dates and completion times
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <User className="w-6 h-6 text-amber-600 mb-2" />
              <h3 className="font-medium text-gray-900">Driver Performance</h3>
              <p className="text-sm text-gray-600">
                Monitor driver efficiency and compliance
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <Truck className="w-6 h-6 text-amber-600 mb-2" />
              <h3 className="font-medium text-gray-900">Vehicle Utilization</h3>
              <p className="text-sm text-gray-600">
                Analyze vehicle usage and maintenance
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
