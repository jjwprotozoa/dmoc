// src/server/api/routers/locations.ts
// Locations router: tenant-scoped CRUD for operational locations

import { z } from 'zod';
import { Prisma } from '@prisma/client';
import { db } from '../../../lib/db';
import { createTRPCRouter, protectedProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';

// Location input schema (without tenantId - derived from session)
const locationInput = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  address: z.string().optional(),
  countryId: z.number().optional(), // Legacy country ID reference
});

export const locationsRouter = createTRPCRouter({
  list: protectedProcedure
    .input(
      z.object({
        search: z.string().optional(),
        take: z.number().min(1).max(100).optional().default(100),
        skip: z.number().min(0).optional().default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      const tenantId = ctx.session.user.tenantId;
      if (!tenantId) {
        throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Tenant ID not found in session' });
      }

      const where: Prisma.LocationWhereInput = {
        tenantId,
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
            description: {
              contains: input.search,
              mode: 'insensitive',
            } as Prisma.StringNullableFilter,
          },
          {
            address: {
              contains: input.search,
              mode: 'insensitive',
            } as Prisma.StringNullableFilter,
          },
        ];
      }

      const [items, total] = await Promise.all([
        db.location.findMany({ where, take: input.take, skip: input.skip, orderBy: { updatedAt: 'desc' } }),
        db.location.count({ where }),
      ]);
      return { items, total };
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const tenantId = ctx.session.user.tenantId;
      if (!tenantId) {
        throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Tenant ID not found in session' });
      }

      const location = await db.location.findFirst({
        where: { id: input.id, tenantId },
      });

      if (!location) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Location not found' });
      }

      return location;
    }),

  create: protectedProcedure.input(locationInput).mutation(async ({ ctx, input }) => {
    const tenantId = ctx.session.user.tenantId;
    if (!tenantId) {
      throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Tenant ID not found in session' });
    }

    try {
      const location = await db.location.create({
        data: {
          tenantId,
          name: input.name,
          description: input.description,
          latitude: input.latitude,
          longitude: input.longitude,
          address: input.address,
          countryId: input.countryId,
        },
      });
      return location;
    } catch (error) {
      console.error('Failed to create location:', error);
      throw new TRPCError({ code: 'BAD_REQUEST', message: 'Failed to create location' });
    }
  }),

  update: protectedProcedure
    .input(
      locationInput.extend({ id: z.string().min(1) })
    )
    .mutation(async ({ ctx, input }) => {
      const tenantId = ctx.session.user.tenantId;
      if (!tenantId) {
        throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Tenant ID not found in session' });
      }

      const { id, ...data } = input;
      const existing = await db.location.findFirst({ where: { id, tenantId } });
      if (!existing) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Location not found' });
      }

      return db.location.update({
        where: { id },
        data,
      });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const tenantId = ctx.session.user.tenantId;
      if (!tenantId) {
        throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Tenant ID not found in session' });
      }

      const existing = await db.location.findFirst({ where: { id: input.id, tenantId } });
      if (!existing) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Location not found' });
      }

      await db.location.delete({ where: { id: input.id } });
      return { ok: true };
    }),
});

