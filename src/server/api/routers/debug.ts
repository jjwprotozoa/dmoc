// src/server/api/routers/debug.ts
// Dev-only debug endpoint for multi-tenant debugging
import { TRPCError } from '@trpc/server';
import { protectedProcedure, router } from '../trpc';
import { buildTenantWhere } from '../utils/tenant';

export const debugRouter = router({
  tenantView: protectedProcedure.query(async ({ ctx }) => {
    // Only available in development
    if (process.env.NODE_ENV !== 'development') {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'Debug endpoints are only available in development',
      });
    }

    const user = ctx.session?.user;
    if (!user) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Session required',
      });
    }

    // Build sample where clause to show what filter would be applied
    const sampleWhere = buildTenantWhere(ctx, { status: 'ACTIVE' });

    return {
      session: {
        userId: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        tenantId: user.tenantId,
        tenantSlug: user.tenantSlug,
      },
      tenantFilter: {
        applied: sampleWhere,
        hasTenantId: 'tenantId' in sampleWhere,
        tenantIdValue:
          'tenantId' in sampleWhere ? sampleWhere.tenantId : undefined,
      },
      adminBypass: {
        active: user.role === 'ADMIN',
        message:
          user.role === 'ADMIN'
            ? 'Admin bypass active - no tenant filter applied'
            : `Tenant filter active - filtering by tenantId: ${user.tenantId}`,
      },
    };
  }),
});
