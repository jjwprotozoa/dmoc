// src/server/api/routers/tracking.ts
// NOTE: tenant filtering standardized via buildTenantWhere(...).
import { z } from 'zod';
import { db } from '@/lib/db';
import { buildTenantWhere } from '../utils/tenant';
import { protectedProcedure, router } from '../trpc';

export const trackingRouter = router({
  getDevices: protectedProcedure.query(async ({ ctx }) => {
    const where = buildTenantWhere(ctx);

    const devices = await db.device.findMany({
      where,
      include: {
        locationPings: {
          orderBy: { timestamp: 'desc' },
          take: 1,
        },
      },
    });

    return devices;
  }),

  getLocationHistory: protectedProcedure
    .input(
      z.object({
        deviceId: z.string(),
        from: z.date().optional(),
        to: z.date().optional(),
        limit: z.number().default(100),
      })
    )
    .query(async ({ ctx, input }) => {
      // Verify device belongs to tenant before querying location pings
      const device = await db.device.findFirst({
        where: buildTenantWhere(ctx, { id: input.deviceId }),
      });

      if (!device) {
        throw new Error('Device not found or access denied');
      }

      // LocationPing is scoped through Device relation
      const pings = await db.locationPing.findMany({
        where: {
          deviceId: input.deviceId,
          timestamp: {
            gte: input.from,
            lte: input.to,
          },
        },
        orderBy: { timestamp: 'desc' },
        take: input.limit,
      });

      return pings;
    }),

  getLatestPings: protectedProcedure
    .input(
      z.object({
        deviceIds: z.array(z.string()).optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      // LocationPing is scoped through Device relation
      const deviceWhere = buildTenantWhere(ctx, {
        ...(input.deviceIds && { id: { in: input.deviceIds } }),
      });

      const pings = await db.locationPing.findMany({
        where: {
          device: deviceWhere,
        },
        include: {
          device: true,
        },
        orderBy: { timestamp: 'desc' },
        take: 50,
      });

      return pings;
    }),
});
