// src/server/api/routers/tracking.ts
import { z } from 'zod';
import { db } from '@/lib/db';
import { protectedProcedure, router } from '../trpc';

export const trackingRouter = router({
  getDevices: protectedProcedure.query(async ({ ctx }) => {
    const devices = await db.device.findMany({
      where: {
        tenantId: ctx.session.user.tenantId,
      },
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
      const pings = await db.locationPing.findMany({
        where: {
          device: {
            tenantId: ctx.session.user.tenantId,
            ...(input.deviceIds && { id: { in: input.deviceIds } }),
          },
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
