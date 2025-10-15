// src/app/(dashboard)/layout.tsx
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import React from 'react';
import { DashboardNav } from '../../components/dashboard/DashboardNav';
import { authOptions } from '../../lib/auth';

interface User {
  id: string;
  email: string;
  name?: string;
  role: string;
  tenantSlug: string;
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/sign-in');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNav user={session.user as User} />
      <main className="p-6">
        {children}
      </main>
    </div>
  );
}
