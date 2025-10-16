// src/app/dashboard/contacts/page.tsx
'use client';

import { Building, Mail, Phone, Users } from 'lucide-react';

export default function ContactsPage() {
  return (
    <div className="p-6">
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-2">
          <Phone className="w-8 h-8 text-amber-600" />
          <h1 className="text-3xl font-bold text-gray-900">Contacts</h1>
        </div>
        <p className="text-gray-600">Manage client contacts, suppliers, and communication</p>
      </div>

      {/* Placeholder Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="text-center">
          <Phone className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Contact Management</h2>
          <p className="text-gray-600 mb-6">
            This page will handle contact databases, communication logs, 
            and relationship management with clients and partners.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
            <div className="bg-gray-50 p-4 rounded-lg">
              <Users className="w-6 h-6 text-amber-600 mb-2" />
              <h3 className="font-medium text-gray-900">Contact Directory</h3>
              <p className="text-sm text-gray-600">Manage client and supplier contacts</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <Mail className="w-6 h-6 text-amber-600 mb-2" />
              <h3 className="font-medium text-gray-900">Communication Log</h3>
              <p className="text-sm text-gray-600">Track all communications and interactions</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <Building className="w-6 h-6 text-amber-600 mb-2" />
              <h3 className="font-medium text-gray-900">Organization Profiles</h3>
              <p className="text-sm text-gray-600">Manage company and organization details</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
