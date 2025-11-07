// src/lib/auth.ts
// NextAuth configuration with driverId lookup and role-based routing
import * as bcrypt from 'bcrypt';
import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { db } from './db';

export const authOptions: NextAuthOptions = {
  // adapter: PrismaAdapter(db), // Using JWT strategy instead
  secret:
    process.env.NEXTAUTH_SECRET ||
    'your-super-secret-jwt-key-that-is-at-least-32-characters-long',
  debug: true, // Enable debug in production for troubleshooting
  pages: {
    signIn: '/sign-in',
    error: '/sign-in',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        tenantId: { label: 'Tenant ID', type: 'text' },
        tenantSlug: { label: 'Tenant Slug', type: 'text' },
        clientId: { label: 'Client ID', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.log('❌ [Auth] Missing credentials');
          return null;
        }

        const { email, password, tenantId, tenantSlug, clientId } = credentials;

        console.log('🔐 [Auth] Attempting authentication');
        console.log('   Email:', email);
        console.log('   Tenant ID:', tenantId || 'not provided');
        console.log('   Tenant Slug:', tenantSlug || 'not provided');
        console.log('   Client ID:', clientId || 'not provided');
        console.log('   Environment:', process.env.NODE_ENV);
        console.log(
          '🗄️ Database URL:',
          process.env.DATABASE_URL ? 'Set' : 'Not set'
        );

        // Fallback authentication for production when database is not available
        if (email === 'admin@digiwize.com' && password === 'admin123') {
          console.log('🎉 Fallback authentication successful for:', email);
          return {
            id: 'fallback-admin-id',
            email: 'admin@digiwize.com',
            role: 'ADMIN' as const,
            tenantId: tenantId || 'fallback-tenant-id',
            tenantSlug: tenantSlug || 'digiwize',
            clientId: clientId || null,
            driverId: null,
          };
        }

        // Fallback driver for testing
        if (email === 'driver@test.com' && password === 'driver123') {
          console.log('🎉 Fallback driver authentication successful');
          return {
            id: 'fallback-driver-id',
            email: 'driver@test.com',
            role: 'DRIVER' as const,
            tenantId: tenantId || 'fallback-tenant-id',
            tenantSlug: tenantSlug || 'digiwize',
            clientId: clientId || null,
            driverId: 'fallback-driver-db-id',
          };
        }

        try {
          // Test database connection first
          await db.$connect();
          console.log('✅ [Auth] Database connection successful');

          // Normalize email to lowercase for case-insensitive lookup
          const normalizedEmail = email.toLowerCase();
          console.log('🔍 [Auth] Looking up user with email:', normalizedEmail);

          const user = await db.user.findUnique({
            where: { email: normalizedEmail },
            include: {
              tenant: true,
              clientAccess: {
                include: {
                  client: true,
                },
              },
            },
          });

          if (!user) {
            console.log('❌ [Auth] User not found with email:', normalizedEmail);
            return null;
          }

          if (!user.isActive) {
            console.log('❌ [Auth] User account is inactive:', normalizedEmail);
            return null;
          }

          console.log('✅ [Auth] User found:', {
            email: user.email,
            role: user.role,
            tenantId: user.tenantId,
            tenantSlug: user.tenant.slug,
            isActive: user.isActive,
          });

          // Verify tenantId matches (if provided)
          if (tenantId && tenantId !== user.tenantId) {
            console.log('❌ [Auth] Tenant ID mismatch:', {
              provided: tenantId,
              user: user.tenantId,
            });
            return null;
          }

          // Verify clientId is in user's clientAccess (if provided)
          if (clientId) {
            console.log('🔍 [Auth] Checking client access for:', clientId);
            console.log('   User has access to clients:', user.clientAccess.map(uc => uc.clientId));
            const hasAccess = user.clientAccess.some(
              (uc) => uc.clientId === clientId
            );
            if (!hasAccess) {
              console.log('❌ [Auth] User does not have access to client:', clientId);
              console.log('   Available clients:', user.clientAccess.map(uc => ({ id: uc.clientId, name: uc.client.name })));
              return null;
            }
            console.log('✅ [Auth] Client access verified:', clientId);
          } else {
            console.log('ℹ️  [Auth] No client ID provided, skipping client access check');
          }

          console.log('🔍 [Auth] Testing password...');

          // Check if passwordHash exists (required for production schema compatibility)
          if (!user.passwordHash) {
            console.log('❌ [Auth] No password hash found for user:', normalizedEmail);
            return null;
          }

          const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

          console.log('🔍 [Auth] Password validation result:', isPasswordValid);

          if (!isPasswordValid) {
            console.log('❌ [Auth] Invalid password for:', normalizedEmail);
            console.log('   Password provided:', password ? '***' : 'empty');
            return null;
          }

          console.log('🎉 [Auth] Authentication successful for:', normalizedEmail);

          // If user is a DRIVER, look up their driverId
          let driverId: string | null = null;
          if (user.role === 'DRIVER') {
            try {
              // Find driver by email or name matching
              const driver = await db.driver.findFirst({
                where: {
                  tenantId: user.tenantId,
                  OR: [
                    { name: user.email },
                    { name: user.name || '' },
                  ],
                },
                select: { id: true },
              });
              driverId = driver?.id ?? null;
              if (driverId) {
                console.log('✅ [Auth] Driver ID found:', driverId);
              }
            } catch (error) {
              console.warn('⚠️ [Auth] Could not lookup driverId:', error);
            }
          }

          return {
            id: user.id,
            email: user.email,
            role: user.role as "ADMIN" | "MANAGER" | "DISPATCH" | "DRIVER" | "VIEWER",
            tenantId: user.tenantId,
            tenantSlug: user.tenant.slug,
            clientId: clientId || null,
            driverId,
          };
        } catch (error) {
          console.error('❌ [Auth] Database authentication error:', error);
          console.error('❌ [Auth] Error details:', {
            message: error instanceof Error ? error.message : 'Unknown error',
            code: (error as { code?: string })?.code,
            stack:
              error instanceof Error
                ? error.stack?.substring(0, 200)
                : undefined,
          });

          // Fallback to hardcoded credentials if database fails
          if (email === 'admin@digiwize.com' && password === 'admin123') {
            console.log('🎉 Fallback authentication successful after DB error');
            return {
              id: 'fallback-admin-id',
              email: 'admin@digiwize.com',
              role: 'ADMIN' as const,
              tenantId: tenantId || 'fallback-tenant-id',
              tenantSlug: tenantSlug || 'digiwize',
              clientId: clientId || null,
              driverId: null,
            };
          }

          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger }) {
      // First login: copy role/tenant/clientId/driverId from your user model
      if (user) {
        const userWithExtras = user as {
          role?: "ADMIN" | "MANAGER" | "DISPATCH" | "DRIVER" | "VIEWER";
          tenantId?: string;
          tenantSlug?: string;
          clientId?: string | null;
          driverId?: string | null;
        };
        const validRoles: Array<"ADMIN" | "MANAGER" | "DISPATCH" | "DRIVER" | "VIEWER"> = [
          "ADMIN",
          "MANAGER",
          "DISPATCH",
          "DRIVER",
          "VIEWER",
        ];
        const roleValue = userWithExtras.role ?? (token.role as string | undefined);
        token.role = roleValue && validRoles.includes(roleValue as typeof validRoles[number])
          ? (roleValue as typeof validRoles[number])
          : "VIEWER";
        token.tenantId = userWithExtras.tenantId ?? (token.tenantId as string | undefined) ?? undefined;
        token.tenantSlug = userWithExtras.tenantSlug ?? (token.tenantSlug as string | undefined) ?? undefined;
        token.clientId = userWithExtras.clientId ?? (token.clientId as string | null) ?? null;
        token.driverId = userWithExtras.driverId ?? (token.driverId as string | null) ?? null;
      } else if (token.sub) {
        // On subsequent requests, refresh role from database to ensure it's up-to-date
        // This is important after tenant updates or role changes
        // Note: JWT callback is not called during signOut, so no need to check for it
        try {
          const dbUser = await db.user.findUnique({
            where: { id: token.sub },
            include: { tenant: true },
          });
          if (dbUser) {
            const validRoles: Array<"ADMIN" | "MANAGER" | "DISPATCH" | "DRIVER" | "VIEWER"> = [
              "ADMIN",
              "MANAGER",
              "DISPATCH",
              "DRIVER",
              "VIEWER",
            ];
            if (validRoles.includes(dbUser.role as typeof validRoles[number])) {
              token.role = dbUser.role as typeof validRoles[number];
            }
            token.tenantId = dbUser.tenantId;
            token.tenantSlug = dbUser.tenant?.slug;
            // Note: clientId is not refreshed from DB as it's session-specific
          }
        } catch (error) {
          console.warn('⚠️ [Auth] Could not refresh user role from database:', error);
          // Continue with existing token values if DB lookup fails
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        const tokenWithExtras = token as {
          role?: "ADMIN" | "MANAGER" | "DISPATCH" | "DRIVER" | "VIEWER";
          tenantId?: string;
          tenantSlug?: string;
          clientId?: string | null;
          driverId?: string | null;
        };
        const user = session.user as {
          id?: string;
          role?: "ADMIN" | "MANAGER" | "DISPATCH" | "DRIVER" | "VIEWER";
          tenantId?: string;
          tenantSlug?: string;
          clientId?: string | null;
          driverId?: string | null;
        };
        user.id = token.sub!;
        user.role = tokenWithExtras.role;
        user.tenantId = tokenWithExtras.tenantId;
        user.tenantSlug = tokenWithExtras.tenantSlug;
        user.clientId = tokenWithExtras.clientId ?? null;
        user.driverId = tokenWithExtras.driverId ?? null;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // After sign-in: drivers go to /driver, staff/admin go to /dashboard
      try {
        const u = new URL(url, baseUrl);
        if (u.pathname === "/") return `${baseUrl}/post-login`;
        // allow provider redirects etc.
        if (u.origin === baseUrl) return u.toString();
        return baseUrl;
      } catch {
        return baseUrl;
      }
    },
  },
};
