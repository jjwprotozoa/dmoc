// src/server/api/routers/clients.ts
import { Prisma } from '@prisma/client';
import { z } from 'zod';
import { db } from '../../../lib/db';
import { protectedProcedure, router } from '../trpc';

export const clientsRouter = router({
  // Get all clients for a tenant
  getAll: protectedProcedure
    .input(
      z.object({
        search: z.string().optional(),
        type: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { search, type } = input;

      const where: Prisma.ClientWhereInput = {
        tenantId: ctx.session.user.tenantId,
      };

      if (search) {
        where.OR = [
          { name: { contains: search } },
          { address: { contains: search } },
          { displayValue: { contains: search } },
        ];
      }

      if (type) {
        where.entityTypeDescription = type;
      }

      const clients = await db.client.findMany({
        where,
        orderBy: { createdAt: 'desc' },
      });

      return clients;
    }),

  // Get client by ID
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const client = await db.client.findFirst({
        where: {
          id: input.id,
          tenantId: ctx.session.user.tenantId,
        },
      });

      if (!client) {
        throw new Error('Client not found');
      }

      return client;
    }),

  // Create new client
  create: protectedProcedure
    .input(
      z.object({
        companyId: z.number(),
        companyTypeId: z.number().optional(),
        entityTypeDescription: z.string(),
        name: z.string(),
        address: z.string().optional(),
        displayValue: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const client = await db.client.create({
        data: {
          tenantId: ctx.session.user.tenantId,
          ...input,
        },
      });

      return client;
    }),

  // Update client
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().optional(),
        contactInfo: z.any().optional(),
        status: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input;

      const client = await db.client.updateMany({
        where: {
          id,
          tenantId: ctx.session.user.tenantId,
        },
        data: updateData,
      });

      return client;
    }),

  // Delete client
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const client = await db.client.deleteMany({
        where: {
          id: input.id,
          tenantId: ctx.session.user.tenantId,
        },
      });

      return client;
    }),

  // Get client statistics
  getStats: protectedProcedure.query(async ({ ctx }) => {
    const [totalClients, clientsWithAddress, thisMonthClients] =
      await Promise.all([
        db.client.count({
          where: { tenantId: ctx.session.user.tenantId },
        }),
        db.client.count({
          where: {
            tenantId: ctx.session.user.tenantId,
            address: { not: '' },
          },
        }),
        db.client.count({
          where: {
            tenantId: ctx.session.user.tenantId,
            createdAt: {
              gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
            },
          },
        }),
      ]);

    // Get unique locations
    const locations = await db.client.groupBy({
      by: ['address'],
      where: {
        tenantId: ctx.session.user.tenantId,
        address: { not: '' },
      },
      _count: true,
    });

    return {
      totalClients,
      clientsWithAddress,
      thisMonthClients,
      uniqueLocations: locations.length,
    };
  }),

  // Get clients by location
  getByLocation: protectedProcedure
    .input(z.object({ location: z.string() }))
    .query(async ({ ctx, input }) => {
      const clients = await db.client.findMany({
        where: {
          tenantId: ctx.session.user.tenantId,
          address: { contains: input.location },
        },
        orderBy: { name: 'asc' },
      });

      return clients;
    }),

  // Search clients
  search: protectedProcedure
    .input(
      z.object({
        query: z.string().min(1),
        limit: z.number().min(1).max(50).default(10),
      })
    )
    .query(async ({ ctx, input }) => {
      const clients = await db.client.findMany({
        where: {
          tenantId: ctx.session.user.tenantId,
          OR: [
            { name: { contains: input.query } },
            { address: { contains: input.query } },
            { displayValue: { contains: input.query } },
          ],
        },
        take: input.limit,
        orderBy: { name: 'asc' },
      });

      return clients;
    }),
});
