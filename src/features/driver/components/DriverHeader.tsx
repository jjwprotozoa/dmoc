// src/features/driver/components/DriverHeader.tsx
"use client";

import { LogOut, User } from "lucide-react";
import { signOut } from "next-auth/react";
import { useState } from "react";
import { useTheme } from "@/contexts/ThemeContext";

export function DriverHeader({ 
  name, 
  email, 
  tenantSlug
}: { 
  name: string; 
  email?: string;
  tenantSlug?: string;
}) {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { theme } = useTheme();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left side - Title */}
          <div className="flex items-center space-x-4">
            <h1 className="text-lg font-semibold text-gray-900">Driver App</h1>
          </div>

          {/* Right side - User menu */}
          <div className="flex items-center space-x-4">
            {/* User menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-3 p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  theme.primary === 'blue' ? 'bg-gradient-to-br from-blue-500 to-blue-600' :
                  theme.primary === 'red' ? 'bg-gradient-to-br from-red-500 to-red-600' :
                  'bg-gradient-to-br from-amber-500 to-amber-600'
                }`}>
                  <User className="h-4 w-4 text-white" />
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-gray-900">
                    {name}
                  </p>
                  {email && (
                    <p className="text-xs text-gray-500">
                      Driver {tenantSlug ? `• ${tenantSlug}` : ""}
                    </p>
                  )}
                </div>
              </button>

              {/* User dropdown */}
              {showUserMenu && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setShowUserMenu(false)}
                  />
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">
                        {name}
                      </p>
                      {email && (
                        <p className="text-xs text-gray-500">{email}</p>
                      )}
                      <p className="text-xs text-gray-500">Driver</p>
                    </div>
                    <button
                      onClick={() => signOut()}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Sign out</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

