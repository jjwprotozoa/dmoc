// src/lib/auth.ts
import * as bcrypt from 'bcrypt';
import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { db } from './db';

// Extend the built-in session types
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      role: string;
      tenantId: string;
      tenantSlug: string;
    };
  }

  interface User {
    id: string;
    email: string;
    role: string;
    tenantId: string;
    tenantSlug: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: string;
    tenantId: string;
    tenantSlug: string;
  }
}

export const authOptions: NextAuthOptions = {
  // adapter: PrismaAdapter(db), // Using JWT strategy instead
  secret: process.env.NEXTAUTH_SECRET || 'your-super-secret-jwt-key-that-is-at-least-32-characters-long',
  debug: process.env.NODE_ENV === 'development',
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

        try {
          const user = await db.user.findUnique({
            where: { email: credentials.email },
            include: { tenant: true },
          });

          if (!user) {
            console.log('❌ User not found:', credentials.email);
            return null;
          }

          console.log('✅ User found:', user.email, 'Role:', user.role);

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.passwordHash
          );

          if (!isPasswordValid) {
            console.log('❌ Invalid password for:', credentials.email);
            return null;
          }

          console.log('🎉 Authentication successful for:', credentials.email);

          return {
            id: user.id,
            email: user.email,
            role: user.role,
            tenantId: user.tenantId,
            tenantSlug: user.tenant.slug,
          };
        } catch (error) {
          console.error('❌ Authentication error:', error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.tenantId = user.tenantId;
        token.tenantSlug = user.tenantSlug;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.sub!;
        session.user.role = token.role;
        session.user.tenantId = token.tenantId;
        session.user.tenantSlug = token.tenantSlug;
      }
      return session;
    },
  },
  pages: {
    signIn: '/sign-in',
  },
};
