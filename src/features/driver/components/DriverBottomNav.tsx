// src/features/driver/components/DriverBottomNav.tsx
// Driver-specific bottom navigation for mobile

"use client";

import { Home, FileText, CheckCircle, AlertCircle, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useTheme } from "@/contexts/ThemeContext";

interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const driverNavItems: NavItem[] = [
  {
    id: 'home',
    label: 'Home',
    href: '/driver',
    icon: Home,
  },
  {
    id: 'active',
    label: 'Active',
    href: '/driver/trips/active',
    icon: FileText,
  },
  {
    id: 'completed',
    label: 'Completed',
    href: '/driver/trips/completed',
    icon: CheckCircle,
  },
  {
    id: 'incidents',
    label: 'Reports',
    href: '/driver/incidents',
    icon: AlertCircle,
  },
];

export function DriverBottomNav() {
  const pathname = usePathname();
  const { theme } = useTheme();
  const [activeItem, setActiveItem] = useState(pathname);

  // Get primary color class based on theme
  const primaryColorClass = 
    theme.primary === 'blue' ? 'bg-blue-600' :
    theme.primary === 'red' ? 'bg-red-600' :
    'bg-amber-600';

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-t from-gray-900 via-gray-800 to-gray-900 border-t border-gray-700 shadow-2xl lg:hidden">
      <div className="flex items-center justify-around py-2">
        {driverNavItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          const Icon = item.icon;

          return (
            <Link
              key={item.id}
              href={item.href}
              onClick={() => setActiveItem(item.href)}
              className={`
                flex flex-col items-center p-2 rounded-lg transition-all duration-200
                ${
                  isActive
                    ? `${primaryColorClass} text-white`
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
  );
}

