// src/app/dashboard/layout.tsx
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import React from 'react';
import { DashboardNav } from '../../components/dashboard/DashboardNav';
import { authOptions } from '../../lib/auth';

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
      <DashboardNav user={session.user as any} />
      <main className="p-6">
        {children}
      </main>
    </div>
  );
}
