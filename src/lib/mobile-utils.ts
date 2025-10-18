// src/lib/mobile-utils.ts
// Mobile-responsive utility functions and constants

/**
 * Mobile-responsive breakpoints following Context7 best practices
 */
export const MOBILE_BREAKPOINTS = {
  xs: '475px',
  sm: '640px', 
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

/**
 * Mobile-safe modal sizing classes
 */
export const MODAL_SIZES = {
  sm: 'max-w-sm',
  md: 'max-w-md', 
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '4xl': 'max-w-4xl',
  full: 'max-w-full',
} as const;

/**
 * Mobile-safe height constraints
 */
export const MOBILE_HEIGHTS = {
  '85vh': 'max-h-[85vh]',
  '90vh': 'max-h-[90vh]',
  '95vh': 'max-h-[95vh]',
} as const;

/**
 * Mobile viewport height utilities for better mobile support
 */
export const MOBILE_VH_UTILITIES = {
  'safe-area-inset-top': 'env(safe-area-inset-top)',
  'safe-area-inset-bottom': 'env(safe-area-inset-bottom)',
  'mobile-vh': 'calc(100vh - env(safe-area-inset-top) - env(safe-area-inset-bottom))',
} as const;

/**
 * Check if current viewport is mobile
 * Uses cached values to avoid repeated DOM queries
 */
let cachedViewportWidth: number | null = null;
let lastViewportCheck = 0;
const VIEWPORT_CACHE_DURATION = 100; // ms

const getViewportWidth = (): number => {
  const now = Date.now();
  if (cachedViewportWidth === null || now - lastViewportCheck > VIEWPORT_CACHE_DURATION) {
    cachedViewportWidth = window.innerWidth;
    lastViewportCheck = now;
  }
  return cachedViewportWidth;
};

export const isMobile = (): boolean => {
  if (typeof window === 'undefined') return false;
  return getViewportWidth() < parseInt(MOBILE_BREAKPOINTS.sm);
};

/**
 * Check if current viewport is tablet
 */
export const isTablet = (): boolean => {
  if (typeof window === 'undefined') return false;
  const width = getViewportWidth();
  return width >= parseInt(MOBILE_BREAKPOINTS.sm) && width < parseInt(MOBILE_BREAKPOINTS.lg);
};

/**
 * Check if current viewport is desktop
 */
export const isDesktop = (): boolean => {
  if (typeof window === 'undefined') return false;
  return getViewportWidth() >= parseInt(MOBILE_BREAKPOINTS.lg);
};

/**
 * Get mobile-optimized modal classes
 */
export const getMobileModalClasses = (size: keyof typeof MODAL_SIZES = 'md') => {
  return [
    // Mobile-first positioning - full width with safe margins
    'fixed inset-x-4 top-[50%] z-50 grid w-auto max-h-[85vh] translate-y-[-50%]',
    // Small screens - allow more height
    'max-h-[90vh]',
    // Tablet and up - center positioning with max-width constraints
    'sm:left-[50%] sm:top-[50%] sm:w-full sm:translate-x-[-50%] sm:translate-y-[-50%] sm:p-6 sm:rounded-lg',
    // Size-specific max-width on larger screens
    `sm:${MODAL_SIZES[size]}`,
    // Common styles
    'gap-4 border bg-background p-4 shadow-lg duration-200 overflow-y-auto',
    // Animations
    'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]',
  ].join(' ');
};
