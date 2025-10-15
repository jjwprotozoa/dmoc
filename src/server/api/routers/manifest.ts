// src/server/api/routers/manifest.ts
import { z } from 'zod';
import { protectedProcedure, router } from '../trpc';

export const manifestRouter = router({
  getAll: protectedProcedure
    .input(z.object({
      companyId: z.string().optional(),
      status: z.enum(['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).optional(),
    }))
    .query(async ({ ctx, input }) => {
      const manifests = await ctx.db.manifest.findMany({
        where: {
          companyId: input.companyId,
          status: input.status,
        },
        include: {
          company: true,
          stops: {
            orderBy: { order: 'asc' },
          },
        },
        orderBy: { scheduledAt: 'desc' },
      });

      return manifests;
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const manifest = await ctx.db.manifest.findUnique({
        where: { id: input.id },
        include: {
          company: true,
          stops: {
            orderBy: { order: 'asc' },
          },
        },
      });

      if (!manifest) {
        throw new Error('Manifest not found');
      }

      return manifest;
    }),

  create: protectedProcedure
    .input(z.object({
      companyId: z.string(),
      title: z.string(),
      scheduledAt: z.date(),
      stops: z.array(z.object({
        order: z.number(),
        location: z.object({
          lat: z.number(),
          lng: z.number(),
        }),
      })),
    }))
    .mutation(async ({ ctx, input }) => {
      const manifest = await ctx.db.manifest.create({
        data: {
          companyId: input.companyId,
          title: input.title,
          scheduledAt: input.scheduledAt,
          stops: {
            create: input.stops,
          },
        },
        include: {
          stops: true,
        },
      });

      return manifest;
    }),

  updateStatus: protectedProcedure
    .input(z.object({
      id: z.string(),
      status: z.enum(['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']),
    }))
    .mutation(async ({ ctx, input }) => {
      const manifest = await ctx.db.manifest.update({
        where: { id: input.id },
        data: { status: input.status },
      });

      return manifest;
    }),
});
