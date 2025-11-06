// src/types/next-auth.d.ts
// NextAuth type augmentation for role-based access control
import type { NextAuthOptions } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: "ADMIN" | "MANAGER" | "DISPATCH" | "DRIVER" | "VIEWER";
      tenantId?: string;
      tenantSlug?: string;
      clientId?: string | null; // selected client/company for this session
      driverId?: string | null; // if role=DRIVER
    };
  }

  interface User {
    role?: "ADMIN" | "MANAGER" | "DISPATCH" | "DRIVER" | "VIEWER";
    tenantId?: string;
    tenantSlug?: string;
    clientId?: string | null;
    driverId?: string | null;
  }

  // Fix for NextAuth v4 - getServerSession exists but TypeScript types may not export it
  // This declaration makes it available for import
  export function getServerSession(
    options: NextAuthOptions
  ): Promise<Session | null>;
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: "ADMIN" | "MANAGER" | "DISPATCH" | "DRIVER" | "VIEWER";
    tenantId?: string;
    tenantSlug?: string;
    clientId?: string | null;
    driverId?: string | null;
  }
}

