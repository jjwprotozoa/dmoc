// src/contexts/ThemeContext.tsx
'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

interface ThemeConfig {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  shadow: string;
}

interface ThemeContextType {
  theme: ThemeConfig;
  setTheme: (theme: ThemeConfig) => void;
  tenantSlug: string;
  setTenantSlug: (slug: string) => void;
}

const defaultTheme: ThemeConfig = {
  primary: 'amber',
  secondary: 'gray',
  accent: 'blue',
  background: 'gray-50',
  surface: 'white',
  text: 'gray-900',
  textSecondary: 'gray-600',
  border: 'gray-200',
  shadow: 'gray-200',
};

// Predefined themes for different tenants
const tenantThemes: Record<string, ThemeConfig> = {
  delta: {
    primary: 'blue',
    secondary: 'gray',
    accent: 'blue',
    background: 'blue-50',
    surface: 'white',
    text: 'blue-900',
    textSecondary: 'blue-600',
    border: 'blue-200',
    shadow: 'blue-200',
  },
  cobra: {
    primary: 'red',
    secondary: 'gray',
    accent: 'red',
    background: 'red-50',
    surface: 'white',
    text: 'red-900',
    textSecondary: 'red-600',
    border: 'red-200',
    shadow: 'red-200',
  },
  digiwize: {
    primary: 'amber',
    secondary: 'gray',
    accent: 'amber',
    background: 'amber-50',
    surface: 'white',
    text: 'amber-900',
    textSecondary: 'amber-600',
    border: 'amber-200',
    shadow: 'amber-200',
  },
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({
  children,
  initialTenantSlug = 'digiwize',
}: {
  children: React.ReactNode;
  initialTenantSlug?: string;
}) {
  const [tenantSlug, setTenantSlug] = useState(initialTenantSlug);
  const [theme, setTheme] = useState<ThemeConfig>(
    tenantThemes[initialTenantSlug] || defaultTheme
  );

  useEffect(() => {
    const tenantTheme = tenantThemes[tenantSlug];
    if (tenantTheme) {
      setTheme(tenantTheme);
    }
  }, [tenantSlug]);

  return (
    <ThemeContext.Provider
      value={{ theme, setTheme, tenantSlug, setTenantSlug }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

// Helper function to get theme classes
export function getThemeClasses(
  theme: ThemeConfig,
  component: 'sidebar' | 'topbar' | 'button' | 'card'
) {
  const baseClasses = {
    sidebar: `bg-gradient-to-b from-${theme.primary}-900 via-${theme.primary}-800 to-${theme.primary}-900 border-${theme.primary}-700`,
    topbar: `bg-${theme.surface} border-${theme.border}`,
    button: `bg-${theme.primary}-600 hover:bg-${theme.primary}-700 text-white`,
    card: `bg-${theme.surface} border-${theme.border} shadow-${theme.shadow}`,
  };

  return baseClasses[component] || '';
}
