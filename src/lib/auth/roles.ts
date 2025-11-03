// src/lib/auth/roles.ts
// Role definitions and helper functions for role-based access control

export type AppRole = "ADMIN" | "MANAGER" | "DISPATCH" | "DRIVER" | "VIEWER";

export const isDriver = (r?: string | null): r is "DRIVER" => r === "DRIVER";

export const isAdmin = (r?: string | null): r is "ADMIN" => r === "ADMIN";

export const isStaff = (r?: string | null) =>
  r === "ADMIN" || r === "MANAGER" || r === "DISPATCH";

