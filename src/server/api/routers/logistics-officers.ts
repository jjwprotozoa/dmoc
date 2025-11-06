// src/server/api/routers/logistics-officers.ts
// Logistics Officers tRPC router: listing, filtering, active/inactive search
// NOTE: tenant filtering standardized via buildTenantWhere(...).
import { Prisma } from '@prisma/client';
import { z } from 'zod';
import { db } from '../../../lib/db';
import { buildTenantWhere } from '../utils/tenant';
import { protectedProcedure, router } from '../trpc';

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
      const baseWhere = buildTenantWhere(ctx);

      // Build where clause - only exclude digiwize tenant for non-admin users
      // Admins should be able to see all logistics officers including digiwize
      const where: Prisma.LogisticsOfficerWhereInput = {
        ...baseWhere,
      };

      // Only exclude digiwize tenant for non-admin users
      // (digiwize is admin-only tenant, but admins should still see its officers)
      // Normalize role to uppercase to match buildTenantWhere behavior
      const userRole = ctx.session.user.role;
      const normalizedRole = typeof userRole === 'string' ? userRole.toUpperCase() : userRole;
      if (normalizedRole !== 'ADMIN') {
        where.tenant = {
          slug: { not: 'digiwize' },
        };
      }

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
