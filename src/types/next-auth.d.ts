// src/types/next-auth.d.ts
// NextAuth type augmentation for role-based access control

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
      driverId?: string | null; // if role=DRIVER
    };
  }

  interface User {
    role?: "ADMIN" | "MANAGER" | "DISPATCH" | "DRIVER" | "VIEWER";
    tenantId?: string;
    tenantSlug?: string;
    driverId?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: "ADMIN" | "MANAGER" | "DISPATCH" | "DRIVER" | "VIEWER";
    tenantId?: string;
    tenantSlug?: string;
    driverId?: string | null;
  }
}

