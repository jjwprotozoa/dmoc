// src/components/dashboard/TenantBadge.tsx
// Development-only badge showing tenant scoping status
'use client';

import { useSession } from 'next-auth/react';

export function TenantBadge() {
  // Always call hooks before any conditional returns
  const { data: session } = useSession();

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  if (!session?.user) {
    return null;
  }

  const isAdmin = session.user.role === 'ADMIN';
  const tenantId = session.user.tenantId;
  const tenantSlug = session.user.tenantSlug;

  return (
    <div className="fixed top-4 right-4 z-50 bg-black/80 text-white px-3 py-1.5 rounded-md text-xs font-mono flex items-center gap-2">
      {isAdmin ? (
        <>
          <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
          <span>Admin: cross-tenant view</span>
        </>
      ) : (
        <>
          <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
          <span>Tenant: {tenantSlug || tenantId || 'unknown'} (scoped)</span>
        </>
      )}
    </div>
  );
}
