// src/server/api/routers/offenses.ts
// NOTE: Offenses are filtered by driver/vehicle's current tenant, not offense.tenantId.
// This allows tenants to see offense history when drivers/vehicles move between tenants.
// Admin can see all offenses across all tenants.
import { Prisma } from '@prisma/client';
import { z } from 'zod';
import { db } from '@/lib/db';
import { buildTenantWhere, getTenantId } from '../utils/tenant';
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
      // Build where clause for offenses
      // IMPORTANT: Offenses are visible based on driver/vehicle's current tenant,
      // not the offense's tenantId. This allows cross-tenant visibility when
      // drivers/vehicles move between tenants.
      const userRole = ctx.session.user.role;
      const tenantId = ctx.session.user.tenantId;

      // Build base where clause
      const where: Prisma.OffenseWhereInput = {
        ...(input.driverId && { driverId: input.driverId }),
        ...(input.vehicleId && { vehicleId: input.vehicleId }),
        ...(input.severity && { severity: input.severity }),
      };

      // For non-admin users: filter by driver/vehicle's current tenant
      // This ensures offenses follow the driver/vehicle, not where they were created.
      // Example: If Driver X had offenses in Tenant A, then moved to Tenant B,
      // Tenant B will see those offenses because the driver's current tenantId is B.
      // Normalize role to uppercase to match buildTenantWhere behavior
      const normalizedRole = typeof userRole === 'string' ? userRole.toUpperCase() : userRole;
      if (normalizedRole !== 'ADMIN' && tenantId) {
        // Show offenses where the driver OR vehicle currently belongs to this tenant
        // This handles all cases:
        // - Offense with driver only: show if driver.tenantId matches
        // - Offense with vehicle only: show if vehicle.tenantId matches
        // - Offense with both: show if either matches
        where.OR = [
          { driver: { tenantId } },
          { vehicle: { tenantId } },
        ];
      }
      // For ADMIN: no tenant filter (can see all offenses across all tenants)

      // If driverId or vehicleId is provided, verify it belongs to the tenant
      if (input.driverId) {
        const driver = await db.driver.findFirst({
          where: buildTenantWhere(ctx, { id: input.driverId }),
        });
        if (!driver) {
          throw new Error('Driver not found or access denied');
        }
      }

      if (input.vehicleId) {
        const vehicle = await db.vehicle.findFirst({
          where: buildTenantWhere(ctx, { id: input.vehicleId }),
        });
        if (!vehicle) {
          throw new Error('Vehicle not found or access denied');
        }
      }

      const offenses = await db.offense.findMany({
        where,
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
      const tenantId = getTenantId(ctx);

      // Verify driver belongs to tenant if provided
      if (input.driverId) {
        const driver = await db.driver.findFirst({
          where: buildTenantWhere(ctx, { id: input.driverId }),
        });
        if (!driver) {
          throw new Error('Driver not found or access denied');
        }
      }

      // Verify vehicle belongs to tenant if provided
      if (input.vehicleId) {
        const vehicle = await db.vehicle.findFirst({
          where: buildTenantWhere(ctx, { id: input.vehicleId }),
        });
        if (!vehicle) {
          throw new Error('Vehicle not found or access denied');
        }
      }

      const offense = await db.offense.create({
        data: {
          tenantId,
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
