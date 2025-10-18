// src/app/dashboard/incidents/page.tsx
'use client';

import { AlertTriangle, Clock, FileText, Shield } from 'lucide-react';

export default function IncidentsPage() {
  return (
    <div className="p-6">
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-2">
          <AlertTriangle className="w-8 h-8 text-amber-600" />
          <h1 className="text-3xl font-bold text-gray-900">Incident Reports</h1>
        </div>
        <p className="text-gray-600">
          Track and manage safety incidents and reports
        </p>
      </div>

      {/* Placeholder Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Incident Management
          </h2>
          <p className="text-gray-600 mb-6">
            This page will handle incident reporting, investigation tracking,
            and safety compliance monitoring.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
            <div className="bg-gray-50 p-4 rounded-lg">
              <FileText className="w-6 h-6 text-amber-600 mb-2" />
              <h3 className="font-medium text-gray-900">Incident Reports</h3>
              <p className="text-sm text-gray-600">
                Create and manage incident documentation
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <Clock className="w-6 h-6 text-amber-600 mb-2" />
              <h3 className="font-medium text-gray-900">Response Tracking</h3>
              <p className="text-sm text-gray-600">
                Monitor incident response times and actions
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <Shield className="w-6 h-6 text-amber-600 mb-2" />
              <h3 className="font-medium text-gray-900">Safety Compliance</h3>
              <p className="text-sm text-gray-600">
                Ensure adherence to safety protocols
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
