// src/app/(dashboard)/layout.tsx
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import React from 'react';
import { MainNav } from '../../components/navigation/MainNav';
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
    <MainNav user={session.user as User}>
      <div className="px-2 py-4 sm:px-4 sm:py-6 overflow-x-hidden max-w-full">{children}</div>
    </MainNav>
  );
}
