// src/server/api/routers/offenses.ts
import { z } from 'zod';
import { protectedProcedure, router } from '../trpc';

export const offensesRouter = router({
  getAll: protectedProcedure
    .input(
      z.object({
        driverId: z.string().optional(),
        vehicleId: z.string().optional(),
        severity: z.enum(['MINOR', 'MODERATE', 'MAJOR', 'CRITICAL']).optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const offenses = await ctx.db.offense.findMany({
        where: {
          driverId: input.driverId,
          vehicleId: input.vehicleId,
          severity: input.severity,
        },
        include: {
          driver: true,
          vehicle: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      return offenses;
    }),

  create: protectedProcedure
    .input(
      z.object({
        driverId: z.string().optional(),
        vehicleId: z.string().optional(),
        kind: z.enum([
          'SPEEDING',
          'PARKING_VIOLATION',
          'TRAFFIC_VIOLATION',
          'SAFETY_VIOLATION',
          'OTHER',
        ]),
        severity: z.enum(['MINOR', 'MODERATE', 'MAJOR', 'CRITICAL']),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const offense = await ctx.db.offense.create({
        data: {
          driverId: input.driverId,
          vehicleId: input.vehicleId,
          kind: input.kind,
          severity: input.severity,
          notes: input.notes,
        },
        include: {
          driver: true,
          vehicle: true,
        },
      });

      return offense;
    }),
});
