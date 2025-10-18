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
      try {
        if (!ctx.db) {
          console.warn('Database not available, returning empty array');
          return [];
        }

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
      } catch (error) {
        console.error('Error fetching offenses:', error);
        return [];
      }
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
      try {
        if (!ctx.db) {
          throw new Error('Database not available');
        }

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
      } catch (error) {
        console.error('Error creating offense:', error);
        throw error;
      }
    }),
});
