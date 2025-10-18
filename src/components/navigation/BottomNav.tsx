// src/components/navigation/BottomNav.tsx
'use client';

import {
    Archive,
    Car,
    FileText,
    Globe,
    Heart,
    Home,
    MapPin,
    MoreHorizontal,
    Phone,
    Radar,
    Receipt,
    Route,
    Settings,
    Shield,
    Truck,
    User,
    Users,
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
}

// Primary navigation items for mobile (most important ones)
const primaryNavItems: NavItem[] = [
  {
    id: 'dashboard',
    label: 'Home',
    href: '/dashboard',
    icon: Home,
  },
  {
    id: 'active-manifests',
    label: 'Active',
    href: '/dashboard/manifests/active',
    icon: FileText,
  },
  {
    id: 'vehicles',
    label: 'Vehicles',
    href: '/dashboard/vehicles',
    icon: Car,
  },
  {
    id: 'routes',
    label: 'Routes',
    href: '/dashboard/routes',
    icon: Route,
  },
  {
    id: 'trackers',
    label: 'Track',
    href: '/dashboard/trackers',
    icon: Radar,
  },
  {
    id: 'more',
    label: 'More',
    href: '#',
    icon: MoreHorizontal,
  },
];

// Secondary navigation items (shown in expanded menu)
const secondaryNavItems: NavItem[] = [
  {
    id: 'closed-manifests',
    label: 'Closed Manifests',
    href: '/dashboard/manifests/closed',
    icon: Archive,
  },
  {
    id: 'invoicing',
    label: 'Invoicing',
    href: '/dashboard/invoicing',
    icon: Receipt,
  },
  {
    id: 'clients',
    label: 'Clients',
    href: '/dashboard/clients',
    icon: Users,
  },
  {
    id: 'transporters',
    label: 'Transporters',
    href: '/dashboard/transporters',
    icon: Truck,
  },
  {
    id: 'drivers',
    label: 'Drivers',
    href: '/dashboard/drivers',
    icon: User,
  },
  {
    id: 'logistics-officers',
    label: 'Logistics Officers',
    href: '/dashboard/logistics-officers',
    icon: Shield,
  },
  {
    id: 'incident-reports',
    label: 'Incidents',
    href: '/dashboard/incidents',
    icon: Shield,
  },
  {
    id: 'locations',
    label: 'Locations',
    href: '/dashboard/locations',
    icon: MapPin,
  },
  {
    id: 'contacts',
    label: 'Contacts',
    href: '/dashboard/contacts',
    icon: Phone,
  },
  {
    id: 'settings',
    label: 'Settings',
    href: '/dashboard/settings',
    icon: Settings,
  },
  {
    id: 'countries',
    label: 'Countries',
    href: '/dashboard/countries',
    icon: Globe,
  },
  {
    id: 'convoys',
    label: 'Convoys',
    href: '/dashboard/convoys',
    icon: Truck,
  },
  {
    id: 'manifest-health',
    label: 'Health',
    href: '/dashboard/manifest-health',
    icon: Heart,
  },
];

export function BottomNav() {
  const [showMore, setShowMore] = useState(false);
  const pathname = usePathname();
  const { theme } = useTheme();

  const handleMoreClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowMore(!showMore);
  };

  return (
    <>
      {/* Bottom Navigation */}
      <div className={`fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-t from-gray-900 via-gray-800 to-gray-900 border-t border-gray-700 shadow-2xl lg:hidden`}>
        <div className="flex items-center justify-around py-2">
          {primaryNavItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            if (item.id === 'more') {
              return (
                <button
                  key={item.id}
                  onClick={handleMoreClick}
                  className={`
                    flex flex-col items-center p-2 rounded-lg transition-all duration-200
                    ${
                      showMore
                        ? `bg-${theme.primary}-600 text-white`
                        : 'text-gray-300 hover:text-white hover:bg-gray-700'
                    }
                  `}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-xs mt-1 font-medium">{item.label}</span>
                </button>
              );
            }

            return (
              <Link
                key={item.id}
                href={item.href}
                className={`
                  flex flex-col items-center p-2 rounded-lg transition-all duration-200
                  ${
                    isActive
                      ? `bg-${theme.primary}-600 text-white`
                      : 'text-gray-300 hover:text-white hover:bg-gray-700'
                  }
                `}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs mt-1 font-medium">{item.label}</span>
                {isActive && (
                  <div className="w-1 h-1 bg-white rounded-full mt-1" />
                )}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Expanded More Menu */}
      {showMore && (
        <div className="fixed bottom-16 left-0 right-0 z-40 bg-gray-800 border-t border-gray-700 shadow-2xl lg:hidden">
          <div className="p-4">
            <div className="grid grid-cols-3 gap-3">
              {secondaryNavItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;

                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    onClick={() => setShowMore(false)}
                    className={`
                      flex flex-col items-center p-3 rounded-lg transition-all duration-200
                      ${
                        isActive
                          ? `bg-${theme.primary}-600 text-white`
                          : 'text-gray-300 hover:text-white hover:bg-gray-700'
                      }
                    `}
                  >
                    <Icon className="w-6 h-6" />
                    <span className="text-xs mt-2 font-medium text-center leading-tight">
                      {item.label}
                    </span>
                    {isActive && (
                      <div className="w-1 h-1 bg-white rounded-full mt-1" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Overlay for more menu */}
      {showMore && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setShowMore(false)}
        />
      )}
    </>
  );
}
