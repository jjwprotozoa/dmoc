// src/server/api/routers/vehicles.ts
import { z } from 'zod';
import { db } from '../../../lib/db';
import { protectedProcedure, router } from '../trpc';

export const vehiclesRouter = router({
  // Get all vehicles for a tenant
  getAll: protectedProcedure
    .input(
      z.object({
        search: z.string().optional(),
        type: z.enum(['horses', 'trailers', 'all']).optional(),
        status: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { search, type, status } = input;

      const where: any = {
        tenantId: ctx.session.user.tenantId,
      };

      if (search) {
        where.OR = [
          { registration: { contains: search } },
          { countryOfOrigin: { contains: search } },
          { entityTypeDescription: { contains: search } },
          { currentDriver: { contains: search } },
          { location: { contains: search } },
        ];
      }

      if (type && type !== 'all') {
        where.entityTypeDescription = type === 'horses' ? 'HORSE' : 'TRAILER';
      }

      if (status) {
        where.status = status;
      }

      const vehicles = await db.vehicle.findMany({
        where,
        orderBy: { createdAt: 'desc' },
      });

      return vehicles;
    }),

  // Get vehicle by ID
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const vehicle = await db.vehicle.findFirst({
        where: {
          id: input.id,
          tenantId: ctx.session.user.tenantId,
        } as any,
      });

      if (!vehicle) {
        throw new Error('Vehicle not found');
      }

      return vehicle;
    }),

  // Get vehicle statistics
  getStats: protectedProcedure.query(async ({ ctx }) => {
    const [
      totalVehicles,
      activeVehicles,
      horses,
      trailers,
      maintenanceVehicles,
    ] = await Promise.all([
      db.vehicle.count({
        where: { tenantId: ctx.session.user.tenantId } as any,
      }),
      db.vehicle.count({
        where: {
          tenantId: ctx.session.user.tenantId,
          status: 'Active',
        } as any,
      }),
      db.vehicle.count({
        where: {
          tenantId: ctx.session.user.tenantId,
          entityTypeDescription: 'HORSE',
        } as any,
      }),
      db.vehicle.count({
        where: {
          tenantId: ctx.session.user.tenantId,
          entityTypeDescription: 'TRAILER',
        } as any,
      }),
      db.vehicle.count({
        where: {
          tenantId: ctx.session.user.tenantId,
          status: 'Maintenance',
        } as any,
      }),
    ]);

    return {
      totalVehicles,
      activeVehicles,
      horses,
      trailers,
      maintenanceVehicles,
    };
  }),
});
