// src/server/api/utils/tenant.ts
// Shared tenant isolation utilities for all tRPC routers
//
// CRITICAL: ALL routers MUST use these utilities instead of hardcoding
// { tenantId: ctx.session.user.tenantId } or manual tenant filtering.
//
// This ensures:
// - Consistent admin bypass logic (ADMIN role can see all tenants)
// - Proper tenant isolation for non-admin users
// - Type safety with Prisma where clauses
// - Centralized tenant validation logic

import type { Prisma } from '@prisma/client';
import { TRPCError } from '@trpc/server';
import type { Context } from '../trpc';

/**
 * Builds a Prisma where clause with tenant isolation.
 *
 * Rules:
 * - If user is Digiwize admin (tenantSlug === 'digiwize' OR role in ['ADMIN', 'ADMINISTRATOR', 'SUPER_ADMIN', 'DIGIWIZE_ADMIN']):
 *   returns extra only (no tenant filter, can see all tenants)
 * - If user is not Digiwize admin: returns { tenantId: user.tenantId, ...extra }
 *
 * @param ctx - tRPC context containing session
 * @param extra - Additional where conditions to merge (optional)
 * @returns Prisma where object with tenant isolation applied
 *
 * @example
 * // Basic usage - just tenant isolation
 * const where = buildTenantWhere(ctx);
 *
 * @example
 * // With additional filters
 * const where = buildTenantWhere(ctx, {
 *   status: 'ACTIVE',
 *   name: { contains: 'search' }
 * });
 *
 * @example
 * // In a query
 * const items = await db.model.findMany({
 *   where: buildTenantWhere(ctx, { status: 'ACTIVE' })
 * });
 */
export function buildTenantWhere<T extends Record<string, unknown>>(
  ctx: Context,
  extra?: T
): T & { tenantId?: string } {
  // Type guard: ensure session and user exist
  if (!ctx.session || !ctx.session.user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Session required for tenant isolation',
    });
  }

  const userRole = ctx.session.user.role;
  const tenantId = ctx.session.user.tenantId;
  const tenantSlug = ctx.session.user.tenantSlug?.toLowerCase();

  // Normalize role to uppercase for comparison (handle case sensitivity issues)
  const normalizedRole =
    typeof userRole === 'string' ? userRole.toUpperCase() : userRole;

  // Check if user is a Digiwize admin (can see all tenants)
  // Digiwize admins are identified by:
  // 1. tenantSlug === 'digiwize' OR
  // 2. role in ['ADMIN', 'ADMINISTRATOR', 'SUPER_ADMIN', 'DIGIWIZE_ADMIN']
  const isDigiwizeTenant = tenantSlug === 'digiwize';
  const isAdminRole = [
    'ADMIN',
    'ADMINISTRATOR',
    'SUPER_ADMIN',
    'DIGIWIZE_ADMIN',
  ].includes(normalizedRole || '');
  const isDigiwizeAdmin = isDigiwizeTenant || isAdminRole;

  // Debug logging for admin role detection
  console.log('🔍 [buildTenantWhere] User role check:', {
    userRole,
    normalizedRole,
    tenantSlug,
    isDigiwizeTenant,
    isAdminRole,
    isDigiwizeAdmin,
    roleType: typeof userRole,
    tenantId,
    email: ctx.session.user.email,
  });

  // Digiwize admins bypass tenant isolation - can see all tenants
  if (isDigiwizeAdmin) {
    console.log(
      '✅ [buildTenantWhere] Digiwize admin bypass active - no tenant filter'
    );
    // Return extra only, no tenant filter
    return (extra ?? {}) as T & { tenantId?: string };
  }

  // Non-admin users: require tenantId and apply tenant filter
  if (!tenantId) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Tenant ID is required for non-admin users',
    });
  }

  // Merge tenantId with extra conditions
  return {
    tenantId,
    ...(extra ?? {}),
  } as T & { tenantId: string };
}

/**
 * Gets the current user's tenant ID with validation.
 *
 * Throws TRPCError if:
 * - Session or user is missing
 * - User is not ADMIN and tenantId is missing
 *
 * @param ctx - tRPC context containing session
 * @returns The user's tenantId (string, never undefined)
 *
 * @example
 * // Get tenantId for mutations
 * const tenantId = getTenantId(ctx);
 * await db.model.create({
 *   data: { tenantId, ...otherData }
 * });
 */
export function getTenantId(ctx: Context): string {
  // Type guard: ensure session and user exist
  if (!ctx.session || !ctx.session.user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Session required',
    });
  }

  const tenantId = ctx.session.user.tenantId;

  // ADMIN users might not have tenantId (they can work across tenants)
  // But for mutations, we might still need a tenantId
  // For now, we'll require it even for admins
  if (!tenantId) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Tenant ID is required',
    });
  }

  return tenantId;
}

/**
 * Type helper for Prisma where clauses with tenant isolation.
 * Use this when you need to type a where clause that includes tenant filtering.
 */
export type TenantWhereInput<T extends Prisma.JsonObject> = T & {
  tenantId?: string;
};
