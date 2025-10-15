// src/components/navigation/SidebarNav.tsx
'use client';

import { 
  FileText, 
  Archive, 
  Receipt, 
  Users, 
  Truck, 
  User, 
  Shield, 
  Car,
  Route,
  MapPin,
  Radar,
  Phone,
  Settings,
  Globe,
  Heart,
  Menu,
  X
} from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from '../../contexts/ThemeContext';

interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
}

const navigationItems: NavItem[] = [
  {
    id: 'active-manifests',
    label: 'Active Manifests',
    href: '/dashboard/manifests/active',
    icon: FileText,
    description: 'View and manage active manifests'
  },
  {
    id: 'closed-manifests',
    label: 'Closed Manifests',
    href: '/dashboard/manifests/closed',
    icon: Archive,
    description: 'Review completed manifests'
  },
  {
    id: 'invoicing',
    label: 'Invoicing',
    href: '/dashboard/invoicing',
    icon: Receipt,
    description: 'Manage billing and invoices'
  },
  {
    id: 'clients',
    label: 'Clients',
    href: '/dashboard/clients',
    icon: Users,
    description: 'Client management'
  },
  {
    id: 'transporters',
    label: 'Transporters',
    href: '/dashboard/transporters',
    icon: Truck,
    description: 'Transportation providers'
  },
  {
    id: 'drivers',
    label: 'Drivers',
    href: '/dashboard/drivers',
    icon: User,
    description: 'Driver management'
  },
  {
    id: 'logistics-officers',
    label: 'Logistics Officers',
    href: '/dashboard/logistics-officers',
    icon: Shield,
    description: 'Logistics staff management'
  },
  {
    id: 'incident-reports',
    label: 'Incident Reports',
    href: '/dashboard/incidents',
    icon: Shield,
    description: 'Safety and incident tracking'
  },
  {
    id: 'vehicles',
    label: 'Vehicles',
    href: '/dashboard/vehicles',
    icon: Car,
    description: 'Fleet management'
  },
  {
    id: 'routes',
    label: 'Routes',
    href: '/dashboard/routes',
    icon: Route,
    description: 'Route planning and optimization'
  },
  {
    id: 'locations',
    label: 'Locations',
    href: '/dashboard/locations',
    icon: MapPin,
    description: 'Location management'
  },
  {
    id: 'trackers',
    label: 'Trackers',
    href: '/dashboard/trackers',
    icon: Radar,
    description: 'GPS tracking devices'
  },
  {
    id: 'contacts',
    label: 'Contacts',
    href: '/dashboard/contacts',
    icon: Phone,
    description: 'Contact management'
  },
  {
    id: 'settings',
    label: 'Settings',
    href: '/dashboard/settings',
    icon: Settings,
    description: 'System configuration'
  },
  {
    id: 'countries',
    label: 'Countries',
    href: '/dashboard/countries',
    icon: Globe,
    description: 'International operations'
  },
  {
    id: 'convoys',
    label: 'Convoys',
    href: '/dashboard/convoys',
    icon: Truck,
    description: 'Convoy management'
  },
  {
    id: 'manifest-health',
    label: 'Manifest Health',
    href: '/dashboard/manifest-health',
    icon: Heart,
    description: 'System health monitoring'
  }
];

interface SidebarNavProps {
  user: {
    id: string;
    email: string;
    role: string;
    tenantSlug: string;
  };
}

export function SidebarNav({ user }: SidebarNavProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const pathname = usePathname();
  const { theme } = useTheme();

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);
  const toggleMobile = () => setIsMobileOpen(!isMobileOpen);

  return (
    <>
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={toggleMobile}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 z-50 h-full bg-gradient-to-b from-${theme.primary}-900 via-${theme.primary}-800 to-${theme.primary}-900
        transition-all duration-300 ease-in-out
        ${isCollapsed ? 'w-16' : 'w-64'}
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        border-r border-${theme.primary}-700 shadow-2xl
      `}>
        {/* Header */}
        <div className={`flex items-center justify-between p-4 border-b border-${theme.primary}-700`}>
          {!isCollapsed && (
            <div className="flex items-center space-x-2">
              <div className={`w-8 h-8 bg-${theme.primary}-600 rounded-lg flex items-center justify-center`}>
                <Truck className={`w-5 h-5 text-${theme.primary}-100`} />
              </div>
              <div>
                <h1 className={`text-lg font-bold text-${theme.primary}-100`}>DMOC</h1>
                <p className={`text-xs text-${theme.primary}-300`}>{user.tenantSlug}</p>
              </div>
            </div>
          )}
          
          <button
            onClick={toggleSidebar}
            className={`p-2 text-${theme.primary}-300 hover:text-${theme.primary}-100 hover:bg-${theme.primary}-700 rounded-lg transition-colors`}
          >
            {isCollapsed ? <Menu className="w-5 h-5" /> : <X className="w-5 h-5" />}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto py-4">
          <div className="px-2 space-y-1">
            {navigationItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`
                    group flex items-center px-3 py-3 text-sm font-medium rounded-lg
                    transition-all duration-200 ease-in-out
                    ${isActive 
                      ? `bg-${theme.primary}-600 text-${theme.primary}-100 shadow-lg` 
                      : `text-${theme.primary}-200 hover:bg-${theme.primary}-700 hover:text-${theme.primary}-100`
                    }
                    ${isCollapsed ? 'justify-center' : 'justify-start'}
                  `}
                  title={isCollapsed ? item.label : undefined}
                >
                  <Icon className={`
                    flex-shrink-0 w-5 h-5
                    ${isActive ? `text-${theme.primary}-100` : `text-${theme.primary}-300 group-hover:text-${theme.primary}-100`}
                    transition-colors duration-200
                  `} />
                  
                  {!isCollapsed && (
                    <div className="ml-3 flex-1">
                      <div className="text-sm font-medium">{item.label}</div>
                      {item.description && (
                        <div className={`text-xs text-${theme.primary}-400 mt-0.5`}>
                          {item.description}
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Active indicator */}
                  {isActive && !isCollapsed && (
                    <div className={`ml-auto w-2 h-2 bg-${theme.primary}-200 rounded-full`} />
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* User Info */}
        {!isCollapsed && (
          <div className={`p-4 border-t border-${theme.primary}-700`}>
            <div className="flex items-center space-x-3">
              <div className={`w-8 h-8 bg-${theme.primary}-600 rounded-full flex items-center justify-center`}>
                <User className={`w-4 h-4 text-${theme.primary}-100`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium text-${theme.primary}-100 truncate`}>
                  {user.email}
                </p>
                <p className={`text-xs text-${theme.primary}-300 truncate`}>
                  {user.role}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mobile menu button */}
      <button
        onClick={toggleMobile}
        className={`fixed top-4 left-4 z-40 lg:hidden p-2 bg-${theme.primary}-800 text-${theme.primary}-100 rounded-lg shadow-lg`}
      >
        <Menu className="w-5 h-5" />
      </button>
    </>
  );
}
