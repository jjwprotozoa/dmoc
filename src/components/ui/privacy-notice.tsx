// src/components/ui/privacy-notice.tsx
'use client';

import { Shield } from 'lucide-react';

interface PrivacyNoticeProps {
  userRole: string;
  className?: string;
}

export function PrivacyNotice({ userRole, className = '' }: PrivacyNoticeProps) {
  const canViewSensitive = ['admin', 'manager'].includes(userRole.toLowerCase());
  
  return (
    <div className={`p-3 bg-blue-50 border border-blue-200 rounded-lg ${className}`}>
      <div className="flex items-center space-x-2">
        <Shield className="w-4 h-4 text-blue-600" />
        <span className="text-sm font-medium text-blue-900">Privacy Notice</span>
      </div>
      <p className="text-xs text-blue-700 mt-1">
        Current role: <span className="font-semibold">{userRole}</span> • 
        {canViewSensitive ? (
          <span className="text-green-700"> Full access to sensitive data</span>
        ) : (
          <span className="text-orange-700"> Limited access - each item requires individual authentication</span>
        )}
      </p>
    </div>
  );
}
