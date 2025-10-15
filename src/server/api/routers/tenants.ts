// src/server/api/routers/tenants.ts
import { z } from 'zod';
import { adminProcedure, router } from '../trpc';

export const tenantsRouter = router({
  getAll: adminProcedure
    .query(async ({ ctx }) => {
      const tenants = await ctx.db.tenant.findMany({
        include: {
          organizations: {
            include: {
              companies: true,
            },
          },
          _count: {
            select: {
              users: true,
              devices: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      return tenants;
    }),

  getById: adminProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const tenant = await ctx.db.tenant.findUnique({
        where: { id: input.id },
        include: {
          organizations: {
            include: {
              companies: {
                include: {
                  _count: {
                    select: {
                      drivers: true,
                      vehicles: true,
                      manifests: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!tenant) {
        throw new Error('Tenant not found');
      }

      return tenant;
    }),

  create: adminProcedure
    .input(z.object({
      name: z.string(),
      slug: z.string(),
      settings: z.record(z.any()).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const tenant = await ctx.db.tenant.create({
        data: {
          name: input.name,
          slug: input.slug,
          settings: input.settings || {},
        },
      });

      return tenant;
    }),

  update: adminProcedure
    .input(z.object({
      id: z.string(),
      name: z.string().optional(),
      slug: z.string().optional(),
      settings: z.record(z.any()).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      const tenant = await ctx.db.tenant.update({
        where: { id },
        data,
      });

      return tenant;
    }),
});
