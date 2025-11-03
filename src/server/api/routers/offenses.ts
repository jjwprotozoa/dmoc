// src/server/api/routers/offenses.ts
import { z } from 'zod';
import { db } from '@/lib/db';
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
      // Note: Offense model doesn't have tenantId, so we filter through driver/vehicle relations
      // If driverId is provided, ensure driver belongs to tenant
      // If vehicleId is provided, ensure vehicle belongs to tenant
      const whereClause: {
        driverId?: string;
        vehicleId?: string;
        severity?: string;
      } = {};

      if (input.driverId) {
        // Verify driver belongs to tenant
        const driver = await db.driver.findFirst({
          where: {
            id: input.driverId,
            tenantId: ctx.session.user.tenantId,
          },
        });
        if (!driver) {
          throw new Error('Driver not found or access denied');
        }
        whereClause.driverId = input.driverId;
      }

      if (input.vehicleId) {
        // Verify vehicle belongs to tenant
        const vehicle = await db.vehicle.findFirst({
          where: {
            id: input.vehicleId,
            tenantId: ctx.session.user.tenantId,
          },
        });
        if (!vehicle) {
          throw new Error('Vehicle not found or access denied');
        }
        whereClause.vehicleId = input.vehicleId;
      }

      if (input.severity) {
        whereClause.severity = input.severity;
      }

      const offenses = await db.offense.findMany({
        where: whereClause,
        include: {
          driver: true,
          vehicle: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      // Filter results to only show offenses for drivers/vehicles in this tenant
      // (additional security layer in case of data inconsistency)
      const tenantId = ctx.session.user.tenantId;
      const filteredOffenses = offenses.filter((offense) => {
        if (offense.driver && offense.driver.tenantId !== tenantId) {
          return false;
        }
        if (offense.vehicle && offense.vehicle.tenantId !== tenantId) {
          return false;
        }
        return true;
      });

      return filteredOffenses;
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
      const tenantId = ctx.session.user.tenantId;

      // Verify driver belongs to tenant if provided
      if (input.driverId) {
        const driver = await db.driver.findFirst({
          where: {
            id: input.driverId,
            tenantId,
          },
        });
        if (!driver) {
          throw new Error('Driver not found or access denied');
        }
      }

      // Verify vehicle belongs to tenant if provided
      if (input.vehicleId) {
        const vehicle = await db.vehicle.findFirst({
          where: {
            id: input.vehicleId,
            tenantId,
          },
        });
        if (!vehicle) {
          throw new Error('Vehicle not found or access denied');
        }
      }

      const offense = await db.offense.create({
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
