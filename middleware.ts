// middleware.ts
// Next.js middleware for JWT authentication and route protection
// Checks for valid NextAuth session tokens and redirects unauthenticated users
// Enforces tenant isolation and role-based access control

import { getToken } from 'next-auth/jwt';
import { NextRequest, NextResponse } from 'next/server';

// Define public routes that don't require authentication
const publicRoutes = [
  '/',
  '/sign-in',
  '/sign-up',
  '/api/auth',
  '/api/webhook',
  '/api/alpr',
  '/offline.html',
  '/site.webmanifest',
  '/robots.txt',
  '/icons',
  '/_next',
  '/favicon.ico',
];

// Define protected routes that require authentication
const protectedRoutes = [
  '/dashboard',
  '/api/trpc',
];

// Define admin-only routes (Digiwize admins can access all tenants)
const adminRoutes = [
  '/admin',
  '/api/admin',
];

// Define tenant-specific routes that require tenant validation
const tenantRoutes = [
  '/dashboard',
  '/api/trpc',
];

// Role-based access control mapping
type Permission = '*' | 'dashboard' | 'manifests' | 'tracking' | 'offenses';

type RolePermissions = {
  ADMIN: Permission[];
  MANAGER: Permission[];
  OPERATOR: Permission[];
  VIEWER: Permission[];
};

const rolePermissions: RolePermissions = {
  ADMIN: ['*'], // Digiwize admins can access everything
  MANAGER: ['dashboard', 'manifests', 'tracking', 'offenses'],
  OPERATOR: ['dashboard', 'manifests', 'tracking'],
  VIEWER: ['dashboard'],
};

// Helper function to check if a path matches any of the given patterns
function isPublicRoute(pathname: string): boolean {
  return publicRoutes.some(route => {
    if (route === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(route);
  });
}

// Helper function to check if a path is a protected route
function isProtectedRoute(pathname: string): boolean {
  return protectedRoutes.some(route => pathname.startsWith(route));
}

// Helper function to check if a path is an admin route
function isAdminRoute(pathname: string): boolean {
  return adminRoutes.some(route => pathname.startsWith(route));
}

// Helper function to check if a path is a tenant route
function isTenantRoute(pathname: string): boolean {
  return tenantRoutes.some(route => pathname.startsWith(route));
}

// Helper function to check if user has permission for a route
function hasPermission(userRole: string, pathname: string): boolean {
  const permissions = rolePermissions[userRole as keyof typeof rolePermissions];
  if (!permissions) return false;
  
  // Admin has access to everything
  if (permissions.includes('*')) return true;
  
  // Check if the route matches any allowed permission
  return permissions.some(permission => {
    if (permission === 'dashboard') {
      return pathname.startsWith('/dashboard');
    }
    if (permission === 'manifests') {
      return pathname.includes('manifest');
    }
    if (permission === 'tracking') {
      return pathname.includes('tracking');
    }
    if (permission === 'offenses') {
      return pathname.includes('offense');
    }
    return false;
  });
}

// Helper function to validate tenant access
function validateTenantAccess(userTenantId: string, userRole: string, pathname: string): boolean {
  // Digiwize admins can access all tenants
  if (userRole === 'ADMIN') return true;
  
  // For tenant-specific routes, ensure user belongs to the tenant
  if (isTenantRoute(pathname)) {
    // Extract tenant from URL if present (e.g., /dashboard?tenant=delta)
    const url = new URL(pathname, 'http://localhost');
    const tenantParam = url.searchParams.get('tenant');
    
    // If no tenant param, allow access (will be handled by the app)
    if (!tenantParam) return true;
    
    // For now, we'll allow access and let the app handle tenant validation
    // In a more sophisticated setup, you might validate against a tenant registry
    return true;
  }
  
  return true;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes to pass through without authentication
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  try {
    // Get the JWT token from the request
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET || 'your-super-secret-jwt-key-that-is-at-least-32-characters-long',
    });

    // If no valid token, redirect to sign-in for protected routes
    if (!token) {
      if (isProtectedRoute(pathname) || isAdminRoute(pathname)) {
        const signInUrl = new URL('/sign-in', request.url);
        signInUrl.searchParams.set('callbackUrl', pathname);
        return NextResponse.redirect(signInUrl);
      }
      // For non-protected routes, allow access
      return NextResponse.next();
    }

    // Extract user information from token
    const userRole = token.role || 'VIEWER';
    const userTenantId = token.tenantId;
    const userTenantSlug = token.tenantSlug;

    // Check admin route access
    if (isAdminRoute(pathname)) {
      if (userRole !== 'ADMIN') {
        // Non-admin users trying to access admin routes get redirected to dashboard
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
      return NextResponse.next();
    }

    // Check role-based permissions for protected routes
    if (isProtectedRoute(pathname)) {
      if (!hasPermission(userRole, pathname)) {
        // User doesn't have permission for this route
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }

      // Validate tenant access
      if (!validateTenantAccess(userTenantId, userRole, pathname)) {
        // User doesn't have access to this tenant's data
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    }

    // If user is authenticated and trying to access root, redirect to dashboard
    if (pathname === '/') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // Add tenant information to headers for downstream processing
    const response = NextResponse.next();
    response.headers.set('x-user-role', userRole);
    response.headers.set('x-user-tenant-id', userTenantId || '');
    response.headers.set('x-user-tenant-slug', userTenantSlug || '');
    
    return response;

  } catch (error) {
    // If there's an error validating the token, redirect to sign-in for protected routes
    console.error('Middleware authentication error:', error);
    
    if (isProtectedRoute(pathname) || isAdminRoute(pathname)) {
      const signInUrl = new URL('/sign-in', request.url);
      signInUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(signInUrl);
    }
    
    // For non-protected routes, allow access even if there's an error
    return NextResponse.next();
  }
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (NextAuth.js routes)
     * - api/webhook (external webhooks)
     * - api/alpr (external ALPR service)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - site.webmanifest (PWA manifest)
     * - robots.txt (SEO file)
     * - icons (PWA icons)
     * - offline.html (PWA offline page)
     */
    '/((?!api/auth|api/webhook|api/alpr|_next/static|_next/image|favicon.ico|site.webmanifest|robots.txt|icons|offline.html).*)',
  ],
};
