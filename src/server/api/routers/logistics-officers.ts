// src/server/api/routers/logistics-officers.ts
// Logistics Officers tRPC router: listing, filtering, active/inactive search
import { Prisma } from '@prisma/client';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { db } from '../../../lib/db';
import { protectedProcedure, router } from '../trpc';

// Helper – ensure tenant isolation, but allow admin to see everything
function whereTenant(tenantId: string, userRole?: string) {
  // If user is ADMIN, don't filter by tenant (can see everything)
  if (userRole === 'ADMIN') {
    console.log(
      '🔓 [Admin] Bypassing tenant isolation - can see all logistics officers'
    );
    return {};
  }
  return { tenantId };
}

export const logisticsOfficersRouter = router({
  // List officers with all fields and count/paging, now with isActive filter
  list: protectedProcedure
    .input(
      z.object({
        search: z.string().optional(),
        country: z.string().optional(),
        isActive: z.boolean().optional(),
        skip: z.number().optional().default(0),
        take: z.number().optional().default(24),
      })
    )
    .query(async ({ ctx, input }) => {
      const tenantId = ctx.session.user.tenantId;
      if (!tenantId) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Tenant ID not found in session',
        });
      }

      const baseWhere = whereTenant(tenantId, ctx.session.user.role);

      // Always exclude digiwize tenant (it's admin-only, not a logistics tenant)
      const where: Prisma.LogisticsOfficerWhereInput = {
        ...baseWhere,
        tenant: {
          slug: { not: 'digiwize' },
        },
      };

      if (input.search) {
        // Use type assertion for mode property (PostgreSQL supports it, SQLite ignores it)
        where.OR = [
          {
            name: {
              contains: input.search,
              mode: 'insensitive',
            } as Prisma.StringFilter,
          },
          {
            phone: {
              contains: input.search,
              mode: 'insensitive',
            } as Prisma.StringNullableFilter,
          },
          {
            email: {
              contains: input.search,
              mode: 'insensitive',
            } as Prisma.StringNullableFilter,
          },
        ];
      }

      if (typeof input.isActive === 'boolean') {
        where.isActive = input.isActive;
      }

      if (input.country) {
        where.countryOfOrigin = {
          contains: input.country,
          mode: 'insensitive',
        } as Prisma.StringNullableFilter;
      }

      const [total, officers] = await Promise.all([
        db.logisticsOfficer.count({ where }),
        db.logisticsOfficer.findMany({
          where,
          skip: input.skip,
          take: input.take,
          orderBy: [{ name: 'asc' }],
          // Don't include tenant - we're not showing it in cards anymore
        }),
      ]);
      return {
        total,
        officers: officers.map((officer) => ({
          id: officer.id,
          tenantId: officer.tenantId,
          name: officer.name,
          role: officer.role,
          email: officer.email,
          phone: officer.phone,
          contactNr: officer.contactNr, // Legacy contact number
          idNumber: officer.idNumber, // Legacy ID number
          pictureLoaded: officer.pictureLoaded, // Picture loaded status
          countryOfOrigin: officer.countryOfOrigin, // Country of origin
          displayValue: officer.displayValue, // Display value
          isActive: officer.isActive,
          createdAt: officer.createdAt,
          updatedAt: officer.updatedAt,
        })),
      };
    }),
});
