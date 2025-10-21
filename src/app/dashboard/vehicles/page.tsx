// src/app/dashboard/vehicles/page.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function VehiclesPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to card view by default
    router.replace('/dashboard/vehicles/card-view');
  }, [router]);

  // Show loading state while redirecting
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading vehicles...</p>
      </div>
    </div>
  );
}
