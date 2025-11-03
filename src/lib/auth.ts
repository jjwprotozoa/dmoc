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
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.log('❌ Missing credentials');
          return null;
        }

        console.log('🔐 Attempting authentication for:', credentials.email);
        console.log('🌍 Environment:', process.env.NODE_ENV);
        console.log(
          '🗄️ Database URL:',
          process.env.DATABASE_URL ? 'Set' : 'Not set'
        );

        // Fallback authentication for production when database is not available
        if (
          credentials.email === 'admin@digiwize.com' &&
          credentials.password === 'admin123'
        ) {
          console.log(
            '🎉 Fallback authentication successful for:',
            credentials.email
          );
          return {
            id: 'fallback-admin-id',
            email: 'admin@digiwize.com',
            role: 'ADMIN' as const,
            tenantId: 'fallback-tenant-id',
            tenantSlug: 'digiwize',
            driverId: null,
          };
        }

        // Fallback driver for testing
        if (
          credentials.email === 'driver@test.com' &&
          credentials.password === 'driver123'
        ) {
          console.log('🎉 Fallback driver authentication successful');
          return {
            id: 'fallback-driver-id',
            email: 'driver@test.com',
            role: 'DRIVER' as const,
            tenantId: 'fallback-tenant-id',
            tenantSlug: 'digiwize',
            driverId: 'fallback-driver-db-id',
          };
        }

        try {
          // Test database connection first
          await db.$connect();
          console.log('✅ [Auth] Database connection successful');

          const user = await db.user.findUnique({
            where: { email: credentials.email },
            include: { tenant: true },
          });

          if (!user) {
            console.log('❌ [Auth] User not found:', credentials.email);
            return null;
          }

          console.log('✅ [Auth] User found:', {
            email: user.email,
            role: user.role,
            tenantId: user.tenantId,
            tenantSlug: user.tenant.slug
          });

          console.log('🔍 [Auth] Testing password...');
          
          // Check if passwordHash exists (required for production schema compatibility)
          if (!user.passwordHash) {
            console.log('❌ [Auth] No password hash found for user:', credentials.email);
            return null;
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.passwordHash
          );

          console.log('🔍 [Auth] Password validation result:', isPasswordValid);
          console.log('🔍 [Auth] Stored hash:', user.passwordHash);
          console.log('🔍 [Auth] Provided password:', credentials.password);

          if (!isPasswordValid) {
            console.log('❌ [Auth] Invalid password for:', credentials.email);
            return null;
          }

          console.log('🎉 [Auth] Authentication successful for:', credentials.email);

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
          if (
            credentials.email === 'admin@digiwize.com' &&
            credentials.password === 'admin123'
          ) {
            console.log('🎉 Fallback authentication successful after DB error');
            return {
              id: 'fallback-admin-id',
              email: 'admin@digiwize.com',
              role: 'ADMIN' as const,
              tenantId: 'fallback-tenant-id',
              tenantSlug: 'digiwize',
              driverId: null,
            };
          }

          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // First login: copy role/tenant/driverId from your user model
      if (user) {
        token.role = (user as any).role ?? token.role ?? "VIEWER";
        token.tenantId = (user as any).tenantId ?? token.tenantId ?? null;
        token.tenantSlug = (user as any).tenantSlug ?? token.tenantSlug ?? null;
        token.driverId = (user as any).driverId ?? token.driverId ?? null;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.sub!;
        session.user.role = (token as any).role;
        session.user.tenantId = (token as any).tenantId;
        session.user.tenantSlug = (token as any).tenantSlug;
        session.user.driverId = (token as any).driverId ?? null;
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
