// src/components/navigation/SidebarNav.tsx
'use client';

import {
    Archive,
    Building2,
    Car,
    CarFront,
    ChevronDown,
    ChevronRight,
    ClipboardList,
    FileText,
    Globe,
    Heart,
    Home,
    MapPin,
    Menu,
    Monitor,
    Navigation,
    Phone,
    Radar,
    Receipt,
    Route,
    Settings,
    Shield,
    Truck,
    User,
    Users,
    X,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';

interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
}

interface NavGroup {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  items: NavItem[];
  defaultOpen?: boolean;
}

const navigationGroups: NavGroup[] = [
  {
    id: 'manifests',
    label: 'Manifests',
    icon: ClipboardList,
    defaultOpen: true,
    items: [
      {
        id: 'active-manifests',
        label: 'Active Manifests',
        href: '/dashboard/manifests/active',
        icon: FileText,
        description: 'View and manage active manifests',
      },
      {
        id: 'closed-manifests',
        label: 'Closed Manifests',
        href: '/dashboard/manifests/closed',
        icon: Archive,
        description: 'Review completed manifests',
      },
      {
        id: 'manifest-health',
        label: 'Manifest Health',
        href: '/dashboard/manifest-health',
        icon: Heart,
        description: 'System health monitoring',
      },
    ],
  },
  {
    id: 'fleet',
    label: 'Fleet Management',
    icon: CarFront,
    defaultOpen: false,
    items: [
      {
        id: 'vehicles',
        label: 'Vehicles',
        href: '/dashboard/vehicles',
        icon: Car,
        description: 'Fleet management',
      },
      {
        id: 'drivers',
        label: 'Drivers',
        href: '/dashboard/drivers',
        icon: User,
        description: 'Driver management',
      },
      {
        id: 'transporters',
        label: 'Transporters',
        href: '/dashboard/transporters',
        icon: Truck,
        description: 'Transportation providers',
      },
      {
        id: 'convoys',
        label: 'Convoys',
        href: '/dashboard/convoys',
        icon: Truck,
        description: 'Convoy management',
      },
    ],
  },
  {
    id: 'operations',
    label: 'Operations',
    icon: Navigation,
    defaultOpen: false,
    items: [
      {
        id: 'routes',
        label: 'Routes',
        href: '/dashboard/routes',
        icon: Route,
        description: 'Route planning and optimization',
      },
      {
        id: 'locations',
        label: 'Locations',
        href: '/dashboard/locations',
        icon: MapPin,
        description: 'Location management',
      },
      {
        id: 'trackers',
        label: 'Trackers',
        href: '/dashboard/trackers',
        icon: Radar,
        description: 'GPS tracking devices',
      },
    ],
  },
  {
    id: 'people',
    label: 'People & Contacts',
    icon: Users,
    defaultOpen: false,
    items: [
      {
        id: 'clients',
        label: 'Clients',
        href: '/dashboard/clients',
        icon: Users,
        description: 'Client management',
      },
      {
        id: 'logistics-officers',
        label: 'Logistics Officers',
        href: '/dashboard/logistics-officers',
        icon: Shield,
        description: 'Logistics staff management',
      },
      {
        id: 'contacts',
        label: 'Contacts',
        href: '/dashboard/contacts',
        icon: Phone,
        description: 'Contact management',
      },
    ],
  },
  {
    id: 'business',
    label: 'Business',
    icon: Building2,
    defaultOpen: false,
    items: [
      {
        id: 'invoicing',
        label: 'Invoicing',
        href: '/dashboard/invoicing',
        icon: Receipt,
        description: 'Manage billing and invoices',
      },
      {
        id: 'incident-reports',
        label: 'Incident Reports',
        href: '/dashboard/incidents',
        icon: Shield,
        description: 'Safety and incident tracking',
      },
      {
        id: 'countries',
        label: 'Countries',
        href: '/dashboard/countries',
        icon: Globe,
        description: 'International operations',
      },
    ],
  },
  {
    id: 'system',
    label: 'System',
    icon: Monitor,
    defaultOpen: false,
    items: [
      {
        id: 'settings',
        label: 'Settings',
        href: '/dashboard/settings',
        icon: Settings,
        description: 'System configuration',
      },
    ],
  },
];

interface SidebarNavProps {
  user: {
    id: string;
    email: string;
    role: string;
    tenantSlug: string;
  };
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function SidebarNav({ user, isCollapsed: externalCollapsed, onToggleCollapse }: SidebarNavProps) {
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    new Set(
      navigationGroups
        .filter((group) => group.defaultOpen)
        .map((group) => group.id)
    )
  );
  const pathname = usePathname();
  const { theme } = useTheme();

  // Use external collapse state if provided, otherwise use internal state
  const isCollapsed = externalCollapsed !== undefined ? externalCollapsed : internalCollapsed;
  
  const toggleSidebar = () => {
    if (onToggleCollapse) {
      onToggleCollapse();
    } else {
      setInternalCollapsed(!internalCollapsed);
    }
  };
  const toggleMobile = () => setIsMobileOpen(!isMobileOpen);

  const toggleGroup = (groupId: string) => {
    setExpandedGroups((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(groupId)) {
        newSet.delete(groupId);
      } else {
        newSet.add(groupId);
      }
      return newSet;
    });
  };

  const isGroupExpanded = (groupId: string) => expandedGroups.has(groupId);

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
      <div
        className={`
        fixed top-0 left-0 z-50 h-full bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900
        transition-all duration-300 ease-in-out
        ${isCollapsed ? 'w-16' : 'w-64'}
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        border-r border-gray-700 shadow-2xl
        flex flex-col
      `}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700 flex-shrink-0">
          {!isCollapsed && (
            <div className="flex items-center space-x-2">
              <div
                className={`w-8 h-8 bg-${theme.primary}-600 rounded-lg flex items-center justify-center`}
              >
                <Truck className={`w-5 h-5 text-white`} />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">DMOC</h1>
                <p className="text-xs text-gray-300">{user.tenantSlug}</p>
              </div>
            </div>
          )}

          <button
            onClick={toggleSidebar}
            className="p-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
          >
            {isCollapsed ? (
              <Menu className="w-5 h-5" />
            ) : (
              <X className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto py-4">
          <div className="px-2 space-y-2">
            {/* Dashboard Home Link */}
            <Link
              href="/dashboard"
              className={`
                group flex items-center px-3 py-2 text-sm font-medium rounded-lg
                transition-all duration-200 ease-in-out transform
                ${
                  pathname === '/dashboard'
                    ? `bg-${theme.primary}-600 text-white shadow-lg`
                    : `text-gray-200 hover:bg-gray-700 hover:text-white`
                }
                ${isCollapsed ? 'justify-center' : 'justify-start'}
              `}
              title={isCollapsed ? 'Dashboard' : undefined}
            >
              <Home
                className={`
                flex-shrink-0 w-5 h-5 transition-all duration-200
                ${pathname === '/dashboard' ? `text-white` : `text-gray-300 group-hover:text-white`}
              `}
              />
              {!isCollapsed && (
                <div className="ml-3 flex-1">
                  <div className="text-sm font-medium">Dashboard</div>
                  <div className="text-xs text-gray-400 mt-0.5 transition-opacity duration-200">
                    Overview & Summary
                  </div>
                </div>
              )}
              {pathname === '/dashboard' && !isCollapsed && (
                <div className="ml-auto w-2 h-2 bg-white rounded-full" />
              )}
            </Link>

            {/* Separator */}
            {!isCollapsed && (
              <div className="px-3 py-2">
                <div className="h-px bg-gray-600"></div>
              </div>
            )}

            {navigationGroups.map((group) => {
              const GroupIcon = group.icon;
              const isExpanded = isGroupExpanded(group.id);
              const hasActiveItem = group.items.some(
                (item) => pathname === item.href
              );

              return (
                <div key={group.id} className="space-y-1">
                  {/* Group Header */}
                  <button
                    onClick={() => toggleGroup(group.id)}
                    className={`
                      w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg
                      transition-all duration-200 ease-in-out
                      ${
                        hasActiveItem
                          ? `bg-gray-700 text-white`
                          : `text-gray-200 hover:bg-gray-700 hover:text-white`
                      }
                      ${isCollapsed ? 'justify-center' : 'justify-start'}
                    `}
                    title={isCollapsed ? group.label : undefined}
                  >
                    <GroupIcon
                      className={`
                      flex-shrink-0 w-5 h-5
                      ${hasActiveItem ? `text-white` : `text-gray-300`}
                      transition-colors duration-200
                    `}
                    />

                    {!isCollapsed && (
                      <>
                        <span className="ml-3 flex-1 text-left">
                          {group.label}
                        </span>
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4 text-gray-300" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-gray-300" />
                        )}
                      </>
                    )}
                  </button>

                  {/* Group Items */}
                  {!isCollapsed && isExpanded && (
                    <div className="ml-4 space-y-1 pt-1">
                        {group.items.map((item, index) => {
                          const isActive = pathname === item.href;
                          const Icon = item.icon;

                          return (
                            <Link
                              key={item.id}
                              href={item.href}
                              className={`
                                group flex items-center px-3 py-2 text-sm font-medium rounded-lg
                                transition-all duration-200 ease-in-out transform
                                ${
                                  isActive
                                    ? `bg-${theme.primary}-600 text-white shadow-lg`
                                    : `text-gray-200 hover:bg-gray-700 hover:text-white`
                                }
                              `}
                              style={{
                                animationDelay: isExpanded
                                  ? `${index * 50}ms`
                                  : '0ms',
                              }}
                            >
                              <Icon
                                className={`
                                flex-shrink-0 w-4 h-4 transition-all duration-200
                                ${isActive ? `text-white` : `text-gray-300 group-hover:text-white`}
                              `}
                              />

                              <div className="ml-3 flex-1">
                                <div className="text-sm font-medium">
                                  {item.label}
                                </div>
                                {item.description && (
                                  <div className="text-xs text-gray-400 mt-0.5 transition-opacity duration-200">
                                    {item.description}
                                  </div>
                                )}
                              </div>

                              {/* Active indicator */}
                              {isActive && (
                                <div className="ml-auto w-2 h-2 bg-white rounded-full" />
                              )}
                            </Link>
                          );
                        })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </nav>

        {/* User Info */}
        {!isCollapsed && (
          <div className="p-4 border-t border-gray-700 flex-shrink-0">
            <div className="flex items-center space-x-3">
              <div
                className={`w-8 h-8 bg-${theme.primary}-600 rounded-full flex items-center justify-center`}
              >
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {user.email}
                </p>
                <p className="text-xs text-gray-300 truncate">{user.role}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mobile menu button */}
      <button
        onClick={toggleMobile}
        className={`fixed top-4 left-4 z-40 lg:hidden p-2 bg-gray-800 text-white rounded-lg shadow-lg`}
      >
        <Menu className="w-5 h-5" />
      </button>
    </>
  );
}
