// src/components/navigation/MainNav.tsx
'use client';

import { useState } from 'react';
import { SidebarNav } from './SidebarNav';
import { TopNav } from './TopNav';
import { BottomNav } from './BottomNav';
import { ThemeProvider } from '../../contexts/ThemeContext';

interface MainNavProps {
  user: {
    id: string;
    email: string;
    role: string;
    tenantSlug: string;
  };
  children: React.ReactNode;
}

export function MainNav({ user, children }: MainNavProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <ThemeProvider initialTenantSlug={user.tenantSlug}>
      <div className="min-h-screen bg-gray-50">
        {/* Desktop Sidebar */}
        <SidebarNav user={user} />
        
        {/* Mobile Bottom Navigation */}
        <BottomNav />
        
        {/* Main Content Area */}
        <div className="lg:ml-64">
          {/* Top Navigation */}
          <TopNav 
            user={user} 
            onMenuClick={() => setSidebarOpen(!sidebarOpen)}
            showMenuButton={true}
          />
          
          {/* Page Content */}
          <main className="pb-16 lg:pb-0">
            {children}
          </main>
        </div>
      </div>
    </ThemeProvider>
  );
}
