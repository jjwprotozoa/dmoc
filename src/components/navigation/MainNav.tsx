// src/components/navigation/MainNav.tsx
'use client';

import { useState } from 'react';
import { ThemeProvider } from '../../contexts/ThemeContext';
import { BottomNav } from './BottomNav';
import { SidebarNav } from './SidebarNav';
import { TopNav } from './TopNav';

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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <ThemeProvider initialTenantSlug={user.tenantSlug}>
      <div className="min-h-screen bg-gray-50">
        {/* Desktop Sidebar - Hidden on mobile */}
        <div className="hidden lg:block">
          <SidebarNav 
            user={user} 
            isCollapsed={sidebarCollapsed}
            onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          />
        </div>

        {/* Main Content Area */}
        <div className={`transition-all duration-300 ease-in-out ${
          sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'
        }`}>
          {/* Top Navigation */}
          <TopNav
            user={user}
            showMenuButton={false}
          />

          {/* Page Content */}
          <main className="pb-20 lg:pb-0 main-content-mobile">{children}</main>
        </div>

        {/* Mobile Bottom Navigation */}
        <div className="lg:hidden">
          <BottomNav />
        </div>
      </div>
    </ThemeProvider>
  );
}
