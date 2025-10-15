// src/components/dashboard/DashboardNav.tsx
'use client';

import { Bell, LogOut, Settings } from 'lucide-react';
import { signOut } from 'next-auth/react';

interface DashboardNavProps {
  user: {
    id: string;
    email: string;
    role: string;
    tenantSlug: string;
  };
}

export function DashboardNav({ user }: DashboardNavProps) {
  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-gray-900">
              LogisticsController
            </h1>
            <span className="ml-2 text-sm text-gray-500">
              ({user.tenantSlug})
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <button className="p-2 text-gray-400 hover:text-gray-500">
              <Bell className="h-5 w-5" />
            </button>
            
            <button className="p-2 text-gray-400 hover:text-gray-500">
              <Settings className="h-5 w-5" />
            </button>

            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-700">{user.email}</span>
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                {user.role}
              </span>
            </div>

            <button
              onClick={() => signOut()}
              className="flex items-center space-x-1 text-gray-500 hover:text-gray-700"
            >
              <LogOut className="h-4 w-4" />
              <span className="text-sm">Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
