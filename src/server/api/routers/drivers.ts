// src/server/api/routers/drivers.ts
import { Prisma } from '@prisma/client';
import { z } from 'zod';
import { db } from '../../../lib/db';
import { protectedProcedure, router } from '../trpc';

export const driversRouter = router({
  // Get all drivers for a tenant
  getAll: protectedProcedure
    .input(
      z.object({
        search: z.string().optional(),
        country: z.string().optional(),
        active: z.boolean().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { search, country, active } = input;

      const where: Prisma.DriverWhereInput = {
        tenantId: ctx.session.user.tenantId,
      };

      if (search) {
        where.OR = [
          { name: { contains: search } },
          { contactNr: { contains: search } },
          { idNumber: { contains: search } },
          { countryOfOrigin: { contains: search } },
        ];
      }

      if (country) {
        where.countryOfOrigin = country;
      }

      if (active !== undefined) {
        where.active = active;
      }

      const drivers = await db.driver.findMany({
        where,
        orderBy: { createdAt: 'desc' },
      });

      return drivers;
    }),

  // Get driver by ID
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const driver = await db.driver.findFirst({
        where: {
          id: input.id,
          tenantId: ctx.session.user.tenantId,
        },
        include: {
          offenses: {
            orderBy: { createdAt: 'desc' },
            take: 10,
          },
        },
      });

      if (!driver) {
        throw new Error('Driver not found');
      }

      return driver;
    }),

  // Update driver information
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().optional(),
        contactNr: z.string().optional(),
        idNumber: z.string().optional(),
        countryOfOrigin: z.string().optional(),
        active: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input;

      const driver = await db.driver.updateMany({
        where: {
          id,
          tenantId: ctx.session.user.tenantId,
        },
        data: updateData,
      });

      return driver;
    }),

  // Add offense for driver
  addOffense: protectedProcedure
    .input(
      z.object({
        driverId: z.string(),
        kind: z.enum([
          'SPEEDING',
          'PARKING_VIOLATION',
          'TRAFFIC_VIOLATION',
          'SAFETY_VIOLATION',
          'OTHER',
        ]),
        severity: z
          .enum(['MINOR', 'MODERATE', 'MAJOR', 'CRITICAL'])
          .default('MINOR'),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const driver = await db.driver.findFirst({
        where: {
          id: input.driverId,
          tenantId: ctx.session.user.tenantId,
        },
      });

      if (!driver) {
        throw new Error('Driver not found');
      }

      const offense = await db.offense.create({
        data: {
          driverId: input.driverId,
          kind: input.kind,
          severity: input.severity,
          notes: input.notes,
        },
      });

      return offense;
    }),

  // Get driver statistics
  getStats: protectedProcedure.query(async ({ ctx }) => {
    const [totalDrivers, activeDrivers, driversWithOffenses, countries] =
      await Promise.all([
        db.driver.count({
          where: { tenantId: ctx.session.user.tenantId },
        }),
        db.driver.count({
          where: {
            tenantId: ctx.session.user.tenantId,
            active: true,
          },
        }),
        db.driver.count({
          where: {
            tenantId: ctx.session.user.tenantId,
            offenses: {
              some: {},
            },
          },
        }),
        db.driver.groupBy({
          by: ['countryOfOrigin'],
          where: { tenantId: ctx.session.user.tenantId },
          _count: true,
        }),
      ]);

    return {
      totalDrivers,
      activeDrivers,
      driversWithOffenses,
      countries: countries.map((c) => ({
        country: c.countryOfOrigin,
        count: c._count,
      })),
    };
  }),

  // Get drivers by country
  getByCountry: protectedProcedure
    .input(z.object({ country: z.string() }))
    .query(async ({ ctx, input }) => {
      const drivers = await db.driver.findMany({
        where: {
          tenantId: ctx.session.user.tenantId,
          countryOfOrigin: input.country,
        },
        orderBy: { name: 'asc' },
      });

      return drivers;
    }),
});
