// src/app/dashboard/clients/page.tsx
'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ClientsPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to card view by default
    router.replace('/dashboard/clients/card-view');
  }, [router]);

  // Show loading state while redirecting
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading clients...</p>
      </div>
    </div>
  );
}
