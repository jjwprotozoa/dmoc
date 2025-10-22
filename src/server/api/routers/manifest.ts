// src/server/api/routers/manifest.ts
import { z } from 'zod';
import { protectedProcedure, router } from '../trpc';

export const manifestRouter = router({
  list: protectedProcedure
    .input(
      z.object({
        q: z.string().optional(),
        status: z.array(z.string()).optional(),
        take: z.number().min(1).max(200).default(50),
        skip: z.number().min(0).default(0),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const tenantId = ctx.session.user.tenantId;
      
      // Build where clause with tenant isolation
      const where: any = {
        company: {
          organization: {
            tenantId: tenantId
          }
        }
      };

      if (input?.q) {
        where.OR = [
          { title: { contains: input.q, mode: "insensitive" } },
        ];
      }
      if (input?.status && input.status.length) {
        where.status = { in: input.status };
      }

      const [items, total] = await Promise.all([
        ctx.db.manifest.findMany({
          where,
          take: input?.take ?? 50,
          skip: input?.skip ?? 0,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            title: true,
            status: true,
            scheduledAt: true,
            createdAt: true,
            companyId: true,
            company: {
              select: {
                id: true,
                name: true,
              }
            }
          },
        }),
        ctx.db.manifest.count({ where }),
      ]);

      return { items, total };
    }),

  getAll: protectedProcedure
    .input(
      z.object({
        companyId: z.string().optional(),
        status: z
          .enum(['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'])
          .optional(),
      })
    )
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
    .input(
      z.object({
        companyId: z.string(),
        title: z.string(),
        scheduledAt: z.date(),
        stops: z.array(
          z.object({
            order: z.number(),
            location: z.object({
              lat: z.number(),
              lng: z.number(),
            }),
          })
        ),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const manifest = await ctx.db.manifest.create({
        data: {
          companyId: input.companyId,
          title: input.title,
          scheduledAt: input.scheduledAt,
          stops: {
            create: input.stops.map((stop) => ({
              order: stop.order,
              location: JSON.stringify(stop.location),
            })),
          },
        },
        include: {
          stops: true,
        },
      });

      return manifest;
    }),

  updateStatus: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        status: z.enum(['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const manifest = await ctx.db.manifest.update({
        where: { id: input.id },
        data: { status: input.status },
      });

      return manifest;
    }),
});
