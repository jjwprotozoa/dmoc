// src/server/api/routers/logistics-officers.ts
// Logistics Officers tRPC router: listing, filtering, active/inactive search
import { z } from 'zod';
import { db } from '../../../lib/db';
import { publicProcedure, router } from '../trpc';

export const logisticsOfficersRouter = router({
  // List officers with all fields and count/paging, now with isActive filter
  list: publicProcedure.input(z.object({
    search: z.string().optional(),
    tenantId: z.string().optional(),
    country: z.string().optional(),
    isActive: z.boolean().optional(),
    skip: z.number().optional().default(0),
    take: z.number().optional().default(24),
  })).query(async ({ input }) => {
    const where: any = {};
    if (input.search) {
      where.OR = [
        { name: { contains: input.search } },
        { phone: { contains: input.search } },
      ];
    }
    if (input.tenantId) {
      where.tenantId = input.tenantId;
    }
    if (typeof input.isActive === 'boolean') {
      where.isActive = input.isActive;
    }
    // TODO: Robust country filter if needed
    const [total, officers] = await Promise.all([
      db.logisticsOfficer.count({ where }),
      db.logisticsOfficer.findMany({
        where,
        skip: input.skip,
        take: input.take,
        orderBy: [{ name: 'asc' }],
        include: {
          tenant: { select: { id: true, name: true, slug: true } },
        },
      })
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
        isActive: officer.isActive,
        createdAt: officer.createdAt,
        updatedAt: officer.updatedAt,
        tenant:
          officer.tenant
            ? {
                label: officer.tenant.name,
                color:
                  officer.tenant.slug === 'cobra'
                    ? 'blue'
                    : officer.tenant.slug === 'delta'
                    ? 'amber'
                    : 'gray',
              }
            : { label: '', color: 'gray' },
      })),
    };
  }),
});
