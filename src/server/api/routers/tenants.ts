// src/server/api/routers/tenants.ts
import { z } from 'zod';
import { adminProcedure, router } from '../trpc';

export const tenantsRouter = router({
  getAll: adminProcedure.query(async ({ ctx }) => {
    try {
      if (!ctx.db) {
        console.warn('Database not available, returning empty array');
        return [];
      }

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
    } catch (error) {
      console.error('Error fetching tenants:', error);
      return [];
    }
  }),

  getById: adminProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      try {
        if (!ctx.db) {
          throw new Error('Database not available');
        }

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
      } catch (error) {
        console.error('Error fetching tenant:', error);
        throw error;
      }
    }),

  create: adminProcedure
    .input(
      z.object({
        name: z.string(),
        slug: z.string(),
        settings: z.record(z.any()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        if (!ctx.db) {
          throw new Error('Database not available');
        }

        const tenant = await ctx.db.tenant.create({
          data: {
            name: input.name,
            slug: input.slug,
            settings: JSON.stringify(input.settings || {}),
          },
        });

        return tenant;
      } catch (error) {
        console.error('Error creating tenant:', error);
        throw error;
      }
    }),

  update: adminProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().optional(),
        slug: z.string().optional(),
        settings: z.record(z.any()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        if (!ctx.db) {
          throw new Error('Database not available');
        }

        const { id, ...inputData } = input;

        // Prepare data with proper type conversion
        const data: {
          name?: string;
          slug?: string;
          settings?: string;
        } = {};

        if (inputData.name !== undefined) {
          data.name = inputData.name;
        }
        if (inputData.slug !== undefined) {
          data.slug = inputData.slug;
        }
        if (inputData.settings !== undefined) {
          data.settings = JSON.stringify(inputData.settings);
        }

        const tenant = await ctx.db.tenant.update({
          where: { id },
          data,
        });

        return tenant;
      } catch (error) {
        console.error('Error updating tenant:', error);
        throw error;
      }
    }),
});
